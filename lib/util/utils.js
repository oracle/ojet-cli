#! /usr/bin/env node
/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

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
const config = require('../../config');
const constants = require('./constants');

/**
 * # Utils
 *
 * @public
 */
const utils = module.exports;

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
      utils.log.error(error);
    }
    if (typeof callback === 'function' && callback()) {
      callback();
    }
  });
};

/**
 * ## ensureExchangeUrl
 * Check if exchange url is configured
 *
 * @public
 */
utils.ensureExchangeUrl = function () {
  const configObj = utils.readJsonAndReturnObject(config.configFile);
  if (!configObj[config.exchangeUrlParam]) {
    utils.log.error('Exchange url is not configured. Please see \'ojet help configure\' for instructions.');
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
 * Logs error if the application is not JET app
 *
 * @public
 */
utils.ensureJetApp = function () {
  if (!utils.isCwdJetApp()) {
    utils.log.error(utils.toNotJetAppMessage());
    return false;
  }
  return true;
};

/**
 * ## ensureJetHybridApp
 * Logs error if the application is not hybrid
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

/**
 * ## ensureParameters
 *
 * @public
 * @param {string || Array} parameters
 */
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
 * Recursively copy whole directory hierarchies
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
    _copySync(source, destination);
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
    if (err.code !== 'EEXIST') utils.log.error(err);
  }
}

/**
 * ## _copySync
 * if the destination exists, it is skipped
 *
 * @param {string} source
 * @param {string} destination
 * @private
 */
