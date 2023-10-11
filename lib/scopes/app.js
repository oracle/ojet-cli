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
const fs = require('fs-extra');
const path = require('path');

// Oracle
const config = require('../../config');
const constants = require('../util/constants');
const paths = require('../util/paths');
const tooling = require('../tooling');
const utils = require('../util/utils');
const addTheme = require('../../generators/add-theme');
const addPcssTheme = require('../../generators/add-pcss-theme');
const addComponent = require('../../generators/add-component');
const addApp = require('../../generators/app');

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
app.create = function (parameter, options) {
  const opts = options;
  // Deleting 'web' flag
  if (opts && utils.hasProperty(opts, 'web')) {
    delete opts.web;
  }
  return addApp(parameter, opts);
};

app.createComponent = function (parameter, options) {
  return addComponent(parameter, options);
};

app.createTheme = function (parameter, options) {
  if (!utils.validCustomProperties()) {
    utils.log.warning('The created theme defaults to alta as base-theme, which is deprecated.');
    return addTheme(parameter, options);
  }
  return addPcssTheme(parameter, options);
};

app.addSass = function (options) {
  const toolingModule = utils.loadTooling();
  return toolingModule.addsass(options)
    .then(() => {
      utils.log.success('add sass complete');
    })
    .catch((error) => {
      utils.log(error);
      return Promise.reject();
    });
};

app.addPcss = function (options) {
  const toolingModule = utils.loadTooling();
  return toolingModule.addpcss(options)
    .then(() => {
      utils.log.success('add pcss complete');
    })
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
};

app.addTypescript = function (options) {
  const toolingModule = utils.loadTooling();
  return toolingModule.addtypescript(options)
    .then(() => {
      utils.log.success('add typescript complete');
    })
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
};

app.addJsdoc = function (options) {
  const toolingModule = utils.loadTooling();
  const pathToApp = utils.loadToolingUtil().destPath();
  const pathToOracleJet = utils.loadToolingUtil().getOraclejetPath();
  return toolingModule.addjsdoc(options)
    .then(() => {
      utils.log.success('add jsdoc complete');
    })
    .then(() => {
      utils.log('Adding API Docs html templates into src folder...');
      _injectCustomApiDocHtmlTemplatesIntoSrc({ pathToApp, pathToOracleJet });
      utils.log.success('API Docs html templates added successfully.');
    })
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
};

app.addTesting = function (options) {
  const toolingModule = utils.loadTooling();
  const testType = utils.loadToolingUtil().isVDOMApplication({ options }) ? 'jest' : 'karma';
  const pathToApp = utils.loadToolingUtil().destPath();
  const pathToTemplateFolder = path.join(__dirname, '../../template');
  return toolingModule.addtesting(options)
    .then(() => {
      utils.log.success('add testing complete');
    })
    .then(() => {
      _injectTestFolderAtTheAppRoot({ pathToTemplateFolder, pathToApp, testType });
    })
    .then(() => {
      _injectTestFolderInExistingComponents({ pathToTemplateFolder, pathToApp, testType });
    })
    .then(() => {
      _injectTestScriptsInPackageJson({ pathToApp, testType });
    })
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
};

app.addpwa = function () {
  const toolingModule = utils.loadTooling();
  return toolingModule.addpwa()
    .then(() => {
      utils.log.success('add pwa complete');
    })
    .catch((error) => {
      utils.log(error);
      return Promise.reject();
    });
};

