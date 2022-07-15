/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

// common helpers for generator tests
const fs = require('fs-extra');
const path = require('path');

const exec = require('child_process').exec;

const TEST_DIR = 'test_result';

const td = path.resolve(`../${TEST_DIR}`);
const pkg = require('../../package.json');

function _isQuick() {
  return process.argv.indexOf('--quick') > -1;
}

const COMPONENT_APP_NAME = 'webJsComponentTest';
const COMPONENT_TS_APP_NAME = 'webTsComponentTest';

const JAVASCRIPT_COMPONENT_APP_CONFIG = { appName: COMPONENT_APP_NAME, scriptsFolder: 'js' };
const TYPESCRIPT_COMPONENT_APP_CONFIG = { appName: COMPONENT_TS_APP_NAME, scriptsFolder: 'ts' };
const COMPONENT_TEST_APP_CONFIGS = [JAVASCRIPT_COMPONENT_APP_CONFIG, TYPESCRIPT_COMPONENT_APP_CONFIG];

function runComponentTestInAllTestApps(options) {
  COMPONENT_TEST_APP_CONFIGS.forEach((config) => {
    runComponentTestInTestApp(config, options);
  })
}

function runComponentTestInTestApp(config, options) {
  describe(config.appName, () => {
    options.test({...config, ...options});
  });
}

function _replaceOraclejetToolingProp(packageJson) {
  packageJson.devDependencies['@oracle/oraclejet-tooling'] = `file:${path.join('..', '..',
  'ojet-cli', 'node_modules', '@oracle', 'oraclejet-tooling')}`;
}

const ORACLEJET_CONFIG_JSON = 'oraclejetconfig.json';
const DEFAULT_COMPONENTS_FOLDER = 'jet-composites';
const OMIT_COMPONENT_VERSION_FLAG = 'omit-component-version';
const WEBPACK_LEGACY_DEPENDENCIES = ['webpack', 'css-loader', 'style-loader', 'text-loader'];
const WEBPACK_DEPENDENCIES = [
  'webpack',
  'webpack-dev-server',
  'style-loader', 
  'css-loader', 
  'ts-loader',
  'raw-loader',
  'noop-loader',
  'html-webpack-plugin',
  'html-replace-webpack-plugin',
  'copy-webpack-plugin',
  '@prefresh/webpack',
  '@prefresh/babel-plugin',
  'webpack-merge',
  'compression-webpack-plugin',
  'mini-css-extract-plugin'
];
const COMPONENT_JSON_DEPENDENCIES_TOKEN = '@dependencies@';
const COMPONENT_JSON = 'component.json';
const OJET_CONFIG_JS = 'ojet.config.js';
const TSCONFIG_JSON = 'tsconfig.json';

