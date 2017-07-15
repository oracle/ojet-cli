#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;

// Oracle
const config = require('../config');

/**
 * # oJET Utils
 *
 * @public
 */
const utils = module.exports;

/**
 * ## cdFromCordovaDirectory
 * Set application directory the current working directory
 *
 * @public
 * @returns {Promise}
 */
utils.cdFromCordovaDirectory = function () {
  return new Promise((resolve) => {
    process.chdir('..');
    resolve();
  });
};

/**
 * ## cdToCordovaDirectory
 * Set Cordova directory the current working directory
 *
 * @public
 * @returns {Promise}
 */
utils.cdToCordovaDirectory = function () {
  return new Promise((resolve) => {
    process.chdir('hybrid');
    resolve();
  });
};

/**
 * ## cloneObject
 *
 * @public
 * @param {Object} original
 * @returns {Object}
 */
utils.cloneObject = function (original) {
  return Object.assign({}, original);
};

/**
 * ## checkAndMakeDir
 * Check if directory exists. If not, create it.
 *
 * @public
 * @param {string} path - Path to check
 */
utils.checkAndMakeDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

/**
 * ## ensureHybrid
 * Throws error if the application is not hybrid
 *
 * @public
 */
utils.ensureHybrid = function () {
  if (!utils.isCwdJetApp()) {
    utils.log.error(utils.toNotJetAppMessage());
  } else if (!utils.isCwdHybridApp()) {
    utils.log.error('Hybrid commands can not be used for JET web app.');
  }
};

/**
 * ## exec
 * Executes shell tasks asynchronously, outputting Buffer.
 *
 * @public
 * @param {string} command           - The command to run, with space-separated arguments
 * @param {string} [successString]   - If the string appears in output stream, Promise resolves
 * @param {boolean} [logOutput=true] - Logs the output stream
 * @returns {Promise}
 */
utils.exec = function (command, successString, logOutput) {
  utils.log(`Executing: ${command}`);
  return new Promise((resolve, reject) => {
    const child = childProcess.exec(command, { maxBuffer: 1024 * 500 });
    let LogOutputArg = logOutput;

    child.stdout.on('data', (data) => {
      if (LogOutputArg === undefined) {
        LogOutputArg = true;
      }

      if (successString && data.indexOf(successString) !== -1) {
        /*
         * We want to log this even when logging is disabled, since the outputString
         * typically contains key information that the user needs to know, eg. the
         * hostname:port in the server-only case.
         */
        utils.log(data);
        resolve();
      } else if (LogOutputArg) {
        utils.log(data);
      }
    });

    child.stderr.on('data', (data) => {
      utils.log(data);
      reject(data);
    });

    child.on('error', (err) => {
      reject(err);
    });
    // If childProcess invokes multiple proccesses(Cordova run, boot Android emulator).
    // The close event is triggered when all these processes stdio streams are closed.
    child.on('close', (code) => {
      if (code === 0) {
        utils.log(`child process exited with code: ${code}`);
        resolve();
      } else {
        reject(`child process exited with code: ${code}`);
      }
    });
  });
};

/**
 * ## fsCopySync
 * Look ma, it's cp -R.
 *
 * @param {string} source
 * @param {string} destination
 */
utils.fsCopySync = function (source, destination) {
  const exists = fs.existsSync(source);
  const stats = exists && fs.statSync(source);
  const isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(destination);
    fs.readdirSync(source).forEach((childItemName) => {
      utils.fsCopySync(path.join(source, childItemName),
        path.join(destination, childItemName));
    });
  } else {
    fs.linkSync(source, destination);
  }
};

/**
 * ## getDirectories
 *
 * @param {string} source
 * @returns {array}
 */
utils.getDirectories = function (source) {
  return fs.readdirSync(source).filter((file) => { // eslint-disable-line
    // ToDo: use utils.isDirectory()
    return fs.statSync(path.join(source, file)).isDirectory();
  });
};

/**
 * ## isDirectory
 *
 * @param {string} source
 * @returns {boolean}
 */
utils.isDirectory = function (source) {
  return fs.statSync(source).isDirectory();
};

/**
 * ## hasHelpFlag
 *
 * @param {Object} object
 * @returns {boolean}
 */
utils.hasHelpFlag = function (options) {
  return utils.hasProperty(options, 'help') || utils.hasProperty(options, 'h');
};

/**
 * ## hasProperty
 *
 * @param {Object} object
 * @param {string} propertyName
 * @returns {boolean}
 */
utils.hasProperty = function (object, propertyName) {
  return Object.prototype.hasOwnProperty.call(object, propertyName);
};

/**
 * ## isCwdJetApp
 * Check whether current directory is a JET app
 *
 * @public
 * @returns {boolean}
 */
utils.isCwdJetApp = function () {
  const cwd = process.cwd();

  // Check if includes oraclejet-tooling
  return fs.existsSync(path.join(cwd, 'oraclejetconfig.json'));
};

/**
 * ## isCwdHybridApp
 * Check whether current directory is a JET app
 *
 * @public
 * @returns {boolean}
 */
