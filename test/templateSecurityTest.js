/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const Admzip = require('adm-zip');
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const createApp = require('../generators/app');
const commonRestore = require('../common/restore');
const template = require('../common/template');

const ALLOW_TEMPLATE_CODE_EXECUTION = 'allow-template-code-execution';

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ojet-template-security-'));
}

function removeTempDir(tempDir) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function writeZip(zipPath, entries) {
  const zip = new Admzip();
  Object.keys(entries).forEach((entryName) => {
    zip.addFile(entryName, Buffer.from(entries[entryName]));
  });
  zip.writeZip(zipPath);
}

function packageJsonWithScripts(scripts) {
  return JSON.stringify({
    scripts,
    dependencies: {},
    devDependencies: {}
  });
}

describe('template security preflight', () => {
  it('rejects untrusted zip templates with npm lifecycle scripts', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'package.json': packageJsonWithScripts({ postinstall: 'node payload.js' })
      });

      await assert.rejects(
        template.prepareTemplate({ options: { template: zipPath } }),
        /package\.json scripts\.postinstall/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects untrusted zip templates with dependencies lifecycle scripts', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'package.json': packageJsonWithScripts({ dependencies: 'node payload.js' })
      });

      await assert.rejects(
        template.prepareTemplate({ options: { template: zipPath } }),
        /package\.json scripts\.dependencies/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects case-variant package.json entries on untrusted zip templates', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'Package.json': packageJsonWithScripts({ dependencies: 'node payload.js' })
      });

      await assert.rejects(
        template.prepareTemplate({ options: { template: zipPath } }),
        /package\.json scripts\.dependencies/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects leading-slash package.json entries on untrusted zip templates', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        '/package.json': packageJsonWithScripts({ dependencies: 'node payload.js' })
      });

      await assert.rejects(
        template.prepareTemplate({ options: { template: zipPath } }),
        /package\.json scripts\.dependencies/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects untrusted zip templates with app-create hooks', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'scripts/hooks/after_app_create.js': 'module.exports = () => Promise.resolve();'
      });

      await assert.rejects(
        template.prepareTemplate({ options: { template: zipPath } }),
        /scripts\/hooks\/after_app_create\.js/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects leading-slash hooks entries on untrusted zip templates', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        '/scripts/hooks/hooks.json': '{}'
      });

      await assert.rejects(
        template.prepareTemplate({ options: { template: zipPath } }),
        /scripts\/hooks\/hooks\.json/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects untrusted local directory templates with hooks config', async () => {
    const tempDir = makeTempDir();
    const templateDir = path.join(tempDir, 'template');

    try {
      fs.mkdirSync(path.join(templateDir, 'src'), { recursive: true });
      fs.mkdirSync(path.join(templateDir, 'scripts', 'hooks'), { recursive: true });
      fs.writeFileSync(path.join(templateDir, 'src', 'index.html'), '<html></html>');
      fs.writeFileSync(path.join(templateDir, 'scripts', 'hooks', 'hooks.json'), '{}');

      await assert.rejects(
        template.prepareTemplate({ options: { template: templateDir } }),
        /scripts\/hooks\/hooks\.json/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('rejects case-variant hooks entries on untrusted local directory templates', async () => {
    const tempDir = makeTempDir();
    const templateDir = path.join(tempDir, 'template');

    try {
      fs.mkdirSync(path.join(templateDir, 'src'), { recursive: true });
      fs.mkdirSync(path.join(templateDir, 'Scripts', 'Hooks'), { recursive: true });
      fs.writeFileSync(path.join(templateDir, 'src', 'index.html'), '<html></html>');
      fs.writeFileSync(path.join(templateDir, 'Scripts', 'Hooks', 'hooks.json'), '{}');

      await assert.rejects(
        template.prepareTemplate({ options: { template: templateDir } }),
        /Scripts\/Hooks\/hooks\.json/
      );
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('allows static untrusted templates without execution surfaces', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');
    const generator = { options: { template: zipPath } };

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'src/main.js': 'console.log("static template");'
      });

      const templateInfo = await template.prepareTemplate(generator);

      assert.strictEqual(templateInfo.trusted, false);
      assert.strictEqual(templateInfo.allowCodeExecution, false);
      assert.deepStrictEqual(templateInfo.codeExecutionFindings, []);
      assert.strictEqual(generator.templateInfo, templateInfo);
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('allows npm lifecycle scripts with explicit opt-in', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');
    const generator = {
      options: {
        template: zipPath,
        [ALLOW_TEMPLATE_CODE_EXECUTION]: true
      }
    };

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'package.json': packageJsonWithScripts({ prepare: 'node payload.js' })
      });

      const templateInfo = await template.prepareTemplate(generator);

      assert.strictEqual(templateInfo.allowCodeExecution, true);
      assert.deepStrictEqual(templateInfo.codeExecutionFindings, ['package.json scripts.prepare']);
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('allows dependencies lifecycle scripts with explicit opt-in', async () => {
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');
    const generator = {
      options: {
        template: zipPath,
        [ALLOW_TEMPLATE_CODE_EXECUTION]: true
      }
    };

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        '/Package.json': packageJsonWithScripts({ dependencies: 'node payload.js' })
      });

      const templateInfo = await template.prepareTemplate(generator);

      assert.strictEqual(templateInfo.allowCodeExecution, true);
      assert.deepStrictEqual(templateInfo.codeExecutionFindings, ['package.json scripts.dependencies']);
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('adds --ignore-scripts to restore for untrusted templates without opt-in', () => {
    const app = {
      templateInfo: {
        trusted: false,
        allowCodeExecution: false
      }
    };

    assert.strictEqual(
      commonRestore._getInstallCommand(app, { installer: 'npm' }, {}),
      'npm install --ignore-scripts'
    );
    assert.strictEqual(
      commonRestore._getInstallCommand(app, { installer: 'npm' }, { enableLegacyPeerDeps: true }),
      'npm install --legacy-peer-deps --ignore-scripts'
    );
  });

  it('does not add --ignore-scripts to restore when template code execution is allowed', () => {
    const app = {
      templateInfo: {
        trusted: false,
        allowCodeExecution: true
      }
    };

    assert.strictEqual(
      commonRestore._getInstallCommand(app, { installer: 'npm' }, {}),
      'npm install'
    );
  });

  it('fails app creation before creating the app directory when preflight rejects a template', async () => {
    const originalCwd = process.cwd();
    const originalOjet = process.env.OJET;
    const tempDir = makeTempDir();
    const zipPath = path.join(tempDir, 'template.zip');
    const appName = 'blocked-app';

    try {
      writeZip(zipPath, {
        'src/index.html': '<html></html>',
        'package.json': packageJsonWithScripts({ dependencies: 'node payload.js' })
      });

      process.chdir(tempDir);
      process.env.OJET = JSON.stringify({ cwd: originalCwd, logs: false });
      await assert.rejects(createApp(appName, { template: zipPath, norestore: true }));

      assert.strictEqual(fs.existsSync(path.join(tempDir, appName)), false);
    } finally {
      process.chdir(originalCwd);
      if (originalOjet) {
        process.env.OJET = originalOjet;
      } else {
        delete process.env.OJET;
      }
      removeTempDir(tempDir);
    }
  });
});
