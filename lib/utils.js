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
const http = require('http');
const https = require('https');
const childProcess = require('child_process');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

// Oracle
const config = require('../config');
const CONSTANTS = require('./utils.constants');

/**
 * # Utils
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
 * ## checkForHttpErrors
 *
 * @public
 * @param {Object} serverResponse
 * @param {string} serverResponseBody
 * @param {function} [doBeforeThrowCallback] - e.g. delete temporary files
 */
utils.checkForHttpErrors = function (serverResponse, serverResponseBody, doBeforeThrowCallback) {
  // Throw for 4xx or 5xx http codes
  const code = serverResponse.statusCode.toString();
  if (['4', '5'].indexOf(code.charAt(0)) > -1) {
    if (typeof doBeforeThrowCallback === 'function') {
      doBeforeThrowCallback();
    }
    let errors = '';

    let resp;
    try {
      resp = JSON.parse(serverResponseBody);
    } catch (e) {
      resp = serverResponseBody;
    }

    if (typeof resp === 'object') {
      resp.errors.forEach((error) => {
        const catalog = url.parse(process.env.catalogUrl);
        const errorPath = `${catalog.path}exceptions/${error.id}`;
        const errorlink = `${catalog.host}${errorPath.replace('//', '/')}`;
        errors += `${error.message}. More info: ${errorlink}${resp.errors.length > 1 ? '\n' : ''}`;
      });
      throw utils.log.error(errors);
    } else {
      throw utils.log.error(resp);
    }
  }
};

/**
 * ## _deleteDir
 *
 * @public
 * @param {string} dirPath
 */
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

/**
 * ## deleteFile
 *
 * @public
 * @param {string} filePath
 * @param {function} [callback]
 */
utils.deleteFile = function (filePath, callback) {
  fs.unlink(filePath, (error) => {
    if (error) {
      throw utils.toError(error);
    }
    if (typeof callback === 'function' && callback()) {
      callback();
    }
  });
};

/**
 * ## ensureCatalogUrl
 * Check if catalog url is configured
 *
 * @public
 */
utils.ensureCatalogUrl = function () {
  const configObj = utils.readJsonAndReturnObject(config.configFile);
  if (!configObj['catalog-url']) {
    utils.log.error('Catalog url is not configured. Please see \'ojet help configure\' for instructions.');
  }
};

/**
 * ## ensureDir
 * Check if directory exists. If not, create it.
 *
 * @public
 * @param {string} dirPath - Path to check
 */
utils.ensureDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

/**
 * ## ensureJetApp
 * Throws error if the application is not JET app
 *
 * @public
 */
utils.ensureJetApp = function () {
  if (!utils.isCwdJetApp()) {
    utils.log.error(utils.toNotJetAppMessage());
  }
};

/**
 * ## ensureJetHybridApp
 * Throws error if the application is not hybrid
 *
 * @public
 */
utils.ensureJetHybridApp = function () {
  if (!utils.isCwdJetApp()) {
    utils.log.error(utils.toNotJetAppMessage());
  } else if (!utils.isCwdHybridApp()) {
    utils.log.error('Hybrid commands can not be used for JET web app.');
  }
};

utils.ensureParameters = function (parameters) {
  if (typeof parameters === 'undefined' || (typeof parameters === 'object' && parameters.length === 0)) {
    utils.log.error(`Please specify command parameters. ${_addHelpMessage()}`);
  }
};

/**
 * ## exec
 * Executes shell tasks asynchronously, outputting Buffer.
 *
 * @public
 * @param {string} command           - The command to run, with space-separated arguments
 * @param {object} [options]         - Options
 * @param {string} [successString]   - If the string appears in output stream, Promise resolves
 * @param {boolean} [logOutput=true] - Logs the output stream
 * @returns {Promise}
 */
