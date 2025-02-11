/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const Ojet = require('../ojet');
const util = require('./util');

function checkSrcIndexHTML(appName, token){
  const regex = new RegExp(token);
  const appDir = util.getAppDir(appName);
  const pathToIndexHtml = path.join(appDir, 'src', 'index.html');
  const indexHtmlContent = fs.readFileSync(pathToIndexHtml, { encoding: 'utf-8' });
  const hasMatchedPattern = regex.test(indexHtmlContent);
  return {pathToIndexHtml, hasMatchedPattern};
}

describe('Webpack Test', () => {
  before(async function() {
    this.timeout(20000000);

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
        console.log(`Start scaffolding ${util.WEBPACK_LEGACY_APP_NAME}`);
        await ojet.execute(executeOptions);
        assert.ok(true);
        console.log(`Finish scaffolding ${util.WEBPACK_LEGACY_APP_NAME}`);
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
        console.log(`Start scaffolding ${util.WEBPACK_APP_NAME}`);
        await ojet.execute(executeOptions);
        assert.ok(true);
        console.log(`Finish scaffolding ${util.WEBPACK_APP_NAME}`);
      } catch (e) {
        console.log(e);
        assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
      }
    }
     if (!util.noScaffold()) {
      // Create end-to-end webpack app
      util.removeAppDir(util.WEBPACK_JS_APP_NAME);
      // Scaffold vdomTest application using API
      const ojet = new Ojet({ cwd: util.testDir, logs: false });
      let executeOptions = {};
      try {
        executeOptions = {
          task: 'create',
          parameters: [util.WEBPACK_JS_APP_NAME],
          options: {
            template: 'basic',
            vdom: false,
            webpack: true
          }
        };
        console.log(`Start scaffolding ${util.WEBPACK_JS_APP_NAME}`);
        await ojet.execute(executeOptions);
        console.log(`Finish scaffolding ${util.WEBPACK_JS_APP_NAME}`);

        // Change the port in ojet.config.js
        const testDir = util.getAppDir(util.WEBPACK_JS_APP_NAME);
        const fileName = path.resolve(testDir, 'ojet.config.js');
        let configRead = fs.readFileSync(fileName, 'utf-8');
        configRead = configRead.replace('return config;', 'if (config && config.devServer) config.devServer.port = 8001; return config;');
        // write it back out
        fs.unlinkSync(fileName);
        fs.writeFileSync(fileName, configRead);

        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
      }
    } 
    if (!util.noScaffold()) {
      // Create end-to-end webpack app
      util.removeAppDir(util.WEBPACK_TS_APP_NAME);
      // Scaffold vdomTest application using API
      const ojet = new Ojet({ cwd: util.testDir, logs: false });
      let executeOptions = {};
      try {
        executeOptions = {
          task: 'create',
          parameters: [util.WEBPACK_TS_APP_NAME],
          options: {
            template: 'navbar-ts',
            typescript: true,
            webpack: true
          }
        };
        console.log(`Start scaffolding ${util.WEBPACK_TS_APP_NAME}`);
        await ojet.execute(executeOptions);
        console.log(`Finish scaffolding ${util.WEBPACK_TS_APP_NAME}`);

        // Change the port in ojet.config.js
        const testDir = util.getAppDir(util.WEBPACK_TS_APP_NAME);
        const fileName = path.resolve(testDir, 'ojet.config.js');
        let configRead = fs.readFileSync(fileName, 'utf-8');
        configRead = configRead.replace('return config;', 'if (config && config.devServer) config.devServer.port = 8002; return config;');
        // write it back out
        fs.unlinkSync(fileName);
        fs.writeFileSync(fileName, configRead);

        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
      }
    }
  });
  describe('Webpack', () => {
    describe('Scaffold', () => {
      it('should check that webpack and its dependencies are listed in package.json - vdom app', () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const packageJson = fs.readJsonSync(path.join(pathToApp, 'package.json'));
        util.WEBPACK_DEPENDENCIES.forEach((dependency) => {
          assert.ok(packageJson.devDependencies[dependency], `${dependency} not installed`);
        });
      });
      it('should check that webpack and its dependencies are listed in package.json - js app', () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_JS_APP_NAME);
        const packageJson = fs.readJsonSync(path.join(pathToApp, 'package.json'));
        util.WEBPACK_DEPENDENCIES.forEach((dependency) => {
          assert.ok(packageJson.devDependencies[dependency], `${dependency} not installed`);
        });
      }); 
      it('should check that webpack and its dependencies are listed in package.json - ts app', () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_TS_APP_NAME);
        const packageJson = fs.readJsonSync(path.join(pathToApp, 'package.json'));
        util.WEBPACK_DEPENDENCIES.forEach((dependency) => {
          assert.ok(packageJson.devDependencies[dependency], `${dependency} not installed`);
        });
      });
      it(`should check that ${util.OJET_CONFIG_JS} was added in vdom app`, () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const pathToOjetConfigJs = path.join(pathToApp, util.OJET_CONFIG_JS);
        assert.ok(fs.existsSync(pathToOjetConfigJs), `${util.OJET_CONFIG_JS} not in application`);
      });
      it(`should check that ${util.OJET_CONFIG_JS} was added in js app`, () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_JS_APP_NAME);
        const pathToOjetConfigJs = path.join(pathToApp, util.OJET_CONFIG_JS);
        assert.ok(fs.existsSync(pathToOjetConfigJs), `${util.OJET_CONFIG_JS} not in application`);
      });
      it(`should check that ${util.OJET_CONFIG_JS} was added in ts app`, () => {
        const { pathToApp } = util.getAppPathData(util.WEBPACK_TS_APP_NAME);
        const pathToOjetConfigJs = path.join(pathToApp, util.OJET_CONFIG_JS);
        assert.ok(fs.existsSync(pathToOjetConfigJs), `${util.OJET_CONFIG_JS} not in application`);
      });
    });
    describe('Build (Debug)', () => {
      it('should build in debug mode', async () => {
        const appDir = util.getAppDir(util.WEBPACK_APP_NAME);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: appDir }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
      it(`should build in debug mode for ${util.WEBPACK_JS_APP_NAME}`, async () => {
        const appDir = util.getAppDir(util.WEBPACK_JS_APP_NAME);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: appDir }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
      it(`should build in debug mode for ${util.WEBPACK_TS_APP_NAME}`, async () => {
        const appDir = util.getAppDir(util.WEBPACK_TS_APP_NAME);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: appDir }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    });
    describe('Build (Release)', () => {
      const styleFlagTag = /<!-- Link-tag flag that webpack replaces with theme style links during build time -->/;
      it('should build in release mode for a vdom app', async () => {
         const appDir = util.getAppDir(util.WEBPACK_APP_NAME);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
      it(`should build in debug release for a js app`, async () => {
        const appDir = util.getAppDir(util.WEBPACK_JS_APP_NAME);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
      it(`should build in debug release for a ts app`, async () => {
        const appDir = util.getAppDir(util.WEBPACK_TS_APP_NAME);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
      it('should have style flag tag in index.html in app src folder', () => {
        const { pathToIndexHtml, hasMatchedPattern} = checkSrcIndexHTML(util.WEBPACK_APP_NAME, styleFlagTag);
        assert.ok(hasMatchedPattern, `${pathToIndexHtml} has a Redwood theme tag`);
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
        } catch (e) {
          console.log(e);
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
        } catch (e) {
          console.log(e);
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