app.addwebpack = function (options) {
  const toolingModule = utils.loadTooling();
  return toolingModule.addwebpack(options)
    .then(() => {
      utils.log.success('add webpack complete');
    })
    .catch((error) => {
      utils.log(error);
      return Promise.reject();
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
  return _restoreWeb(options);
};

app.addComponents = function () {
  const configPath = path.join(process.cwd(), constants.APP_CONFIG_JSON);
  const configJson = utils.readJsonAndReturnObject(configPath);
  const componentList = configJson.components;
  if (!utils.isObjectEmpty(componentList)) {
    utils.log('Adding components from the exchange');
    const toolingModule = utils.loadTooling();
    const options = process.env.options ? JSON.parse(process.env.options) : {};
    // Adding empty array of component names makes resolver restore
    // the state present in configuration file (oraclejetconfig.json)
    return toolingModule.add(
      config.tasks.add.scopes.component.name,
      [],
      { ...options, _suppressMsgColor: true }
    );
  }
  return Promise.resolve();
};

/**
 * ## _restoreWeb
 *
 * @private
 * @param {Object} [options]
 */
function _restoreWeb(options) {
  return _npmInstall(options)
    .then(_writeOracleJetConfigFile)
    .then(app.addComponents)
    .then(_runAfterAppRestoreHook)
    .then(() => {
      utils.log.success('Restore complete');
    })
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
}

/**
 * ## _npmInstall
 *
 * @private
 * @param {Object} [options]
 */
function _npmInstall(options) {
  const restoreExchangeOnly = options['exchange-only'];
  const installer = utils.getInstallerCommand(options);

  if (restoreExchangeOnly && installer.verbs.install === 'install') {
    utils.log(`Skipping '${installer.installer} ${installer.verbs.install}'.`);
    return Promise.resolve();
  }

  utils.log(`Performing '${installer.installer} ${installer.verbs.install}' may take a bit.`);
  return utils.spawn(installer.installer, [installer.verbs.install]);
}

/**
 * ## _writeOracleJetConfigFile
 *
 * @private
 */
function _writeOracleJetConfigFile() {
  utils.log(`Checking '${constants.APP_CONFIG_JSON}'config file.`);
  const configPath = path.join(process.cwd(), constants.APP_CONFIG_JSON);
  let configJson;
  if (!fs.existsSync(configPath)) {
    utils.log('No config file. Adding the default.');
    configJson = utils.readJsonAndReturnObject(path.join(
      __dirname,
      '../../template/common',
      constants.APP_CONFIG_JSON
    ));
  } else {
    utils.log(`'${constants.APP_CONFIG_JSON}' file exists.`);
    configJson = utils.readJsonAndReturnObject(configPath);
  }
  fs.writeFileSync(configPath, JSON.stringify(configJson, null, 2));
  return Promise.resolve();
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
  const configFilePath = path.resolve(constants.PATH_TO_HOOKS_CONFIG);
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
    return Promise.reject();
  } else if (utils.isCwdJetApp()) {
    return tooling(task, scope, parameter, options);
  }
  utils.log.error(utils.toNotJetAppMessage());
  return Promise.reject();
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

  if (fs.existsSync(srcWeb)) {
    utils.log.error('Web target already added.');
    return Promise.reject();
  }

  // Add 'src-web'
  utils.ensureDir(srcWeb);

  utils.log.success('Add web finished.');
  return Promise.resolve();
};


function _injectCustomApiDocHtmlTemplatesIntoSrc({ pathToApp, pathToOracleJet }) {
  const pathToApiDocInSrc = path.join(pathToApp, 'src', 'apidoc_templates');
  const pathToApiDocInOraclejet = path.join(pathToOracleJet, 'dist', 'jsdoc', 'apidoc_templates');
  if (!fs.existsSync(pathToApiDocInSrc) && fs.existsSync(pathToApiDocInOraclejet)) {
    fs.copySync(pathToApiDocInOraclejet, pathToApiDocInSrc, { dereference: true });
  }
}

function _injectTestFolderAtTheAppRoot({ pathToTemplateFolder, pathToApp, testType }) {
  const pathToTestTemplate = path.join(pathToTemplateFolder, `test-config-${testType}`);
  if (!fs.existsSync(path.join(pathToApp, 'test-config'))) {
    if (fs.existsSync(pathToTestTemplate)) {
      fs.copySync(pathToTestTemplate, path.join(pathToApp, 'test-config'));
    }
  }
}

function _injectTestFolderInExistingComponents({ testType, pathToApp, pathToTemplateFolder }) {
  const toolingUtil = utils.loadToolingUtil();
  const configPaths = toolingUtil.getConfiguredPaths();
  const testTemplatePath = path.join(pathToTemplateFolder, 'component', `test-${testType}`);
  const componentsPath = path.join(
    pathToApp,
    configPaths.src.common,
    utils.isTypescriptApplication() ? configPaths.src.typescript : configPaths.src.javascript,
    configPaths.components
  );
  if (fs.existsSync(componentsPath)) {
    const ccaComponents = toolingUtil.readDirSync(componentsPath);
    const vComponents = toolingUtil.getVComponentsInFolder({ folder: componentsPath });
    ccaComponents.forEach((component) => {
      const componentJsonPath = path.join(componentsPath, component, 'component.json');
      if (!vComponents.includes(component) && fs.existsSync(componentJsonPath)) {
        const componentType = fs.readJsonSync(componentJsonPath).type;
        if (componentType && (componentType === 'pack' || componentType === 'mono-pack')) {
          const packComponents = toolingUtil.readDirSync(path.join(componentsPath, component));
          packComponents.forEach((packComponent) => {
            if (toolingUtil.isWebComponent({ pack: component, component: packComponent })) {
              _injectTestFolderInTheComponent({
                testTemplatePath,
                componentsPath,
                component: packComponent,
                pack: component
              });
            }
          });
        } else {
          _injectTestFolderInTheComponent({ testTemplatePath, componentsPath, component });
        }
      } else if (vComponents.includes(component)) {
        _injectTestFolderInTheComponent({ testTemplatePath, componentsPath, component });
      }
    });
  }
}

function _injectTestFolderInTheComponent({ testTemplatePath, componentsPath, component, pack = '' }) {
  const pathToSpecsFolder = path.join(componentsPath, pack, component, '__tests__');
  fs.copySync(testTemplatePath, pathToSpecsFolder);
  _renameTestTemplatePrefixFile({ pathToSpecsFolder, componentsPath, pack, component });
}

function _renameTestTemplatePrefixFile({ pathToSpecsFolder, componentsPath, pack, component }) {
  const testFiles = utils.loadToolingUtil().readDirSync(pathToSpecsFolder);
  testFiles.forEach((file) => {
    if (/@component@/.test(file)) {
      const pathToTestFile = path.join(componentsPath, pack, component, '__tests__', file);
      const renamedPathToTestFile = pathToTestFile.replace('@component@', component);
      fs.renameSync(pathToTestFile, renamedPathToTestFile);
      const fileContent = fs.readFileSync(renamedPathToTestFile, { encoding: 'utf-8' });
      fs.writeFileSync(renamedPathToTestFile, fileContent.replaceAll('@component-name@', component));
    }
  });
}

function _injectTestScriptsInPackageJson({ pathToApp, testType }) {
  const pathToPackageJson = path.join(pathToApp, 'package.json');
  const packageObj = utils.readJsonAndReturnObject(pathToPackageJson);
  const scripts = (packageObj && packageObj.scripts) || {};
  const jestCommand = 'jest -c test-config/jest.config.js';
  const karmaCommand = 'npx karma start test-config/karma.conf.js';
  const debugCommand = 'node --inspect-brk node_modules/.bin/jest --runInBand';

  // It might happen that in the scripts property of the package json
  // file, there is an already existing sub-property 'test' (or test:debug
  // for the case when the test type is jest). Whenever that is the case,
  // then we should use keys 'test-jest-ojet' and 'test-debug-ojet' for
  // test type jest and 'test-karma-ojet' for karma.

  if (testType === 'jest') {
    if (!scripts.test) {
      scripts.test = jestCommand;
    } else if (scripts.test !== jestCommand) {
      scripts['test-jest-ojet'] = jestCommand;
    }

    if (!scripts['test:debug']) {
      scripts['test:debug'] = debugCommand;
    } else if (scripts['test:debug'] !== debugCommand) {
      scripts['test-debug-ojet'] = debugCommand;
    }
  } else if (testType === 'karma') {
    if (!scripts.test) {
      scripts.test = karmaCommand;
    } else if (scripts.test !== karmaCommand) {
      scripts['test-karma-ojet'] = karmaCommand;
    }
  }
  packageObj.scripts = scripts;

  fs.writeJSONSync(pathToPackageJson, packageObj, { encoding: 'utf-8', spaces: 2 });
}
