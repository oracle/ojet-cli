/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const commonMessages = require('./messages');
const CONSTANTS = require('../util/constants');
const util = require('../lib/utils');
const app = require('../lib/scopes/app');

module.exports =
{
  writeGitIgnore: function _writeGitIgnore() {
    const gitSource = path.resolve('.', '_gitignore');
    const gitDest = path.resolve('.', '.gitignore');

    return new Promise((resolve, reject) => {
      fs.move(gitSource, gitDest, (err) => {
        if (err) {
          reject(commonMessages.error(err, 'writeGitIgnore'));
        } else {
          resolve();
        }
      });
    });
  },

  writeCommonTemplates: function _writeCommonTemplates() {
    const templateSrc = path.resolve(__dirname, '../template/common');
    const templateDest = path.resolve('.');
    return new Promise((resolve, reject) => {
      fs.copy(templateSrc, templateDest, (err) => {
        if (err) {
          reject(commonMessages.error(err, 'writeCommonTemplates'));
        } else {
          resolve();
        }
      });
    });
  },

  updatePackageJSON: function _updatePacakgeJSON(generator) {
    return new Promise((resolve) => {
      _updateJSONAppName(generator, 'package.json');
      resolve(generator);
    });
  },

  validateAppDirNotExistsOrIsEmpty: function _validateAppDirNotExistsOrIsEmpty(generator) {
    return new Promise((resolve, reject) => {
      const appDir = _handleAbsoluteOrMissingPath(generator);
      fs.stat(appDir, (err) => {
        if (err) {
          // Proceed to scaffold if appDir directory doesn't exist
          resolve(appDir);
        } else {
          fs.readdir(appDir, (readErr, items) => {
            const isEmpty = (!items || !items.length);
            if (isEmpty) {
              // Proceed to scaffold if appDir directory is empty
              resolve(appDir);
            } else {
              items.forEach((filename) => {
                if (_fileNotHidden(filename)) {
                  const error = `path already exists and is not empty: ${path.resolve(appDir)}`;
                  reject(commonMessages.error(error, 'validateAppDir'));
                } else if (filename === '.gitignore') {
                  const error = 'path already exists and contains a .gitignore file';
                  reject(commonMessages.error(error, 'validateAppDir'));
                }
              });
              resolve(appDir);
            }
          });
        }
      });
    });
  },

  switchToAppDirectory: function _switchToAppDirectory(generator) {
    process.chdir(path.basename(path.resolve(generator.appDir)));
    return Promise.resolve(generator);
  },

  switchFromAppDirectory: () => {
    process.chdir('..');
    return Promise.resolve();
  },

  validateArgs: function _validateArgs(generator) {
    return new Promise((resolve, reject) => {
      const args = generator.arguments;
      const validLength = _getValidArgLength(generator.options.namespace);

      if (args.length > validLength) {
        reject(commonMessages.error(`Invalid additional arguments: ${args.splice(validLength)}`, 'validateArgs'));
      } else {
        resolve(generator);
      }
    });
  },

  validateFlags: function _validateFlags(generator) {
    return new Promise((resolve, reject) => {
      const flags = generator.options;
      const SUPPORTED_FLAGS = CONSTANTS.SUPPORTED_FLAGS(flags.namespace);
      Object.keys(flags).forEach((key) => {
        if (SUPPORTED_FLAGS.indexOf(key) === -1) {
          if (['platforms', 'platform', 'appid', 'appname'].indexOf(key) !== -1) {
            reject(commonMessages.error(`Invalid flag: ${key} without flag --hybrid`, 'validateFlags'));
          }
          reject(commonMessages.error(`Invalid flag: ${key}`, 'validateFlags'));
        }
      });

      resolve(generator);
    });
  },

  fsExistsSync(filePath) {
    try {
      fs.statSync(filePath);
      return true;
    } catch (err) {
      // file/directory does not exist
      return false;
    }
  },

  addTypescript: (generator) => {
    if (generator.options.typescript || util.isTypescriptApplication()) {
      return app.addTypescript();
    }
    return Promise.resolve();
  }
};

function _getValidArgLength(namespace) {
  // add-hybrid allows no argument
  // add-theme, app, hybrid, optional to take 1 argument
  return (/add-hybrid/.test(namespace))
  ? 0 : 1;
}

function _fileNotHidden(filename) {
  return !/^\..*/.test(filename);
}

function _handleAbsoluteOrMissingPath(generator) {
  let appDir = generator.appDir;
  if (appDir === undefined || appDir === null) {
    // Use current directory
    appDir = path.basename('.');
  }
  const appDirObj = path.parse(appDir);
  // appDir is absolute or missing
  if (path.isAbsolute(appDir) || appDirObj.dir) {
    const parentDir = path.resolve(appDir, '..');
    fs.ensureDirSync(parentDir);
    appDir = appDirObj.base;
  } else if (appDirObj.name === '.') {
    const absolutePath = path.resolve(appDir);
    appDir = path.basename(absolutePath);
  }
  return appDir;
}

function _updateJSONAppName(generator, jsonPath) {
  const json = fs.readJSONSync(path.resolve('.', jsonPath));
  // space in app name will result in npm install failure
  json.name = _removeSpaceInAppName(generator.options.appname);
  fs.writeJSONSync(path.resolve('.', jsonPath), json);
}

function _removeSpaceInAppName(appName) {
  return appName.replace(/\s/g, '-');
}
