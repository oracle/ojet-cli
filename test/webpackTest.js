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

const COMPONENT_NAME = 'comp-name';
const PACK_NAME = 'pack-name';

function checkSrcIndexHTML(appName, token) {
  const regex = new RegExp(token);
  const appDir = util.getAppDir(appName);
  const pathToIndexHtml = path.join(appDir, 'src', 'index.html');
  const indexHtmlContent = fs.readFileSync(pathToIndexHtml, { encoding: 'utf-8' });
  const hasMatchedPattern = regex.test(indexHtmlContent);
  return { pathToIndexHtml, hasMatchedPattern };
}

async function getICUTranslationTestVariables(appName) {
  const { pathToApp, javascriptFolder, typescriptFolder, sourceFolder } = util.getAppPathData(appName);
  const pathToResourcesFolder = path.join(
    pathToApp,
    sourceFolder,
    appName === util.WEBPACK_TS_APP_NAME ? typescriptFolder : javascriptFolder,
    'resources'
  );
  const pathToResourcesNlsFolder = path.join(pathToResourcesFolder, 'nls');
  const pathToBundleTsFile = path.join(pathToResourcesNlsFolder, 'translationBundle.ts');
  const pathToSupportedLocalesFile = path.join(pathToResourcesNlsFolder, 'supportedLocales.ts');

  // We check this to ensure that the translation bundle is built successfully.
  const hasBundleTsFileBeforeRunningOjetBuild = fs.existsSync(pathToBundleTsFile);

  // Add the configuration options for rootDir, bundleName in the oraclejetconfig.json
  // now that we know where they are located:
  const oracleJetConfigJSON = util.getOracleJetConfigJson(appName);

  oracleJetConfigJSON.translation.options = {
    ...oracleJetConfigJSON.translation.options,
    // We are putting the random spaces here because we are testing the trim function
    // in the buildICUTranslationBundle function as, by default, the l10nBundleBuilder
    // will pick the first locale in the list (and generate its folder and bundle)
    // only and leave others if there are spaces in the locales list:
    supportedLocales: 'es, fr,    de,ar'
  };

  if (appName === util.WEBPACK_JS_APP_NAME) {
    // This generates the .js files:
    oracleJetConfigJSON.translation.options.module = 'amd';
  }

  util.writeOracleJetConfigJson(appName, oracleJetConfigJSON);

  // Now we can run ojet build, which also builds the translation bundle:
  const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(appName) });

  const hasTranslationBundleTsFile = fs.existsSync(pathToBundleTsFile);

  const hasTranslationBundleJsFile = fs.existsSync(pathToBundleTsFile.replace('translationBundle.ts', 'translationBundle.js'));

  let translatedBundleHasRightContent;
  if (hasTranslationBundleTsFile) {
    translatedBundleHasRightContent = fs.readFileSync(pathToBundleTsFile).includes('"Hello! How are you doing?"');
  }

  const resourcesDirItems = fs.readdirSync(pathToResourcesNlsFolder);
  const hasGeneratedLocaleFolders = ['es', 'fr', 'de', 'ar'].every(item => resourcesDirItems.includes(item));
  const hasGeneratedSupportedLocalesFile = fs.existsSync(pathToSupportedLocalesFile);

  return {
    hasBundleTsFileBeforeRunningOjetBuild,
    result,
    hasTranslationBundleTsFile,
    hasGeneratedSupportedLocalesFile,
    translatedBundleHasRightContent,
    hasGeneratedLocaleFolders,
    hasTranslationBundleJsFile
  };
}

