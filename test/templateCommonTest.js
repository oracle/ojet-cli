/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const commonTemplate = require('../common/template/common');

// JET-79009: Covers Zip Slip handling for user-provided template ZIP archives.
// adm-zip has been upgraded to a version with Zip Slip protection, and ojet-cli
// also performs explicit caller-side canonicalization before extraction. These
// tests build minimal raw ZIP files with '../outside.txt' entries because
// Admzip.addFile() normalizes traversal names during test setup. Each test then
// passes the crafted archive through commonTemplate._handleZippedTemplateArchive()
// using the same destination shape as app creation: appRoot/src. Including
// src/index.html exercises the new-format branch, while omitting src/ exercises
// the deprecated-format branch. The assertions verify ojet-cli rejects traversal
// entries before extraction and does not create files outside the intended root.
describe('Template archive extraction', () => {
  let tempDir;
  let appRoot;
  let srcRoot;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ojet-template-'));
    appRoot = path.join(tempDir, 'app');
    srcRoot = path.join(appRoot, 'src');
    fs.mkdirSync(srcRoot, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function _createLocalFileHeader(entryName, offset) {
    // Write a minimal ZIP local file header. We intentionally create the ZIP
    // by hand because Admzip.addFile() normalizes '../' out of entry names.
    const entryNameBuffer = Buffer.from(entryName);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(entryNameBuffer.length, 26);
    return {
      name: entryName,
      offset,
      buffer: Buffer.concat([header, entryNameBuffer])
    };
  }

  function _createCentralDirectoryHeader(entry) {
    // Mirror the entry in the central directory so adm-zip reads the raw
    // entry name exactly as provided by the test.
    const entryNameBuffer = Buffer.from(entry.name);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(entryNameBuffer.length, 28);
    header.writeUInt32LE(entry.offset, 42);
    return Buffer.concat([header, entryNameBuffer]);
  }

  function _writeRawZip(entryNames) {
    // The payloads are empty files; the security-relevant part is the entry
    // path, not file contents.
    let offset = 0;
    const entries = entryNames.map((entryName) => {
      const entry = _createLocalFileHeader(entryName, offset);
      offset += entry.buffer.length;
      return entry;
    });
    const centralDirectory = Buffer.concat(entries.map(_createCentralDirectoryHeader));
    const endOfCentralDirectory = Buffer.alloc(22);
    endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
    endOfCentralDirectory.writeUInt16LE(entries.length, 8);
    endOfCentralDirectory.writeUInt16LE(entries.length, 10);
    endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12);
    endOfCentralDirectory.writeUInt32LE(offset, 16);

    const zipPath = path.join(tempDir, 'template.zip');
    fs.writeFileSync(zipPath, Buffer.concat([
      ...entries.map(entry => entry.buffer),
      centralDirectory,
      endOfCentralDirectory
    ]));
    return zipPath;
  }

  it('rejects traversal entries in new-format archives', () => {
    // Presence of src/ selects the new-format branch, whose extraction root is
    // the app root. The traversal entry should be rejected before extraction.
    const zipPath = _writeRawZip(['src/index.html', '../outside.txt']);

    assert.throws(
      () => commonTemplate._handleZippedTemplateArchive(zipPath, srcRoot),
      /Refusing to extract '\.\.\/outside\.txt' outside target directory/
    );

    assert.strictEqual(fs.existsSync(path.join(tempDir, 'outside.txt')), false);
    assert.strictEqual(fs.existsSync(path.join(appRoot, 'outside.txt')), false);
  });

  it('rejects traversal entries in deprecated-format archives', () => {
    // Without src/, deprecated-format entries extract under the src directory.
    // The traversal entry should be rejected before extraction.
    const zipPath = _writeRawZip(['../outside.txt']);

    assert.throws(
      () => commonTemplate._handleZippedTemplateArchive(zipPath, srcRoot),
      /Refusing to extract '\.\.\/outside\.txt' outside target directory/
    );

    assert.strictEqual(fs.existsSync(path.join(appRoot, 'outside.txt')), false);
    assert.strictEqual(fs.existsSync(path.join(srcRoot, 'outside.txt')), false);
  });
});