module.exports = {
  OJET_COMMAND: 'node ../ojet-cli/bin/ojet',
  OJET_APP_COMMAND: 'node ../../ojet-cli/bin/ojet',
  testDir: td,
  APP_NAME: 'webJsTest',
  HYBRID_APP_NAME: 'hybridJsTest',
  OJC_APP_NAME: 'ojcTest',
  TS_APP_NAME: 'webTsTest',
  THEME_APP_NAME: 'webJsThemeTest',
  PWA_APP_NAME: 'webJsPwaTest',
  API_APP_NAME: 'webTsApiTest',
  VDOM_APP_NAME: 'vdomTest',
  WEBPACK_APP_NAME: 'webpackTest',
  WEBPACK_JS_APP_NAME: 'webpackJsTest',
  WEBPACK_TS_APP_NAME: 'webpackTsTest',
  WEBPACK_LEGACY_APP_NAME: 'webpackLegacyTest',
  COMPONENT_APP_NAME,
  COMPONENT_TS_APP_NAME,
  JAVASCRIPT_COMPONENT_APP_CONFIG,
  TYPESCRIPT_COMPONENT_APP_CONFIG,
  EXCHANGE_URL: 'https://exchange.oraclecorp.com/api/0.2.0',
  ORACLEJET_CONFIG_JSON,
  DEFAULT_COMPONENTS_FOLDER,
  OMIT_COMPONENT_VERSION_FLAG,
  TEST_DIR,
  WEBPACK_DEPENDENCIES,
  WEBPACK_LEGACY_DEPENDENCIES,
  COMPONENT_JSON_DEPENDENCIES_TOKEN,
  COMPONENT_JSON,
  OJET_CONFIG_JS,
  TSCONFIG_JSON,
  execCmd: function _execCmd(cmd, options, squelch = false, logCommand = true) {
    if (logCommand) {
      console.log(cmd);
    }
    return new Promise((resolve, reject) => {
      const p = exec(cmd, options, (error, stdout, stderr) => {
        const result = { error, stdout, stderr, process: p };
        if (error && !squelch) {
          console.log(result);
          reject(result);
        } else {
          resolve(result);
        }
      });
    })
  },

  makePackageSymlink: function _makePackageSymlink() {
    function _updatePackageFile(dir) {
      let src = path.resolve('generators', dir, 'templates', 'common', 'package.json');
      let json = fs.readJSONSync(src);
      // Replace the property
      _replaceOraclejetToolingProp(json);
      // Write it back out
      fs.writeJsonSync(src, json);  
    }

    // Update the two package.json files in our built ojet-cli common templates
    _updatePackageFile('app');

    // do hybrid
    _updatePackageFile('hybrid');
  },

  // Copy over oraclejet-tooling's build to the installation of ojet-cli
  copyOracleJetTooling: function _copyOracleJetTooling(app) {
    try {
      const src = path.resolve('..', '..', '..', 'oraclejet-tooling', 'dist');
      const dest = app ? path.resolve(td, app, 'node_modules', '@oracle') : path.resolve('node_modules', '@oracle');
      console.log(src);
      console.log(dest);
      console.log('Copying oraclejet-tooling/dist/oraclejet-tooling to ojet-cli installation');
      fs.copySync(src, dest, (source) => {
        if (source.indexOf('node_modules') > -1 || source.endsWith('package.json')) {
          // do not copy package.json to prevent reinstall of artifactory version of 
          // oraclejet-tooling during 'npm install'
          return false;
        }
        return true;
      });
    } catch (err) {
      console.log(err);
    }
  },

  getAppDir: function _getAppDir(app) {
    return path.resolve(td, app);
  },

  buildSuccess: function _isSuccess(std) {
    return (std.indexOf('Build finished') > -1 || std.indexOf('Code signing') > -1 || std.indexOf('Code Sign') > -1);
  },

  norestoreSuccess: function _noSuccess(std) {
    return std.indexOf('Your app structure is generated') > -1;
  },

  noError: function _noError(std) {
    return !(/error/i.test(std));
  },

  isWindows: function _isWindows(OS) {
    return /^Windows/.test(OS);
  },

  getCliVersion: function _getCliVersion() {
    return pkg.version;
  },

  getJetVersion: function _getJetVersion(app) {
    const pkgPath = path.resolve(this.getAppDir(app), 'node_modules/@oracle/oraclejet/package.json');
    const jetPkg = require(pkgPath);
    return jetPkg.version;
  },

  getPlatform: function _getPlatform(OS) {
    const isWindows = /^Windows/.test(OS);
    return isWindows ? 'android' : 'ios';
  },

  succeeded: function _succeeded(std) {
    return /succeeded/.test(std);
  },

  noHybrid: function _noHybrid() {
    return process.argv.indexOf('--nohybrid') > -1 || _isQuick();
  },

  noScaffold: function _noScaffold() {
    return process.argv.indexOf('--noscaffold') > -1 || _isQuick();
  },

  noBuild: function _noBuild() {
    return process.argv.indexOf('--nobuild') > -1 || _isQuick();
  },

  noCordova: function _noCordova() {
    return process.argv.indexOf('--nocordova') > -1 || _isQuick();
  },

  noSass: function _noSass() {
    return process.argv.indexOf('--nosass') > -1 || _isQuick();
  },

  noServe: function _noServe() {
    return process.argv.indexOf('--noserve') > -1 || _isQuick();
  },

  createComponentSuccess: function _createComponentSuccess({ stdout, component }) {
    const regex = new RegExp(`Add component '${component}' finished`);
    return regex.test(stdout);
  },

  createComponentFailure: function _createComponentFailure({ stdout }) {
    const regex = new RegExp('Invalid component name:');
    return regex.test(stdout);
  },

  addComponentSuccess: function _addComponentSuccess({ stdout, component }) {
    const regex = new RegExp(`Component(s) '${component}' added`);
    return regex.test(stdout);
  },

  buildComponentSuccess: function _buildComponentSuccess({ stdout }) {
    const regex = new RegExp('Build finished');
    return regex.test(stdout);
  },

  packageComponentSuccess: function _packageComponentSuccess({ stdout, component }) {
    const regex = new RegExp(`Component ${component} was packaged`);
    return regex.test(stdout);
  },

  createPackSuccess: function _createPackSuccess({ stdout, pack }) {
    const regex = new RegExp(`Pack '${pack}' successfully created`);
    return regex.test(stdout);
  },

  createComponentInPackSuccess: function _createComponentInPackSuccess({ stdout, component }) {
    const regex = new RegExp(`Add component '${component}' finished`);
    return regex.test(stdout);
  },

  createComponentInPackFailure: function _createComponentInPackFailure({ stdout }) {
    const regex = new RegExp('Invalid pack name:');
    return regex.test(stdout);
  },

  removeAppDir: function _removeAppDir(appName) {
    const appDir = path.join(td, appName);
    fs.emptyDirSync(appDir);
    fs.rmdirSync(appDir);
  },

  runComponentTestInAllTestApps,

  runComponentTestInTestApp,

  getOracleJetConfigPath: function _getOracleJetConfigPath(appName) {
    return path.join(this.getAppDir(appName), ORACLEJET_CONFIG_JSON);
  },

  getOracleJetConfigJson: function _getOracleJetConfigJson(appName) {
    const oraclejetConfigJson = fs.readJSONSync(this.getOracleJetConfigPath(appName));
    return oraclejetConfigJson;
  },

  writeOracleJetConfigJson: function _writeOracleJetConfigJson(appName, oraclejetConfigJson) {
    fs.writeJsonSync(this.getOracleJetConfigPath(appName), oraclejetConfigJson);
  },

  writeCustomHookContents: function _writeCustomHookContents({hookName, filePath}) {
    const customHookContent = `module.exports = function (configObj) {
      return new Promise((resolve) => {
        const componentName = configObj.component;
        console.log('Running ${hookName}_component_package for component: component being packaged is', componentName);
        resolve(configObj);
      });
    }`
      fs.writeFileSync(filePath, customHookContent);
  },

  checkThemingLink: function _checkThemingLink(expression, pathToIndexHtml) {      
      const indexHtmlContent = fs.readFileSync(pathToIndexHtml);
      const regex = new RegExp(expression, 'gm');
      return regex.test(indexHtmlContent);
  },

  setDefaultTheme: function _setDefaultTheme(theme, appPath) {
    const pathToConfigJSON = path.join(appPath, this.ORACLEJET_CONFIG_JSON);
    const configJSON = fs.readJSONSync(pathToConfigJSON);
    configJSON.defaultTheme = theme;
    fs.writeJSONSync(pathToConfigJSON, configJSON);
  },
  
  getHooksPathAndContent: function _getHooksPathAndContent(appName) {
    const { pathToAppHooks } = this.getAppPathData(appName);
    const beforePackageHookPath = path.join(pathToAppHooks, `before_component_package.js`);
    const afterPackageHookPath = path.join(pathToAppHooks, `after_component_package.js`);
    const defaultBeforeHookContent = fs.readFileSync(beforePackageHookPath);
    const defaultAfterHookContent = fs.readFileSync(afterPackageHookPath);
    return {
      beforePackageHookPath,
      afterPackageHookPath,
      defaultBeforeHookContent,
      defaultAfterHookContent
    }
  },

  getAppPathData: function _getAppPathData(appName, scriptsFolder='') {
    const oraclejetConfigJson = this.getOracleJetConfigJson(appName);
    const componentsFolder = oraclejetConfigJson.paths.source.components || DEFAULT_COMPONENTS_FOLDER;
    const stagingFolder = oraclejetConfigJson.paths.staging.web;
    const javascriptFolder = oraclejetConfigJson.paths.source.javascript;
    const typescriptFolder = oraclejetConfigJson.paths.source.typescript;
    const sourceFolder = oraclejetConfigJson.paths.source.common;
    const pathToApp = this.getAppDir(appName);
    const pathToBuiltComponents = path.join(pathToApp, stagingFolder, javascriptFolder, componentsFolder);
    const pathToSourceComponents = path.join(pathToApp, sourceFolder, scriptsFolder, componentsFolder);
    const pathToMainJs = path.join(pathToApp, stagingFolder, javascriptFolder, 'main.js');
    const pathToBundleJs = path.join(pathToApp, stagingFolder, javascriptFolder, 'bundle.js');
    const exchangeComponentsFolder = oraclejetConfigJson.paths.source.exchangeComponents || 'jet_components';
    const pathToNodeModules = path.join(pathToApp, 'node_modules');
    const pathToAppHooks = path.join(pathToApp, `scripts/hooks`);
    const pathToExchangeComponents = path.join(pathToApp, exchangeComponentsFolder);
    const pathToIndexHtml = path.join(pathToApp, stagingFolder, 'index.html');
    const stylesFolder = oraclejetConfigJson.paths.source.styles;
    return {
      componentsFolder,
      stagingFolder,
      sourceFolder,
      javascriptFolder,
      typescriptFolder,
      pathToApp,
      pathToBuiltComponents,
      pathToSourceComponents,
      pathToMainJs,
      pathToBundleJs,
      exchangeComponentsFolder,
      pathToNodeModules,
      pathToExchangeComponents,
      pathToIndexHtml,
      pathToAppHooks,
      stylesFolder
    }
  },

  getTemplatesDir: function _getTempatesDir() {
    return path.resolve(__dirname, '..', 'templates');
  }
};