utils.isCwdHybridApp = function () {
  const cwd = process.cwd();

  // Check if includes config.xml
  const directories = fs.readdirSync(cwd).filter((file) => {
    const isDirectory = fs.statSync(path.join(cwd, file)).isDirectory();
    return isDirectory;
  });
  for (let i = 0; i < directories.length; i += 1) {
    const configPath = path.join(cwd, directories[i], 'config.xml');
    if (fs.existsSync(configPath)) {
      return true;
    }
  }
  return false;
};

/**
 * ## isObjectEmpty
 *
 * @param {Object} object
 * @returns {boolean}
 */
utils.isObjectEmpty = function (object) {
  if (typeof object === 'object') {
  // Because Object.keys(new Date()).length === 0; we have to do some additional check
    return Object.keys(object).length === 0 && object.constructor === Object;
  }
  return true;
};

/**
 * ## isTestEnv
 *
 * @returns {boolean}
 */
utils.isTestEnv = function () {
  return process.env.NODE_ENV === config.env.test;
};

/**
 * ## isVerbose
 *
 * @param {Object} object
 * @returns {boolean}
 */
utils.isVerbose = function (object) {
  return utils.hasProperty(object, 'verbose');
};

/**
 * ## log
 *
 * @public
 * @param {Object, string} message
 */
utils.log = function (message) {
  console.log(message);
};

/**
 * ## log.success
 *
 * @public
 * @param {string} message
 */
utils.log.success = function (message) {
  utils.log(`\x1b[32mInfo: ${message}\x1b[0m`);
  process.exit(0);
};

/**
 * ## log.warning
 *
 * @public
 * @param {string} message
 */
utils.log.warning = function (message) {
  utils.log(`\x1b[33mWarning: ${message}\x1b[0m`);
};

/**
 * ## log.error
 *
 * @public
 * @param {string} message
 */
utils.log.error = function (message) {
  utils.log(`\x1b[31mError: ${message}\x1b[0m`);
  process.exit(0);
};

/**
 * ## spawn
 * Executes shell commands asynchronously, returning Stream.
 *
 * @public
 * @param {string} command              - The command to run
 * @param {Array} options               - Array of arguments
 * @param {string} [successString]      - If the string appears in output stream, Promise resolves
 * @param {boolean} [logOutputArg=true] - Logs the output stream
 * @returns {Promise}
 */
utils.spawn = function (command, options, successString, logOutputArg) {
  /* unfortunately this is necessary for one to preserve the PATH for windows
   * there is a bug for nodejs (don't recall) dating back to 2012 or 13 and think
   * they won't fix it, since there were comments regarding status update from 2015
   */
  let cmd = command;
  let args = [];
  let logOutput = logOutputArg;
  if (process.platform === 'win32') {
    cmd = 'cmd.exe';
    args = ['/s', '/c', command];
  }

  /* Join with other options*/
  args = args.concat(options);

  utils.log(`Executing: ${cmd} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    const task = childProcess.spawn(cmd, args);
    const decoder = new StringDecoder('utf8');

    task.stdout.on('data', (data) => {
      const search = decoder.write(data);

      if (logOutput === undefined) {
        logOutput = true;
      }

      if (successString && search.indexOf(successString) !== -1) {
        /*
         * We want to log this even when logging is disabled, since the outputString
         * typically contains key information that the user needs to know, eg. the
         * hostname:port in the server-only case.
         */
        utils.log(search);
        resolve();
      } else if (logOutput) {
        utils.log(search);
      }
    });

    task.stderr.on('data', (data) => {
      utils.log(_bufferToString(data));
    });

    task.on('error', (err) => {
      reject(err);
    });

    task.on('close', (code) => {
      if (code === 0) {
        utils.log(`child process exited with code: ${code}`);
        resolve();
      } else {
        reject(`child process exited with code: ${code}`);
      }
    });
  });
};

/**
 * ## _bufferToString
 *
 * @private
 * @param {Object, string} [bufferOrString]
 * @returns {string}
 */
function _bufferToString(bufferOrString) {
  const output = bufferOrString || '';
  return Buffer.isBuffer(output) ? output.toString('utf8') : output;
}

/**
 * ## toError
 *
 * @public
 * @param {string} message
 * @returns {string}
 */
utils.toError = function (message) {
  return `\x1b[31m${new Error(message)}\x1b[0m`;
};

/**
 * ## toMissingInputMessage
 *
 * @public
 * @param {string} [input]
 * @returns {string}
 */
utils.toMissingInputMessage = function (input) {
  const inp = input ? ` ${input}` : '';
  return `Contiguous input for 'ojet${inp} ...' is missing. ${_addHelpMessage()}`;
};

/**
 * ## toIsNotJetApp
 *
 * @public
 * @returns {string}
 */
utils.toNotJetAppMessage = function () {
  return 'Current working directory does not seem to be the root of a JET app.';
};

/**
 * ## toNotSupportedMessage
 *
 * @public
 * @param {string} input
 * @returns {string}
 */
utils.toNotSupportedMessage = function (input) {
  return `Sorry, 'ojet ${input}' is not supported. ${_addHelpMessage()}`;
};

/**
 * ## _addHelpMessage
 *
 * @private
 * @returns {string}
 */
function _addHelpMessage() {
  return '\n\x1b[0mPlease see help page: \x1b[32m\'ojet help\'\x1b[0m\n';
}
