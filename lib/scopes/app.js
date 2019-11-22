/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');
const path = require('path');

// Oracle
const config = require('../../config');
const CONSTANTS = require('../utils.constants');
const paths = require('../utils.paths');
const pckg = require('../../package.json');
const tooling = require('../tooling');
const utils = require('../utils');
const addTheme = require('../../generators/add-theme');
const addPcssTheme = require('../../generators/add-pcss-theme');
const addHybrid = require('../../generators/add-hybrid');
const addComponent = require('../../generators/add-component');
const addAppHybrid = require('../../generators/hybrid');
const addApp = require('../../generators/app');

/**
 * ## Variables
 */
const cwd = process.cwd();
const configPath = path.resolve(cwd, CONSTANTS.APP_CONFIG_JSON);

/**
 * # App
 *
 * @public
 */
const app = module.exports;

/**
 * ## create
 *
 * @public
 * @param {string} [parameter]
 * @param {Object} [options]
 */
app.create = function (parameter, options, util) {
  const opts = options;
  if (opts && utils.hasProperty(opts, 'hybrid')) {
    // Deleting 'hybrid' flag
    delete opts.hybrid;
    addAppHybrid(parameter, opts, util);
  } else {
    // Deleting 'web' flag
    if (opts && utils.hasProperty(opts, 'web')) {
      delete opts.web;
    }
    addApp(parameter, opts, util);
  }
};

app.createComponent = function (parameter, options, util) {
  addComponent(parameter, options, util);
};

app.createTheme = function (parameter, options, util) {
  const customProp = fs.existsSync(`${path.resolve(process.cwd())}/node_modules/postcss-custom-properties`);
  if (!customProp) {
    addTheme(parameter, options, util);
  } else {
    addPcssTheme(parameter, options, util);
  }
};

app.addHybrid = function (parameters, options, util) {
  addHybrid(parameters, options, util);
};

app.addSass = function () {
  const toolingModule = utils.loadTooling();
  toolingModule.addsass()
    .then(() => {
      utils.log.success('add sass complete');
    })
    .catch((error) => {
      utils.log(error);
    });
};

app.addPcss = function () {
  const toolingModule = utils.loadTooling();
  toolingModule.addpcss()
    .then(() => {
      utils.log.success('add pcss complete');
    })
    .catch((error) => {
      utils.log(error);
    });
};

app.addTypescript = function () {
  const toolingModule = utils.loadTooling();
  return toolingModule.addtypescript()
  .then(() => {
    utils.log.success('add typescript complete');
  })
  .catch((error) => {
    utils.log(error);
  });
};

/**
 * ## restore
 *
 * @public
 */
app.restore = function (options) {
  // The first level function stores user input for the session
  process.env.options = JSON.stringify(options);

  // if the project contains cordova's config.xml, consider it to be a hybrid; otherwise web
  const cordovaDir = paths.getConfiguredPaths(process.cwd()).stagingHybrid;
  const isHybrid = fs.existsSync(path.resolve(cordovaDir, CONSTANTS.CORDOVA_CONFIG_XML));
  const appType = CONSTANTS.APP_TYPE;
  const restoreType = isHybrid ? appType.HYBRID : appType.WEB;

  if (restoreType === 'web') {
    _restoreWeb();
  } else {
    _restoreHybrid();
  }
};

/**
 * ## _restoreWeb
 *
 * @private
 */
function _restoreWeb() {
  _npmInstall()
    .then(_writeOracleJetConfigFile)
    .then(_addComponents)
    .then(_runAfterAppRestoreHook)
    .then(() => {
      utils.log.success('Restore complete');
    })
    .catch((error) => {
      utils.log(error);
    });
}

/**
 * ## _npmInstall
 *
 * @private
 */
function _npmInstall() {
  utils.log('Performing \'npm install\' may take a bit.');
  return utils.spawn('npm', ['install']);
}

/**
 * ## _addComponents
 *
 * @private
 */
function _addComponents() {
  const configJson = utils.readJsonAndReturnObject(configPath);
  const componentList = configJson.components;
  if (utils.isObjectEmpty(componentList)) {
    return utils.log('No components to add.');
  }
  utils.log('Adding components.');
  const toolingModule = utils.loadTooling();
  // Adding empty array of component names makes resolver restore
  // the state present in configuration file (oraclejetconfig.json)
  return toolingModule.add(config.tasks.add.scopes.component.name, [], Object.assign(
    JSON.parse(process.env.options), {
      _suppressMsgColor: true
    }
  ));
}

/**
 * ## _writeOracleJetConfigFile
 *
 * @private
 */
