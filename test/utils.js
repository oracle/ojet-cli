/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const StringDecoder = require('string_decoder').StringDecoder;

const utils = module.exports;

utils.bowerCopySuccess = function (std) {
  return std.indexOf('All modules accounted') > -1;
};

utils.buildSuccess = function _isSuccess(std) {
  return std.indexOf('Build finished') > -1 || std.indexOf('Code signing') > -1 || std.indexOf('Code Sign') > -1;
};

utils.serveSuccess = function _isSuccess(std) {
  return std.indexOf('Starting watcher') > -1 || std.indexOf('after_server hook') > -1;
};

utils.deleteDir = function (dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = `${dirPath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        utils.deleteDir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

utils.getJetVersion = function (filePath, file) {
  return fs.readdirSync(path.join(filePath, file));
};

utils.getPlatform = function (OS) {
  const isWindows = /^Windows/.test(OS);
  return isWindows ? 'android' : 'ios';
};

utils.ensureDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

utils.isCordovaSuccess = function (std) {
  return (std.indexOf('BUILD SUCCESSFUL') > -1);
};

utils.isCheckedOut = function (std) {
  return std.indexOf('Checked out revision') > -1;
};

utils.isNoRestoreTest = function () {
  return process.env.expressTest === 'true';
};

utils.isSuccess = function (std) {
  return std.indexOf('without errors') > -1;
};

utils.isWindows = function (OS) {
  return /^Windows/.test(OS);
};

utils.matchInArray = function (string, arrayOfStrings) {
  for (let i = 0; i < arrayOfStrings.length; i += 1) {
    if (arrayOfStrings[i].match(new RegExp(string))) {
      return true;
    }
  }
  return false;
};

utils.noError = function (std) {
  return !(/error/i.test(std));
};

utils.norestoreSuccess = function (std) {
  return std.indexOf('Oracle JET Error') <= -1;
};

utils.notSupported = function (std) {
  return std.indexOf('not supported') > 0;
};

/**
 * ## spawn
 * Executes shell commands asynchronously, returning Stream.
 *
 * @public
 * @param {string} command              - The command to run
 * @param {Array} [options]             - Array of arguments
 * @param {string} [successString]      - If the string appears in output stream, Promise resolves
 * @param {boolean} [logOutputArg=true] - Logs the output stream
 * @param {function} callback           - Success
 * @returns {Promise}
 */
utils.spawn = function (command, options, successString, logOutputArg, spawnOptions, callback) {
  /* unfortunately this is necessary for one to preserve the PATH for windows
   * there is a bug for nodejs (don't recall) dating back to 2012 or 13 and think
   * they won't fix it, since there were comments regarding status update from 2015
   */
  let cmd = command;
  let args = [];
  const logOutput = logOutputArg;
  if (process.platform === 'win32') {
    cmd = 'cmd.exe';
    args = ['/s', '/c', command];
  }

  /* Join with other options*/
  args = args.concat(options);

  const task = childProcess.spawn(cmd, args, spawnOptions);

  task.stdout.on('data', (data) => {
    _processOutput(data, successString, logOutput, callback, task);
  });

  task.stderr.on('data', (data) => {
    _processOutput(data, successString, logOutput, callback, task);
  });

  task.on('error', (err) => {
    _processOutput(err, successString, logOutput, callback, task);
  });

  task.on('close', (code) => {
    if (code === 0) {
      console.log(`child process exited with code: ${code}`);
      callback(task);
    } else if (code === null) {
      console.log('child process was intentionally killed.');
    } else {
      console.log(`child process exited with code: ${code}`);
    }
  });
};

function _processOutput(data, successString, logOutputArg, callback, task) {
  let logOutput = logOutputArg;
  const decoder = new StringDecoder('utf8');
  const search = decoder.write(data);

  if (logOutput === undefined) {
    logOutput = true;
  }

  if (successString && search.indexOf(successString) !== -1) {
    callback(task);
  } else if (logOutput) {
    console.log(search);
  }
}
