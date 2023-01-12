/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const common = require('../../common');
const paths = require('../../lib/util/paths');
const commonMessages = require('../../common/messages');
const commonHybrid = require('../../hybrid');
const cordovaHelper = require('../../hybrid/cordova');
const platformsHelper = require('../../hybrid/platforms');
const utils = require('../../lib/util/utils');

const _configPaths = {};

/*
 * Generator for the add-hybrid step
 */


function _checkIfCordovaIsInstalled() {
  return new Promise((resolve, reject) => {
    childProcess.exec('cordova', (error) => {
      if (error) {
        reject('Cordova not installed. Please install by: "npm install -g cordova"');
      } else {
        resolve();
      }
    });
  });
}

function _setConfigPaths(configPathObj) {
  Object.keys(configPathObj).forEach((key) => {
    _configPaths[key] = configPathObj[key];
  });
}

function _validateAppDirForAddHybrid(addHybrid) {
  return _validateSrcDirExists()
    .then(_validateHybridDirDoesNotExist.bind(addHybrid));
}


function _createExtraSrcDirs(generator) {
  let srcHybridPath = _configPaths.sourceHybrid;
  let srcWebPath = _configPaths.sourceWeb;
  srcWebPath = path.resolve(srcWebPath);
  srcHybridPath = path.resolve(srcHybridPath);
  fs.ensureDirSync(srcHybridPath);
  fs.ensureDirSync(srcWebPath);

  return Promise.resolve(generator);
}

function _validateSrcDirExists() {
  let errorMsg;
  const appSrcPath = _configPaths.source;
  try {
    fs.statSync(path.resolve(appSrcPath));
    return Promise.resolve();
  } catch (err) {
    errorMsg = `Missing '${appSrcPath}' directory. `
             + 'Invalid JET project structure.';
    return Promise.reject(commonMessages.error(errorMsg, 'validateSrcDirExists'));
  }
}

function _validateHybridDirDoesNotExist() {
  let stats;
  let errorMsg;

  try {
    const hybridPath = _configPaths.stagingHybrid;
    stats = fs.statSync(path.resolve(hybridPath));
    if (stats.isDirectory) {
      errorMsg = `The project already contains the '${hybridPath}' directory.`;
      return Promise.reject(commonMessages.error(errorMsg, 'validateHybridDirDoesNotExist'));
    }
  } catch (err) {
    // hybrid dir does not exist, OK to proceed
  }
  return Promise.resolve();
}

function _copyCordovaMocks() {
  const source = path.resolve(__dirname, '../hybrid/templates/common/src/js/');
  const srcHybridPath = _configPaths.sourceHybrid;
  const srcJsPath = _configPaths.sourceJavascript;
  const dest = path.resolve(`./${srcHybridPath}/${srcJsPath}/`);

  return new Promise((resolve, reject) => {
    if (utils.fsExistsSync(source)) {
      fs.copy(source, dest, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    } else {
      reject('Missing file \'cordovaMocks.js\'.');
    }
  });
}

// module.exports = OracleJetAddHybridGenerator;
/**
 * # Entry point for 'add hybrid' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (parameters, opt) {
  const addHybrid = {
    arguments: parameters,
    options: Object.assign({ namespace: 'add-hybrid' }, opt)
  };

  _setConfigPaths(paths.getConfiguredPaths(path.resolve('.')));
  return common.validateArgs(addHybrid)
    .then(_checkIfCordovaIsInstalled)
    .then(() => common.validateFlags(addHybrid))
    .then(() => _validateAppDirForAddHybrid(addHybrid))
    .then(() => {
      addHybrid.appDir = path.basename(path.resolve('.'));
      commonHybrid.setupHybridEnv(addHybrid);
    })
    .then(() => platformsHelper.getPlatforms(addHybrid))
    .then(() => _createExtraSrcDirs(addHybrid))
    .then(() => cordovaHelper.create(addHybrid))
    .then(() => commonHybrid.copyHooks())
    .then(() => commonHybrid.copyResources())
    .then(_copyCordovaMocks)
    .then(() => commonHybrid.removeExtraCordovaFiles())
    .then(() => platformsHelper.addPlatforms(addHybrid))
    .then(() => commonHybrid.updateConfigXml(addHybrid))
    .then(() => {
      utils.log(commonMessages.appendJETPrefix('Add hybrid finished.'));
    })
    .catch((err) => {
      if (err) {
        utils.log(err);
      }
      return Promise.reject();
    });
};