function _writeOracleJetConfigFile() {
  return new Promise((resolve) => {
    utils.log(`Checking '${CONSTANTS.APP_CONFIG_JSON}'config file.`);

    fs.stat(configPath, (err) => {
      const generatorVersion = pckg.version;
      if (err) {
        utils.log('No config file. Adding the default.');
        fs.writeFileSync(configPath, JSON.stringify(generatorVersion, null, 2));
      } else {
        utils.log(`'${CONSTANTS.APP_CONFIG_JSON}' file exists. Adding/updating version.`);
        const configJson = utils.readJsonAndReturnObject(configPath);
        configJson.generatorVersion = generatorVersion;
        fs.writeFileSync(configPath, JSON.stringify(configJson, null, 2));
      }
      resolve();
    });
  });
}

/**
 * ## _restoreHybrid
 *
 * @private
 */
function _restoreHybrid() {
  _npmInstall()
    .then(_writeOracleJetConfigFile)
    .then(_addComponents)
    .then(_invokeCordovaPrepare)
    .then(_runAfterAppRestoreHook)
    .then(() => {
      utils.log.success('Restore complete');
    })
    .catch((error) => {
      utils.log(error);
    });
}

/**
 * ## _invokeCordovaPrepare
 *
 * @private
 */
function _invokeCordovaPrepare() {
  const hybrid = paths.getConfiguredPaths(cwd).stagingHybrid;
  utils.ensureDir(path.join(hybrid, 'www'));

  const cmdOpts = { cwd: hybrid, stdio: [0, 'pipe', 'pipe'], maxBuffer: 1024 * 20000 };
  // Not using default utils.exec as we need to handle error specially (hid logs about index.html)
  return new Promise((resolve, reject) => {
    utils.exec('cordova prepare', cmdOpts, (error) => {
      // When www/index.html files are missing, cordova reports error
      if (error && !/index\.html/.test(error)) {
        reject(error);
      }
      resolve();
    });
  });
}

/**
 * ## _runAfterAppRestoreHook
 *
 * @private
 */
function _runAfterAppRestoreHook() {
  return new Promise((resolve, reject) => {
    // Get hooks config
    const hooksConfig = _getHooksConfigObj();

    // Get after_app_prepare hook's path
    const hookPath = hooksConfig.after_app_restore;
    if (hookPath && fs.existsSync(path.resolve(hookPath))) {
      const hook = require(path.resolve(hookPath)); // eslint-disable-line
      // Execute hook
      hook()
        .then(() => resolve())
        .catch(err => reject(err));
    } else {
      utils.log.warning('Hook \'after_app_restore\' not defined.');
      resolve();
    }
  });
}

/**
 * ## _getHooksConfigObj
 * Reads the hooks.json file
 *
 * @private
 */
function _getHooksConfigObj() {
  const configFilePath = path.resolve(CONSTANTS.PATH_TO_HOOKS_CONFIG);
  if (fs.existsSync(configFilePath)) {
    const hooksObj = utils.readJsonAndReturnObject(configFilePath);
    return hooksObj.hooks || {};
  }
  return {};
}

/**
 * ## runTooling
 *
 * @public
 * @param {string} task
 * @param {string} parameter
 * @param {Object} [options]
 */
app.runTooling = function (task, scope, parameter, options) {
  // Refuse platform flag
  if (utils.hasProperty(options, 'platform')) {
    utils.log.error('Flag \'--platform\' is not supported. Use platform name as parameter e.g. \'ojet serve ios.\'');
  }

  if (utils.isCwdJetApp()) {
    tooling(task, scope, parameter, options);
  } else {
    utils.log.error(utils.toNotJetAppMessage());
  }
};

/**
 * ## addWeb
 *
 * @public
 */
app.addWeb = function () {
  utils.log('Adding a web app target.');

  const pathsConfig = paths.getConfiguredPaths('./');
  const srcWeb = `./${pathsConfig.sourceWeb}`;
  const srcHybrid = `./${pathsConfig.sourceHybrid}`;

  // Do not allow executing 'add hybrid' again as
  // existing 'src-web' and 'src-hybrid' get overwritten
  if (fs.existsSync(srcWeb) || fs.existsSync(srcHybrid)) {
    utils.log.error('Web target already added.');
  }

  // Add 'src-web' and 'src-hybrid'
  utils.ensureDir(srcWeb);
  utils.ensureDir(srcHybrid);

  // Add cordovaMocks.js to 'src-hybrid'
  const fileName = 'cordovaMocks.js';
  const source = path.join(__dirname, '../../', 'generators/hybrid/templates/common/src/js', fileName);
  const destination = path.join(srcHybrid, fileName);
  utils.fsCopySync(source, destination);
  utils.log.success('Add web finished.');
};