utils.exec = function (command, options, successString, logOutput) {
  utils.log(`Executing: ${command}`);
  return new Promise((resolve, reject) => {
    const child = childProcess.exec(command, Object.assign({ maxBuffer: 1024 * 500 }, options));
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
      } else if (LogOutputArg && data !== '{}\n') {
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
 * @public
 * @param {string} source
 * @param {string} destination
 */
utils.fsCopySync = function (source, destination) {
  const exists = fs.existsSync(source);
  const stats = exists && fs.statSync(source);
  const isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    _mkdirSync(destination);
    fs.readdirSync(source).forEach((childItemName) => {
      utils.fsCopySync(path.join(source, childItemName),
        path.join(destination, childItemName));
    });
  } else {
    _linkSync(source, destination);
  }
};

/**
 * ## _mkdirSync
 * if the dir exists, it is skipped
 *
 * @param {string} dirPath
 * @private
 */
function _mkdirSync(dirPath) {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (err.code !== 'EEXIST') throw utils.toError(err);
  }
}

/**
 * ## _linkSync
 * if the destination exists, it is skipped
 *
 * @param {string} source
 * @param {string} destination
 * @private
 */
function _linkSync(source, destination) {
  try {
    fs.linkSync(source, destination);
  } catch (err) {
    if (err.code !== 'EEXIST') throw utils.toError(err);
  }
}

/**
 * ## getDirectories
 *
 * @public
 * @param {string} source
 * @returns {array}
 */
utils.getDirectories = function (source) {
  return fs.readdirSync(source).filter((file) => { // eslint-disable-line
    return utils.isDirectory(path.join(source, file));
  });
};

/**
 * ## isDirectory
 *
 * @public
 * @param {string} source
 * @returns {boolean}
 */
utils.isDirectory = function (source) {
  return fs.statSync(source).isDirectory();
};

/**
 * ## hasHelpFlag
 *
 * @public
 * @param {Object} options
 * @returns {boolean}
 */
utils.hasHelpFlag = function (options) {
  return utils.hasProperty(options, 'help') || utils.hasProperty(options, 'h');
};

/**
 * ## hasProperty
 *
 * @public
 * @param {Object} object
 * @param {string} propertyName
 * @returns {boolean}
 */
utils.hasProperty = function (object, propertyName) {
  return Object.prototype.hasOwnProperty.call(object, propertyName);
};

/**
 * ## request
 * https://nodejs.org/dist/latest-v6.x/docs/api/http.html
 * https://nodejs.org/dist/latest-v6.x/docs/api/https.html
 *
 * @public
 * @param {Object} [options]           - List: https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_http_request_options_callback
 * @param {function} callback
 * @param {string || undefined} [body]
 * @param {Object} [multipartFormData]
 */
utils.request = function (options, callback, body, multipartFormData) {
  let cb = callback;
  let opts = options;

  let protocol = {};

  if (typeof opts === 'string') {
    // Url case
    const urlSplit = opts.split('://');
    protocol = urlSplit[0] === 'https:' ? https : http;
  } else {
    // Options case

    // Make options optional
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    // If catalog url defined, use it as the default
    if (fs.existsSync(config.configFile)) {
      const file = fs.readFileSync(config.configFile, 'utf8');
      const configObj = JSON.parse(file);
      const catalogUrl = configObj['catalog-url'];
      if (catalogUrl) {
        process.env.catalogUrl = catalogUrl;
        const defaults = url.parse(catalogUrl);
        if (defaults.path && opts.path) {
          opts.path = (defaults.path + opts.path).replace('//', '/');
        }
        opts = Object.assign(defaults, opts);
      }
    }

    if (utils.isVerbose()) {
      utils.log('Request options:', opts);
      utils.log('Request body:', body);
    }

    protocol = opts.protocol === 'https:' ? https : http;
  }

  const request = protocol.request(opts, (response) => {
    if (utils.isVerbose()) {
      utils.log('Response status code:', response.statusCode);
      utils.log('Response status message:', response.statusMessage);
      utils.log('Response headers:', response.headers);
    }
    cb(response);
  });

  request.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      utils.log.error('Could not connect to defined url.\nPlease check your proxy setting and configure Catalog url \'ojet help configure\'');
    } else {
      throw utils.toError(`Problem with request: ${error}`);
    }
  });

  if (body) {
    request.write(body);
    request.end();
  } else if (multipartFormData) {
    multipartFormData.pipe(request);
  } else {
    request.end();
  }
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
 * @returns {boolean}
 */