function _copySync(source, destination) {
  try {
    fs.writeFileSync(destination, fs.readFileSync(source));
  } catch (err) {
    if (err.code !== 'EEXIST') utils.log.error(err);
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
 * ## hasGlobalOption
 *
 * @public
 * @param {Object} options
 * @returns {boolean}
 */
utils.hasGlobalOption = function (options) {
  return utils.hasProperty(options, 'global');
};

/**
 * ## hasHelpFlag
 *
 * @public
 * @param {Object} options
 * @returns {boolean}
 */
utils.hasHelpFlag = function (options) {
  return utils.hasProperty(options, 'help');
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
 * ## isCwdJetApp
 * Check whether current directory is a JET app
 *
 * @public
 * @returns {boolean}
 */
utils.isCwdJetApp = function () {
  const cwd = process.cwd();
  // Check if includes oraclejet-tooling
  return fs.existsSync(path.join(cwd, constants.APP_CONFIG_JSON));
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
  // todo: come up with logging mechanism, for now
  // don't log when using API
  const OJET = JSON.parse(process.env.OJET || false);
  const log = !OJET || (OJET && OJET.logs);
  if (log) {
    // Disabling eslint as spread operator is required
    Object.keys(arguments).forEach((arg) => { // eslint-disable-line
      console.log(arguments[arg]); // eslint-disable-line
    });
  }
};

/**
 * ## log.success
 *
 * @public
 * @param {string} message
 */
utils.log.success = function (message) {
  utils.log(`Success: ${message}`);
};

/**
 * ## log.warning
 *
 * @public
 * @param {string} message
 */
utils.log.warning = function (message) {
  utils.log(`Warning: ${message}`);
};

/**
 * ## log.error
 *
 * @public
 * @param {string} message
 */
utils.log.error = function (message) {
  const msgString = (message && message.stack) ? message.stack : message;
  utils.log(`Error: ${msgString}`);
  if (!process.env.OJET) {
    process.exit(1);
  }
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
    utils.log.error(`File path '${pathToFile}' not found.`);
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

  const allowProcessOutput = spawnOptions ? spawnOptions.allowProcessOutput : true;
  if (allowProcessOutput) {
    utils.log(`Executing: ${cmd} ${args.join(' ')}`);
  }

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
        if (allowProcessOutput) {
          utils.log(`child process exited with code: ${code}`);
        }
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
  return 'Please see help page: \'ojet help\'\n';
}

/**
 * ## validateOptions
 *
 * @public
 * @param {Object} options - Options object
 * @param {string} jobType - 'build' vs. 'serve'
 * @returns {Object} options
 */
utils.validateOptions = (options, jobType) => {
  const validKeys = constants.SYSTEM_OPTIONS.concat(jobType === 'build' ? constants.BUILD_OPTIONS : constants.SERVE_OPTIONS);
  Object.keys(options).forEach((key) => {
    if (validKeys.indexOf(key) === -1) {
      utils.log.error(`Option ${key} not valid for ojet ${jobType} command`);
    }
  });
  return options;
};

/**
 * ## validateParameters
 *
 * @public
 * @param {Array} parameters
 * @param {number} max - max allowed parameters
 */
utils.validateParametersCount = (parameters, max) => {
  let params = parameters;
  if (params && params.constructor === Array && params.length > max) {
    params = params.slice(max, params.length);
    utils.log.warning(`Invalid parameters: ${params.toString()}`);
  }
};

utils.validatePlatform = (platform) => {
  let validPlatform;
  if (!platform) {
    validPlatform = utils.getDefaultPlatform();
    if (!utils.loadToolingUtil().buildWithWebpack()) {
      utils.log.warning(`Command is missing platform. Default to ${validPlatform}.`);
    }
    return validPlatform;
  }
  if (constants.SUPPORTED_PLATFORMS.indexOf(platform) > -1) {
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
    path.resolve(pathConfig.staging.hybrid, constants.CORDOVA_CONFIG_XML));
  const isAddHybrid = fs.existsSync(path.resolve(pathConfig.src.web))
                      || fs.existsSync(path.resolve(pathConfig.src.hybrid));

  if (isHybrid) {
    const platforms = _getInstalledPlatforms(pathConfig.staging.hybrid);
    // if only one platform is installed, default to that one
    if (platforms.length === 1 && !isAddHybrid) {
      return platforms[0];
    }
    // if multiple platforms are installed, log error
    const supportedPlatforms = constants.SUPPORTED_PLATFORMS.toString().replace(/,/g, '||');
    utils.log.error(`Command is missing platform. Please specify one of "<${supportedPlatforms}>"`);
  }
  return 'web';
};

function _getInstalledPlatforms(cordovaPath) {
  try {
    const platforms = fs.readdirSync(path.join(cordovaPath, 'platforms'));
    return platforms.filter(value => value !== 'browser');
  } catch (error) {
    utils.log.error(error);
    return false;
  }
}

utils.validateThemes = (themeString) => {
  if (themeString.themes) {
    return themeString.themes.split(',');
  }
  if (!themeString.nosass && !themeString.themes && !themeString.theme && !themeString.sass) {
    return ['all'];
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

utils.validCustomProperties = () => utils.loadToolingUtil().getInstalledCssPackage();

utils.validateSassInstall = () => utils.loadToolingUtil().validateSassInstall();

utils.loadTooling = () => {
  const toolingPath = path.join(process.cwd(), constants.TOOLING_PATH);
  // Oracle command libs
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    return tooling;
  }
  try {
    // Use global install if available
    const tooling = require(constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME); // eslint-disable-line
    return tooling;
  } catch (e) {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
    return false;
  }
};

/**
 * ## loadToolingUtil
 *
 * Get tooling util lib to avoid duplicating
 * code needed in both ojet-cli and oraclejet-tooling
 *
 * @private
 * @returns {object} tooling util object
 */
utils.loadToolingUtil = () => {
  const toolingPath = path.join(process.cwd(), constants.TOOLING_PATH);
  if (fs.existsSync(toolingPath)) {
    return require(path.join(toolingPath, 'lib', 'util')); // eslint-disable-line
  }
  try {
    // Use global install if available
    const tooling = require(`${constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME}/lib/util`); // eslint-disable-line
    return tooling;
  } catch (e) {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
    return false;
  }
};

/**
 * ## isTypescriptApplication
 *
 * Determine whether the current application is
 * Typescirpt-based.
 *
 * @private
 * @returns {boolean} true if is Typescript application,
 * false otherwise
 */
utils.isTypescriptApplication = () => fs.existsSync(path.join('.', constants.TSCONFIG_JSON));

/**
 * Determine whether the provided template corresponds
 * to an NPM template
 *
 * @param {string} template
 * @returns {boolean} whether the provided template corresponds
 * to an NPM template
 *
 */
utils.isNPMTemplate = template => constants.NPM_TEMPLATES.indexOf(template) !== -1;

/**
 *
 * @param {string} options.dir directory
 * @param {boolean} options.recursive
 * @returns {Array<string>} files in directory
 */
utils.readdirSync = ({ dir, recursive }) => {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const _path = path.join(dir, dirent.name);
    return recursive && dirent.isDirectory() ? utils.readdirSync({ dir: _path, recursive }) : _path;
  });
  return Array.prototype.concat(...files);
};

/**
 * ## convertStringBooleansToRealBooleans
 * 'true' & 'false' parsed from the command line are of a string type.
 * This is a conversion to real booleans.
 * E.g. ojet serve --build false
 *
 * @private
 * @param {Object} options
 * @return {Object} optionsCopy
 */
utils.convertStringBooleansToRealBooleans = (options) => {
  const optionsCopy = utils.cloneObject(options);
  Object.keys(optionsCopy).forEach((key) => {
    if (utils.hasProperty(optionsCopy, key)) {
      if (optionsCopy[key] === 'true') {
        optionsCopy[key] = true;
      } else if (options[key] === 'false') {
        optionsCopy[key] = false;
      }
    }
  });
  return optionsCopy;
};

/**
 * Determine whether the current template corresponds
 * to an VDOM template
 *
 * @param {object} options.options ojet flag values like
 * --vdom, --template etc
 * @returns {boolean}
 *
 */
utils.isVDOMTemplate = ({ options }) => {
  const hasVDOMFlag = options.vdom;
  const hasVDOMTemplate = options.template && options.template.endsWith('-vdom');
  return hasVDOMFlag || hasVDOMTemplate;
};

/**
 * Determine if filePath exists
 * @param {String} filePath
 * @returns {boolean}
 */
utils.fsExistsSync = (filePath) => {
  try {
    fs.statSync(filePath);
    return true;
  } catch (err) {
    // file/directory does not exist
    return false;
  }
};

/**
 * Retrieve oraclejetconfig.json path
 * @returns {string}
 */
utils.getOracleJetConfigPath = () => {
  const cwd = process.cwd();
  const oraclejetConfigPath = path.join(cwd, constants.APP_CONFIG_JSON);
  if (utils.fsExistsSync(oraclejetConfigPath)) {
    return oraclejetConfigPath;
  }
  return undefined;
};

/**
 * Determine the proper @oracle/oraclejet-tooling module location path (global or local)
 * @returns {string} path to @oracle/oraclejet, preferring local
 */
utils.getToolingPath = () => {
  let source = path.resolve(`${constants.TOOLING_PATH}`);

  if (utils.fsExistsSync(source)) {
    return source;
  }
  source = path.dirname(require.resolve(`${constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME}/package.json`));
  if (utils.fsExistsSync(source)) {
    return source;
  }

  // Not found anywhere
  return null;
};

/**
 * Determine the installed version of an npm package
 *
 * @param {string} pkg package to check
 * @returns version of package if installed, null if not
 */
utils.getPackageVersion = (pkg) => {
  let pkgSource = path.join('node_modules', pkg, 'package.json');
  if (!fs.existsSync(pkgSource)) {
    // Try general resolve
    try {
      pkgSource = require.resolve(`${pkg}/package.json`);
    } catch (e) {
      // Not found at all
      return null;
    }
  }
  if (pkgSource) {
    // Read the version from the json
    const packageJson = utils.readJsonAndReturnObject(pkgSource);
    if (packageJson) {
      return packageJson.version;
    }
  }
  return null;
};


/**
 * Return the proper installer command
 * @param {Object} options
 * @returns {Object} installer command & verb
 */
utils.getInstallerCommand = (options) => {
  const useCI = utils.hasProperty(options, 'ci');
  let installerCmd = options.installer;
  if (!installerCmd) {
    const configPath = path.join(process.cwd(), constants.APP_CONFIG_JSON);
    const configJson = utils.readJsonAndReturnObject(configPath);
    installerCmd = configJson.installer || constants.DEFAULT_INSTALLER;
  }
  const npmInstallCmd = useCI ? 'ci' : 'install';
  return installerCmd === 'yarn' ? { installer: 'yarn', verbs: { install: 'install' } } : { installer: 'npm', verbs: { install: npmInstallCmd } };
};
