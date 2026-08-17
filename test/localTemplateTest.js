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
const localTemplate = require('../common/template/local');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ojet-local-template-'));
}

function removeTempDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  fs.readdirSync(dir).forEach((entry) => {
    const entryPath = path.join(dir, entry);
    const stat = fs.lstatSync(entryPath);
    if (stat.isDirectory()) {
      removeTempDir(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  });
  fs.rmdirSync(dir);
}

function createTemplateWithSymlink(baseDir, hasSrcDirectory) {
  const templateDir = path.join(baseDir, 'template');
  const targetDir = hasSrcDirectory ? path.join(templateDir, 'src') : templateDir;
  const secretPath = path.join(baseDir, 'secret.txt');
  const symlinkPath = path.join(targetDir, 'linked-secret.txt');

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(secretPath, 'secret value');
  fs.symlinkSync(secretPath, symlinkPath);

  return {
    templateDir,
    secretPath,
    symlinkPath
  };
}

function createTemplateWithSymlinkOrSkip(testContext, baseDir, hasSrcDirectory) {
  try {
    return createTemplateWithSymlink(baseDir, hasSrcDirectory);
  } catch (error) {
    if (process.platform === 'win32' && error.code === 'EPERM') {
      testContext.skip();
    }
    throw error;
  }
}

async function copyTemplate(templateDir, appDir) {
  await localTemplate.handle({}, templateDir, path.join(appDir, 'src'));
}

describe('local template handling', () => {
  it('should preserve symlinks in new-format local directory templates', async function () {
    const tempDir = makeTempDir();

    try {
      const appDir = path.join(tempDir, 'app');
      const { templateDir, secretPath } = createTemplateWithSymlinkOrSkip(this, tempDir, true);
      const copiedLinkPath = path.join(appDir, 'src', 'linked-secret.txt');

      fs.mkdirSync(path.join(appDir, 'src'), { recursive: true });
      await copyTemplate(templateDir, appDir);

      assert.equal(fs.lstatSync(copiedLinkPath).isSymbolicLink(), true);
      assert.equal(fs.readlinkSync(copiedLinkPath), secretPath);
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('should preserve symlinks in deprecated-format local directory templates', async function () {
    const tempDir = makeTempDir();

    try {
      const appDir = path.join(tempDir, 'app');
      const { templateDir, secretPath } = createTemplateWithSymlinkOrSkip(this, tempDir, false);
      const copiedLinkPath = path.join(appDir, 'src', 'linked-secret.txt');

      fs.mkdirSync(path.join(appDir, 'src'), { recursive: true });
      await copyTemplate(templateDir, appDir);

      assert.equal(fs.lstatSync(copiedLinkPath).isSymbolicLink(), true);
      assert.equal(fs.readlinkSync(copiedLinkPath), secretPath);
    } finally {
      removeTempDir(tempDir);
    }
  });
});
