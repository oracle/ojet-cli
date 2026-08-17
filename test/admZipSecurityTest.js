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

const Admzip = require('adm-zip');
const commonTemplate = require('../common/template/common');

const DECLARED_UNCOMPRESSED_SIZE = 3 * 1024 * 1024 * 1024;
const CENTRAL_DIRECTORY_SIGNATURE = Buffer.from([0x50, 0x4b, 0x01, 0x02]);

// The archive claims a multi-gigabyte uncompressed package.json but contains
// only one byte. Its CRC is intentionally invalid: vulnerable adm-zip versions
// allocated from the declared size before checking the CRC.
function createOversizedZip() {
  const zip = new Admzip();
  zip.addFile('src/package.json', Buffer.from('x'));
  const archive = zip.toBuffer();
  const centralDirectoryOffset = archive.indexOf(CENTRAL_DIRECTORY_SIGNATURE);

  assert.notStrictEqual(centralDirectoryOffset, -1, 'expected a ZIP central directory');
  archive.writeUInt32LE(0, 14);
  archive.writeUInt32LE(DECLARED_UNCOMPRESSED_SIZE, 22);
  archive.writeUInt32LE(0, centralDirectoryOffset + 16);
  archive.writeUInt32LE(DECLARED_UNCOMPRESSED_SIZE, centralDirectoryOffset + 24);
  return archive;
}

describe('adm-zip CVE-2026-39244 protection', () => {
  it(
    'rejects a template ZIP with an oversized uncompressed size without excessive memory use',
    () => {
      const [major, minor] = require('adm-zip/package.json').version.split('.').map(Number);
      assert.ok(
        major > 0 || minor >= 6,
        'adm-zip 0.6.0 or newer is required before running this regression test'
      );

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ojet-adm-zip-'));
      const zipPath = path.join(tempDir, 'template.zip');
      const destination = path.join(tempDir, 'app', 'src');

      try {
        fs.writeFileSync(zipPath, createOversizedZip());
        fs.mkdirSync(destination, { recursive: true });
        const before = process.memoryUsage().rss;

        assert.throws(
          () => commonTemplate._handleZippedTemplateArchive(zipPath, destination),
          /CRC32/
        );

        const memoryIncreaseMB = (process.memoryUsage().rss - before) / (1024 * 1024);
        assert.ok(
          memoryIncreaseMB < 256,
          `expected memory growth below 256 MB, received ${memoryIncreaseMB.toFixed(1)} MB`
        );
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  );
});
