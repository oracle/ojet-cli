/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

// common helpers for generator tests
const fs = require('fs-extra');
const path = require('path');

const exec = require('child_process').exec;

const td = path.resolve('test_result/test');
const pkg = require('../../package.json');

function _isQuick() {
  return process.argv.indexOf('--quick') > -1;
}

const COMPONENT_APP_NAME = 'componentWebTest';
const COMPONENT_TS_APP_NAME = 'componentTsTest';

const JAVASCRIPT_COMPONENT_APP_CONFIG = { appName: COMPONENT_APP_NAME, scriptsFolder: 'js' };
const TYPESCRIPT_COMPONENT_APP_CONFIG = { appName: COMPONENT_TS_APP_NAME, scriptsFolder: 'ts' };
const COMPONENT_TEST_APP_CONFIGS = [JAVASCRIPT_COMPONENT_APP_CONFIG, TYPESCRIPT_COMPONENT_APP_CONFIG];

function runComponentTestInAllTestApps({ test, pack, component, vcomponent, release }) {
  COMPONENT_TEST_APP_CONFIGS.forEach((config) => {
    runComponentTestInTestApp({ config, test, pack, component, vcomponent, release });
  })
}

function runComponentTestInTestApp({ config, test, pack, component, vcomponent, release }) {
  describe(config.appName, () => {
    test({...config, pack, component, vcomponent, release });
  });
}

module.exports = {
  OJET_COMMAND: 'node ../../ojet',
  OJET_APP_COMMAND: 'node ../../../ojet',
  testDir: td,
  APP_NAME: 'webTest',
  HYBRID_APP_NAME: 'hybridTest',
  TS_APP_NAME: 'tsTest',
  THEME_APP_NAME: 'themeTest',
  COMPONENT_APP_NAME,
  COMPONENT_TS_APP_NAME,
  JAVASCRIPT_COMPONENT_APP_CONFIG,
  TYPESCRIPT_COMPONENT_APP_CONFIG,
  PWA_APP_NAME: 'pwaTest',
  execCmd: function _execCmd(cmd, options, squelch, logCommand = true) {
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

  // Copy over oraclejet-tooling's build to the installation of ojet-cli
  copyOracleJetTooling: function _copyOracleJetTooling(app) {
    try {
      const src = path.resolve('..', '..', '..', 'oraclejet-tooling', 'dist');
      const dest = path.resolve(td, app, 'node_modules', '@oracle');
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

  createComponentFailure: function _createComponentFailure({ stderr }) {
    const regex = new RegExp('Invalid component name:');
    return regex.test(stderr);
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

  createComponentInPackFailure: function _createComponentInPackFailure({ stderr }) {
    const regex = new RegExp('Invalid pack name:');
    return regex.test(stderr);
  },

  runComponentTestInAllTestApps,

  runComponentTestInTestApp
};
