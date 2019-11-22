/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

//common helpers for generator tests
var fs = require('fs-extra');
var path = require('path');
const exec = require('child_process').exec;
const td = path.resolve('test_result/test');
const pkg = require('../../package.json');

function _isQuick() {
  return process.argv.indexOf("--quick") > -1;
}

module.exports = {
  OJET_COMMAND: 'node ../../ojet',
  OJET_APP_COMMAND: 'node ../../../ojet',
  testDir: td,
  APP_NAME: 'webTest',
  HYBRID_APP_NAME: 'hybridTest',
  TS_APP_NAME: 'tsTest',

  execCmd: function _execCmd(cmd, options, squelch) {
    console.log(cmd);
    return new Promise((resolve, reject) => {
      let p = exec(cmd, options, (error, stdout, stderr) => {
        let result = {error: error, stdout: stdout, stderr: stderr, process: p};
        if (error && !squelch) {
          console.log(result);
          reject(result);
        }
        else {
          resolve(result);
        }
      });
    })
  },

  // Copy over oraclejet-tooling's build to the installation of ojet-cli
  copyOracleJetTooling: function _copyOracleJetTooling(app) {
    try {
      const src = path.resolve("..", "..", "..", "oraclejet-tooling", "dist");
      const dest = path.resolve(td, app, "node_modules", "@oracle");
      console.log(src);
      console.log(dest);
      console.log('Copying oraclejet-tooling/dist/oraclejet-tooling to ojet-cli installation');
      fs.copySync(src, dest, (src, dest) => {
        if (src.indexOf('node_modules') > -1) {
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

  buildSuccess: function _isSuccess(std)
  { 
    return (std.indexOf("Build finished") > -1 || std.indexOf('Code signing') > -1 || std.indexOf("Code Sign") > -1);
  },

  norestoreSuccess: function _yoSuccess(std)
  {
    return (std.indexOf("Your app structure is generated") > -1 ? true : false);
  },   

  noError: function _noError(std)
  {
    return !(/error/i.test(std));
  },  

  isWindows: function _isWindows(OS)
  {
    return /^Windows/.test(OS);
  },

  getCliVersion: function _getCliVersion()
  {
    return pkg.version;
  },

  getJetVersion: function _getJetVersion(app) {
    const pkgPath = path.resolve(this.getAppDir(app), 'node_modules/@oracle/oraclejet/package.json');
    var jetPkg = require(pkgPath);
    return jetPkg.version;
  },

  getPlatform: function _getPlatform(OS)
  {
    var isWindows = /^Windows/.test(OS);
    return isWindows ? 'android' : 'ios';
  },

  succeeded: function _succeeded(std) {
    return /succeeded/.test(std);
  },

  noScaffold: function _noScaffold() {
    return process.argv.indexOf("--noscaffold") > -1 || _isQuick();
  },

  noBuild: function _noBuild() {
    return process.argv.indexOf("--nobuild") > -1 || _isQuick();
  },

  noCordova: function _noCordova() {
    return process.argv.indexOf("--nocordova") > -1 || _isQuick();
  },

  noSass: function _noSass() {
    return process.argv.indexOf("--nosass") > -1 || _isQuick();
  },

  noServe: function _noServe() {
    return process.argv.indexOf("--noserve") > -1 || _isQuick();
  }
};