utils.isVerbose = function () {
  return process.env.verbose !== 'false';
};

/**
 * ## log
 * Prints each argument on a new line
 *
 * @public
 */
utils.log = function () {
  // Disabling eslint as spread operator is required
  Object.keys(arguments).forEach((arg) => { // eslint-disable-line
    console.log(arguments[arg]); // eslint-disable-line
  });
};

/**
 * ## log.success
 *
 * @public
 * @param {string} message
 */
utils.log.success = function (message) {
  utils.log(`\x1b[32m${message}\x1b[0m`);
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
 * ## readJsonAndReturnObject
 *
 * @private
 * @param {string} path
 * @returns {Object} object
 */
utils.readJsonAndReturnObject = function (pathToFile) {
  let object = {};
  if (fs.existsSync(pathToFile)) {
    const file = fs.readFileSync(pathToFile, 'utf8');
    try {
      object = JSON.parse(file);
      // If came to here, then valid json
    } catch (e) {
      utils.log.error(`File '${pathToFile}' is not of type 'json'.`);
    }
  } else {
    throw utils.toError(`File path '${pathToFile}' not found.`);
  }
  return object;
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
 * @returns {Promise}
 */
utils.spawn = function (command, options, successString, logOutputArg, spawnOptions) {
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
    const task = childProcess.spawn(cmd, args, spawnOptions);
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
  return 'Current working directory does not seem to be the root of a JET app. Please navigate there.';
};

/**
 * ## toNotJetHybridAppMessage
 *
 * @public
 * @returns {string}
 */
utils.toNotJetHybridAppMessage = function () {
  return 'Current working directory does not seem to be the root of a JET hybrid app.';
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

/**
 * ## validateOptions
 *
 * @public
 * @param {Object} option      - Options object
 */
utils.validateOptions = (options, jobType) => {
  const validKeys = jobType === 'build' ? CONSTANTS.BUILD_OPTIONS : CONSTANTS.SERVE_OPTIONS;
  Object.keys(options).forEach((key) => {
    if (validKeys.indexOf(key) === -1) {
      throw utils.toError(`Option ${key} not valid for ojet ${jobType} command`);
    }
  });
  return options;
};

/**
 * ## logModuleName
 *
 * @public
 */
utils.logModuleName = () => {
  console.log('\x1b[42m', 'OJET CLI', '\x1b[0m');
  utils.log('Processing command...');
};

utils.validatePlatform = (platform) => {
  let validPlatform;
  if (!platform) {
    validPlatform = utils.getDefaultPlatform();
    utils.log.warning(`Missing platform. Default to ${validPlatform}.`);
    return validPlatform;
  }
  if (CONSTANTS.SUPPORTED_PLATFORMS.indexOf(platform) > -1) {
    return platform;
  }
  utils.log.error(`Invalid platform: ${platform}.`);
  return false;
};

/**
 * ## getDefaultPlatform
 * if single platform, return that platform
 *
 * @public
 * @returns {string}
 */

utils.getDefaultPlatform = () => {
  const ojetConfig = utils.loadTooling().config;
  const pathConfig = ojetConfig.getConfiguredPaths();
  const isHybrid = fs.existsSync(
    path.resolve(pathConfig.staging.hybrid, CONSTANTS.CORDOVA_CONFIG_XML));
  const isAddHybrid = fs.existsSync(path.resolve(pathConfig.src.web))
                      || fs.existsSync(path.resolve(pathConfig.src.hybrid));

  if (isHybrid) {
    const platforms = _getInstalledPlatforms(pathConfig.staging.hybrid);
    // if only one platform is installed, default to that one
    if (platforms.length === 1 && !isAddHybrid) {
      return platforms[0];
    }
    // if multiple platforms are installed, throw error
    const supportedPlatforms = CONSTANTS.SUPPORTED_PLATFORMS.toString().replace(/,/g, '||');
    utils.log.error(`Missing platform. Please specify one of "<${supportedPlatforms}>"`);
  }
  return 'web';
};

function _getInstalledPlatforms(cordovaPath) {
  try {
    const platformsJSON = utils.readJsonAndReturnObject(path.join(cordovaPath, 'platforms', 'platforms.json'));
    const platforms = Object.keys(platformsJSON);
    return platforms.filter(value => value !== 'browser');
  } catch (error) {
    throw error;
  }
}

utils.validateThemes = (themeString) => {
  if (themeString) {
    return themeString.split(',');
  }
  return undefined;
};

utils.validatePlatformOptions = (platformOptions, platform) => {
  if (platformOptions && platform === 'web') {
    utils.log.warning(`--platform-options has no effect for platform: ${platform}.`);
    return '';
  }
  return platformOptions;
};


utils.getBuildCustomizedConfig = () => {
  let customConfig = {};
  const scriptPath = path.join(process.cwd(), CONSTANTS.CONFIG_SCRIPT_PATH, CONSTANTS.BUILD_SCRIPT);
  const scriptPathBackUp = path.join(process.cwd(),
    CONSTANTS.CONFIG_SCRIPT_PATH_BACKUP, CONSTANTS.BUILD_SCRIPT);
  if (fs.existsSync(scriptPath)) {
    customConfig = require(scriptPath)(); // eslint-disable-line
  } else if (fs.existsSync(scriptPathBackUp)) {
    customConfig = require(scriptPathBackUp)(); // eslint-disable-line
  } else {
    utils.log.warning(`No build configuration script found at ${scriptPath}.`);
  }
  return customConfig;
};

utils.getServeCustomizedConfig = () => {
  let customConfig = {};
  const scriptPath = path.join(process.cwd(), CONSTANTS.CONFIG_SCRIPT_PATH, CONSTANTS.SERVE_SCRIPT);
  const scriptPathBackUp = path.join(process.cwd(),
    CONSTANTS.CONFIG_SCRIPT_PATH_BACKUP, CONSTANTS.SERVE_SCRIPT);
  if (fs.existsSync(scriptPath)) {
    customConfig = require(scriptPath)(); // eslint-disable-line
  } else if (fs.existsSync(scriptPathBackUp)) {
    customConfig = require(scriptPathBackUp)(); // eslint-disable-line
  } else {
    utils.log.warning(`No serve configuration script found at ${scriptPath}.`);
  }
  return customConfig;
};

utils.validateServeOptions = (serveOptions, targetKey, platform) => {
  let customOptions = {};
  if (serveOptions) {
    if (platform === 'web' && serveOptions.web && serveOptions.web[targetKey]) {
      customOptions = Object.assign({}, serveOptions[targetKey], serveOptions.web[targetKey]);
    } else if (platform === 'hybrid' && serveOptions.hybrid && serveOptions.hybrid[targetKey]) {
      customOptions = Object.assign({}, serveOptions[targetKey], serveOptions.hybrid[targetKey]);
    } else if (serveOptions[targetKey]) {
      customOptions = Object.assign({}, serveOptions[targetKey]);
    }
  }
  return customOptions;
};

utils.loadTooling = () => {
  const toolingPath = path.join(process.cwd(), 'node_modules/@oracle/oraclejet-tooling');
  // Oracle command libs
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    return tooling;
  }
  throw utils.toError('Your JET project does not have oraclejet-tooling installed.');
};
