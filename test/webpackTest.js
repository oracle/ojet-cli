/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const Ojet = require('../ojet');
const util = require('./util');

describe('Webpack Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      // Create legacy webpack app. Will remove once end-to-end webpack
      // support is complete
      util.removeAppDir(util.WEBPACK_LEGACY_APP_NAME);
      // Scaffold vdomTest application using API
      const ojet = new Ojet({ cwd: util.testDir, logs: false });
      let executeOptions = {};
      try {
        executeOptions = {
          task: 'create',
          parameters: [util.WEBPACK_LEGACY_APP_NAME],
          options: {
            template: path.join(util.getTemplatesDir(), util.WEBPACK_LEGACY_APP_NAME)
          }
        };
        await ojet.execute(executeOptions);
        assert.ok(true);
        // We need the locally built copy of oraclejet-tooling before the merge
        // to pick up the latest changes. Will remove after the merge
        util.copyOracleJetTooling(util.WEBPACK_LEGACY_APP_NAME);
      } catch (e) {
        console.log(e);
        assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
      }
    }
    if (!util.noScaffold()) {
      // Create end-to-end webpack app
      util.removeAppDir(util.WEBPACK_APP_NAME);
      // Scaffold vdomTest application using API
      const ojet = new Ojet({ cwd: util.testDir, logs: false });
      let executeOptions = {};
      try {
        executeOptions = {
          task: 'create',
          parameters: [util.WEBPACK_APP_NAME],
          options: {
            template: 'basic',
            vdom: true,
            webpack: true
          }
        };
        await ojet.execute(executeOptions);
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
      }
    }
  });
  describe('Webpack', () => {
    describe('Scaffold', () => {
      it('should check that webpack and its dependencies are listed in package.json', () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const packageJson = fs.readJsonSync(path.join(pathToApp, 'package.json'));
        util.WEBPACK_DEPENDENCIES.forEach((dependency) => {
          assert.ok(packageJson.devDependencies[dependency], `${dependency} not installed`);
        });
      });
      it(`should check that ${util.OJET_CONFIG_JS} was added`, () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const pathToOjetConfigJs = path.join(pathToApp, util.OJET_CONFIG_JS);
        assert.ok(fs.existsSync(pathToOjetConfigJs), `${util.OJET_CONFIG_JS} not in application`);
      });
    });
    describe('Build (Debug)', () => {
      it('should build in debug mode', async () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const ojet = new Ojet({ cwd: pathToApp, logs: false });
        try {
          await ojet.execute({ task: 'build' });
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
    });
    describe('Build (Release)', () => {
      it('should build in release mode', async () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const ojet = new Ojet({ cwd: pathToApp, logs: false });
        try {
          await ojet.execute({ task: 'build', options: { release: true }});
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
    });
  });
  describe('Webpack (Legacy)', () => {
    describe('Scaffold', () => {
      it('should check that webpack and its dependencies are listed in package.json', () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_LEGACY_APP_NAME);
        const packageJson = fs.readJsonSync(path.join(pathToApp, 'package.json'));
        util.WEBPACK_LEGACY_DEPENDENCIES.forEach((dependency) => {
          assert.ok(packageJson.devDependencies[dependency], `${dependency} not installed`);
        });
      });
      it('should check that bundler and bundleName properties were added to oraclejetconfig.json', () => {
        const oraclejetConfigJson = util.getOracleJetConfigJson(util.WEBPACK_LEGACY_APP_NAME);
        assert.ok(oraclejetConfigJson.bundler === 'webpack', 'bundler not equal to "webpack"');
        assert.ok(oraclejetConfigJson.bundleName === 'bundle.js', 'bundleName not equal to "bundle.js');
      });
    });
    describe('Build (Debug)', () => {
      it('should build in debug mode', async () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_LEGACY_APP_NAME);
        const ojet = new Ojet({ cwd: pathToApp, logs: false });
        try {
          await ojet.execute({ task: 'build' });
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
    });
    describe('Build (Release)', () => {
      it('should build in release mode', async () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_LEGACY_APP_NAME);
        const ojet = new Ojet({ cwd: pathToApp, logs: false });
        try {
          await ojet.execute({ task: 'build', options: { release: true }});
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
      it('should have bundle.js file', () => {
        const { pathToBundleJs } = util.getAppPathData(util.WEBPACK_LEGACY_APP_NAME);
        const bundleFileExists = fs.existsSync(pathToBundleJs);
        assert.ok(bundleFileExists, `${pathToBundleJs} does not exist`);
      });
      it('should have bundle.js script in index.html', () => {
        const { pathToIndexHtml } = util.getAppPathData(util.WEBPACK_LEGACY_APP_NAME);
        const indexHtmlContent = fs.readFileSync(pathToIndexHtml, { encoding: 'utf-8' });
        const loadsBundleJs = /bundle\.js(?:'|")><\/script>/.test(indexHtmlContent);
        assert.ok(loadsBundleJs, `${pathToIndexHtml} does not load bundle.js`);
      });
      it('should not load require.js in index.html', () => {
        const { pathToIndexHtml } = util.getAppPathData(util.WEBPACK_LEGACY_APP_NAME);
        const indexHtmlContent = fs.readFileSync(pathToIndexHtml, { encoding: 'utf-8' });
        const loadsRequireJs = /require\/require\.js(?:'|")><\/script>/.test(indexHtmlContent);
        assert.ok(!loadsRequireJs, `${pathToIndexHtml} loads require.js`);
      })
    });
  });
});