describe('Webpack Test', () => {
  before(async function () {
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

    describe('Scaffold with --legacy-peer-deps', () => {
      it('should use the flag --legacy-peer-deps when running ojet add webpack and if enableLegacyPeerDeps is enabled in oraclejetconfig.json file', async () => {
        const appDir = util.getAppDir(util.WEBPACK_APP_NAME);
        const oracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_APP_NAME);
        oracleJetConfigJSON.enableLegacyPeerDeps = true;
        util.writeOracleJetConfigJson(util.WEBPACK_APP_NAME, oracleJetConfigJSON);

        const result = await util.execCmd(`${util.OJET_APP_COMMAND} add webpack`, { cwd: appDir }, false, true);

        assert.equal(/--legacy-peer-deps/.test(result.stdout), true, result.error);
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
        const { pathToIndexHtml, hasMatchedPattern } = checkSrcIndexHTML(util.WEBPACK_APP_NAME, styleFlagTag);
        assert.ok(hasMatchedPattern, `${pathToIndexHtml} has a Redwood theme tag`);
      });
    });

    describe('Multi-locale Support', () => {
      it('should add multi-locale support for a vdom app', async () => {
        const appDir = util.getAppDir(util.WEBPACK_APP_NAME);
        const {
          pathToApp,
          sourceFolder
        } = util.getAppPathData(util.WEBPACK_APP_NAME);
        const regex = /import\s*\{\s*loadTranslationBundles\s*\}\s*from\s*'bootstrap'/;
        await util.execCmd(`${util.OJET_APP_COMMAND} add webpack --multi-locale`, { cwd: appDir }, true, true);

        const pathToInitIndexFile = path.join(pathToApp, sourceFolder, 'init-index.ts');
        const initIndexFileContent = fs.readFileSync(pathToInitIndexFile, 'utf-8');

        assert.equal(fs.existsSync(pathToInitIndexFile), true, 'No init-root.js file present.');
        assert.ok(regex.test(initIndexFileContent), 'No import for the bootstap module.');
      });
      it(`should add multi-locale support for a js app`, async () => {
        const appDir = util.getAppDir(util.WEBPACK_JS_APP_NAME);
        const {
          pathToApp,
          sourceFolder,
          javascriptFolder
        } = util.getAppPathData(util.WEBPACK_JS_APP_NAME);
        const regex = /import\s*\{\s*loadTranslationBundles\s*\}\s*from\s*'bootstrap'/;
        await util.execCmd(`${util.OJET_APP_COMMAND} add webpack --multi-locale`, { cwd: appDir }, true, true);

        const pathToInitRootFile = path.join(pathToApp, sourceFolder, javascriptFolder, 'init-root.js');
        const initRootFileContent = fs.readFileSync(pathToInitRootFile, 'utf-8');

        assert.equal(fs.existsSync(pathToInitRootFile), true, 'No init-root.js file present.');
        assert.ok(regex.test(initRootFileContent), 'No import for the bootstap module.');
      });
      it(`should add multi-locale support for a ts app`, async () => {
        const appDir = util.getAppDir(util.WEBPACK_TS_APP_NAME);
        const {
          pathToApp,
          sourceFolder,
          typescriptFolder
        } = util.getAppPathData(util.WEBPACK_TS_APP_NAME);
        const regex = /import\s*\{\s*loadTranslationBundles\s*\}\s*from\s*'bootstrap'/;
        await util.execCmd(`${util.OJET_APP_COMMAND} add webpack --multi-locale`, { cwd: appDir }, true, true);

        const pathToInitRootFile = path.join(pathToApp, sourceFolder, typescriptFolder, 'init-root.ts');
        const initRootFileContent = fs.readFileSync(pathToInitRootFile, 'utf-8');

        assert.equal(fs.existsSync(pathToInitRootFile), true, 'No init-root.js file present.');
        assert.ok(regex.test(initRootFileContent), 'No import for the bootstap module.');
      });
    });

    describe('Lack of Component and Pack Commands Support', () => {
      describe('Component Commands', () => {
        it('should fail to create a component in a webpack application', async () => {
          const regex = /Creating components is not currently supported in projects using Webpack./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} create component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} create component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} create component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
        it('should fail to build a component in a webpack application', async () => {
          const regex = /Building components or packs is not supported in a Webpack-managed project./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} build component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} build component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} build component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
        it('should fail to package a component in a webpack application', async () => {
          const regex = /Packaging components or packs is not supported in a Webpack-based project./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} package component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} package component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} package component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
        it('should fail to publish a component in a webpack application', async () => {
          const regex = /Publishing components or packs is not supported in a Webpack-managed project./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} publish component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} publish component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} publish component ${COMPONENT_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
      });

      describe('Pack Commands', () => {
        it('should fail to create a pack in a webpack application', async () => {
          const regex = /Creating packs is not currently supported in projects using Webpack./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} create pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} create pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} create pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
        it('should fail to build a pack in a webpack application', async () => {
          const regex = /Building components or packs is not supported in a Webpack-managed project./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} build pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} build pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} build pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
        it('should fail to package a pack in a webpack application', async () => {
          const regex = /Packaging components or packs is not supported in a Webpack-based project./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} package pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} package pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} package pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
        it('should fail to publish a pack in a webpack application', async () => {
          const regex = /Publishing components or packs is not supported in a Webpack-managed project./;
          const jsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} publish pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) }, true, true);
          const tsAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} publish pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) }, true, true);
          const vdomAppResult = await util.execCmd(`${util.OJET_APP_COMMAND} publish pack ${PACK_NAME}`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) }, true, true);
          assert.equal(regex.test(jsAppResult.stdout), true, jsAppResult.error);
          assert.equal(regex.test(tsAppResult.stdout), true, tsAppResult.error);
          assert.equal(regex.test(vdomAppResult.stdout), true, vdomAppResult.error);
        });
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
          await ojet.execute({ task: 'build', options: { release: true } });
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

    describe('Build translation bundles', () => {
      if (!util.noBuild()) {
        it('should not have translation configurations in the oraclejetconfig.json file before running ojet add translation', async () => {
          const vdomAppOracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_APP_NAME);
          const tsAppOracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_TS_APP_NAME);
          const jsAppOracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_JS_APP_NAME);

          // "buildICUTranslationBundle" is a flag to invoke building the translation bundles.
          const hasNoBuildICUTranslationBundleEntryInAllApps = [
            vdomAppOracleJetConfigJSON,
            tsAppOracleJetConfigJSON,
            jsAppOracleJetConfigJSON
          ].every(oracleJetConfigJSON => oracleJetConfigJSON.buildICUTranslationsBundle === undefined);

          // "translation" entry contains the config options and the translation type needed to build the bundles.
          const hasNoTranslationEntryInAllApps = [
            vdomAppOracleJetConfigJSON,
            tsAppOracleJetConfigJSON,
            jsAppOracleJetConfigJSON
          ].every(oracleJetConfigJSON => oracleJetConfigJSON.translation === undefined);

          assert.equal(hasNoBuildICUTranslationBundleEntryInAllApps, true, 'buildICUTranslationBundle flag exists in the oraclejetconfig.json file in one or all apps');
          assert.equal(hasNoTranslationEntryInAllApps, true, 'translation entry with needed configurations exists in the oraclejetconfig.json file in one or all apps');
        });

        it('should add libraries and needed configurations in the oraclejetconfig.json file after running ojet add translation', async () => {
          await util.execCmd(`${util.OJET_APP_COMMAND} add translation`, { cwd: util.getAppDir(util.WEBPACK_APP_NAME) });
          await util.execCmd(`${util.OJET_APP_COMMAND} add translation`, { cwd: util.getAppDir(util.WEBPACK_TS_APP_NAME) });
          await util.execCmd(`${util.OJET_APP_COMMAND} add translation`, { cwd: util.getAppDir(util.WEBPACK_JS_APP_NAME) });
          const vdomAppOracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_APP_NAME);
          const tsAppOracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_TS_APP_NAME);
          const jsAppOracleJetConfigJSON = util.getOracleJetConfigJson(util.WEBPACK_JS_APP_NAME);

          const hasBuildICUTranslationBundleEntryInAllApps = [
            vdomAppOracleJetConfigJSON,
            tsAppOracleJetConfigJSON,
            jsAppOracleJetConfigJSON
          ].every(oracleJetConfigJSON => oracleJetConfigJSON.buildICUTranslationsBundle !== undefined);

          const hasTranslationEntryInAllApps = [
            vdomAppOracleJetConfigJSON,
            tsAppOracleJetConfigJSON,
            jsAppOracleJetConfigJSON
          ].every(oracleJetConfigJSON => (oracleJetConfigJSON.translation &&
            Object.keys(oracleJetConfigJSON.translation).every((entry) => ['type', 'options'].includes(entry))));

          assert.equal(hasBuildICUTranslationBundleEntryInAllApps, true, 'buildICUTranslationBundle flag either does not exist or is set to false in the webpack apps');
          assert.equal(hasTranslationEntryInAllApps, true, 'translation entry with needed configurations does not exist');
        });

        it('should build translation bundle during the build time after running the ojet add translation command', async () => {
          const {
            hasBundleTsFileBeforeRunningOjetBuild,
            result,
            hasTranslationBundleTsFile,
            hasGeneratedSupportedLocalesFile,
            translatedBundleHasRightContent,
            hasGeneratedLocaleFolders
          } = await getICUTranslationTestVariables(util.WEBPACK_APP_NAME);

          assert.equal(hasBundleTsFileBeforeRunningOjetBuild, false, 'Translation bundle ts file should exist after running ojet build.');
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          assert.equal(/Building ICU translation bundles finished./.test(result.stdout), true, result.error);
          assert.equal(hasTranslationBundleTsFile, true, 'There is no translation bundle .ts file created.');
          assert.equal(hasGeneratedSupportedLocalesFile, true, 'There is no generated supported locales file.');
          assert.equal(translatedBundleHasRightContent, true, hasTranslationBundleTsFile ? 'The translation .ts bundle file has incorrect contenst' : 'There is no translation bundle .ts file created.');
          assert.equal(hasGeneratedLocaleFolders, true, 'There are not generated locale folders.');
        });

        it('should build translation bundle during the build time after running the ojet add translation command', async () => {
          const {
            hasBundleTsFileBeforeRunningOjetBuild,
            result,
            hasTranslationBundleTsFile,
            hasGeneratedSupportedLocalesFile,
            translatedBundleHasRightContent,
            hasGeneratedLocaleFolders
          } = await getICUTranslationTestVariables(util.WEBPACK_TS_APP_NAME);

          assert.equal(hasBundleTsFileBeforeRunningOjetBuild, false, 'Translation bundle ts file should exist after running ojet build.');
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          assert.equal(/Building ICU translation bundles finished./.test(result.stdout), true, result.error);
          assert.equal(hasTranslationBundleTsFile, true, 'There is no translation bundle .ts file created.');
          assert.equal(hasGeneratedSupportedLocalesFile, true, 'There is no generated supported locales file.');
          assert.equal(translatedBundleHasRightContent, true, hasTranslationBundleTsFile ? 'The translation .ts bundle file has incorrect contenst' : 'There is no translation bundle .ts file created.');
          assert.equal(hasGeneratedLocaleFolders, true, 'There are not generated locale folders.');
        });

        it('should build translation bundle during the build time after running the ojet add translation command', async () => {
          const {
            hasBundleTsFileBeforeRunningOjetBuild,
            result,
            hasTranslationBundleJsFile,
            hasGeneratedSupportedLocalesFile,
            translatedBundleHasRightContent,
            hasGeneratedLocaleFolders
          } = await getICUTranslationTestVariables(util.WEBPACK_JS_APP_NAME);

          assert.equal(hasBundleTsFileBeforeRunningOjetBuild, false, 'Translation bundle ts file should exist after running ojet build.');
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          assert.equal(/Building ICU translation bundles finished./.test(result.stdout), true, result.error);
          assert.equal(hasTranslationBundleJsFile, true, 'There is no translation bundle .js file created.');
          assert.equal(hasGeneratedSupportedLocalesFile, true, 'There is no generated supported locales file.');
          assert.equal(translatedBundleHasRightContent, true, hasTranslationBundleJsFile ? 'The translation .ts bundle file has incorrect contenst' : 'There is no translation bundle .ts file created.');
          assert.equal(hasGeneratedLocaleFolders, true, 'There are not generated locale folders.');
        });
      }
    });
  });
});