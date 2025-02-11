/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
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
    .then(() => _injectCustomApiDocHtmlTemplatesIntoSrc({ pathToApp, pathToOracleJet }))
    .then(() => _addEnableDocGenFlagIntoOraclejetConfigFile(pathToApp))
    .then(() => utils.log.success('API docgen setup finished. JSDoc package installed, templates added to src folder, and enableDocGen flag enabled in oraclejetconfig.json file. To disable API doc generation, update enableDocGen to false in oraclejetconfig.json.'))
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
};

app.addTesting = function (options) {
  const toolingModule = utils.loadTooling();
  const testType = utils.loadToolingUtil().isVDOMApplication({
    options
  }) ? 'jest' : 'karma';
  const pathToApp = utils.loadToolingUtil().destPath();
  const pathToTemplateFolder = path.join(__dirname, '../../template');
  return toolingModule.addtesting(options)
    .then(() => {
      utils.log.success('add testing complete');
    })
    .then(() => {
      _injectTestFolderAtTheAppRoot({
        pathToTemplateFolder,
        pathToApp,
        testType
      });
    })
    .then(() => {
      _injectTestFolderInExistingComponents({
        pathToTemplateFolder,
        pathToApp,
        testType
      });
    })
    .then(() => {
      _injectTestScriptsInPackageJson({
        pathToApp,
        testType
      });
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
      // This link tag ensures that the style links
      // are properly injected into the index html file
      // during build time.
      _ensureStylesheetLinkTag();
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
      [], {
        ...options,
        _suppressMsgColor: true
      }
    );
  }
  return Promise.resolve();
};

app.migrate = function (options) {
  return new Promise((resolve, reject) => {
    const pathToApp = utils.loadToolingUtil().destPath();
    const configPaths = utils.loadToolingUtil().getConfiguredPaths();
    const isVDOMApplication = utils.loadToolingUtil().isVDOMApplication();
    const pathToIndexHtmlFile = path.join(pathToApp, `${configPaths.src.common}`, 'index.html');

    _validateJetVersion(options)
      .then(() => _validateExchangeComponents(options))
      .then(() => _validateAndUpdateOraclejetConfig(pathToApp, options))
      .then(() => _validateAndUpdatePathMappings(pathToApp, isVDOMApplication, configPaths))
      .then(() => _validateAndUpdateHooks(pathToApp))
      .then(() => _validateMainJsFile(pathToApp, isVDOMApplication, configPaths))
      .then(() => _validateIndexHtmlFile(pathToIndexHtmlFile))
      .then(() => _installUpdatedTypescriptVersion(options))
      .then(() => _runOjetRestore(options))
      .then(() => {
        utils.log.success('Migration process finished successfully!');
        resolve(options);
      })
      .catch((error) => {
        utils.log.error(error);
        reject();
      });
  });
};

function _installUpdatedTypescriptVersion(options) {
  utils.log('Installing updated Typescript version...');
  return new Promise((resolve, reject) => {
    try {
      if (utils.isTypescriptApplication()) {
        utils.log('Installing the updated typescript version...');
        app.addTypescript(options)
          .then(() => {
            resolve(options);
          })
          .catch((error) => {
            utils.log.error(error);
            reject();
          });
      } else {
        resolve(options);
      }
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _runOjetRestore(options) {
  utils.log('Running ojet restore to pick-up updated changes...');
  return new Promise((resolve, reject) => {
    try {
      app.restore(options)
        .then(() => {
          resolve(options);
        })
        .catch((error) => {
          utils.log.error(error);
          reject();
        });
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _validateJetVersion(options) {
  utils.log('Validating JET version...');
  return new Promise((resolve, reject) => {
    try {
      const versionRegex = /(\d+)\.(\d+)\.(\d+)/;
      const currentJetVersion = utils.getPackageVersion('@oracle/oraclejet');
      const match = (currentJetVersion || '').match(versionRegex);

      if (match) {
        const majorVersion = parseInt(match[1], 10);
        if (majorVersion < 13) {
          utils.log.error('The command ojet migrate only works for apps using JET version 13.0.0 or later.');
          reject();
        }
      }

      resolve(options);
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _validateExchangeComponents(options) {
  utils.log('Validating and updating exchange components versions...');
  return new Promise((resolve, reject) => {
    // We are referring to @oracle/oraclejet version because the assumption is
    // that before running the migration command, oraclejet will already be updated
    // to the version we are migrating to.
    const migrationTargetVersion = utils.getPackageVersion('@oracle/oraclejet');
    const pathToApp = utils.loadToolingUtil().destPath();
    const pathToOracleJetConfig = path.join(pathToApp, constants.APP_CONFIG_JSON);
    const oraclejetConfig = utils.readJsonAndReturnObject(pathToOracleJetConfig);

    // Now we can traverse the list to check if the components from exchange that are
    // in the app are compatible with the version we are migrating to.
    if (oraclejetConfig && oraclejetConfig.components) {
      const componentsList = Object.getOwnPropertyNames(oraclejetConfig.components);
      const requestObj = {
        versionResolutionMode: 'stable_preferred',
        config: {},
        environment: {},
        changes: {
          add: {}
        },
        jetVersion: `^${migrationTargetVersion}`
      };

      componentsList.forEach((component) => {
        const componentComponentsList = Object.getOwnPropertyNames(
          oraclejetConfig.components[component].components || {});
        componentComponentsList.forEach((_component) => {
          requestObj.changes.add[`${component}-${_component}`] = '*';
        });
      });
      const projectExchangeUrl = utils.getExchangeUrl();

      if (!projectExchangeUrl) {
        utils.log.error('Exchange url is not configured. Please see \'ojet help configure\' for instructions.');
      }

      utils.loadToolingUtil().request({
        useUrl: `${projectExchangeUrl}/dependencyResolver`,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      }, JSON.stringify(requestObj))
        .then((response) => {
          const { solutions } = JSON.parse(response.responseBody || {});
          if (solutions && solutions.length > 0) {
            const { configChanges } = solutions[0] || {};

            const addedComponents = Object.getOwnPropertyNames(
              (configChanges && configChanges.add) ? configChanges.add : {}
            ) || [];

            // Update the components versions in the oraclejet config which are compatible
            // with the migrating JET version.
            addedComponents.forEach((addedComponent) => {
              const componentsInJetConfig = oraclejetConfig.components[addedComponent].components;
              const componentsFromResponse = configChanges.add[addedComponent].components;
              const components = Object.getOwnPropertyNames(componentsInJetConfig || {});

              // eslint-disable-next-line max-len
              oraclejetConfig.components[addedComponent].components = configChanges.add[addedComponent].components;

              // After updating the component version, then let the user know about what changed:
              components.forEach((component) => {
                utils.log(`Updated ${component} version from ${componentsInJetConfig[component]} to ${componentsFromResponse[component]} under ${addedComponent}.`);
              });
            });
            utils.log.success('Components versions in your oraclejetconfig.json are updated.');
            fs.writeJSONSync(pathToOracleJetConfig, oraclejetConfig, { encoding: 'utf-8', spaces: 2 });
          } else {
            utils.log.error('You have exchange components that are not compatible with the version you are migrating to.');
            reject();
          }
        })
        .then(() => {
          resolve(options);
        })
        .catch((error) => {
          utils.log.error(error);
          reject();
        });
    } else {
      utils.log('Skipping validating exchange components: no components were added to the project.');
      resolve(options);
    }
  });
}

function _validateIndexHtmlFile(pathToIndexHtmlFile) {
  utils.log('Validating index.html file...');
  return new Promise((resolve, reject) => {
    try {
      const indexFileContent = fs.readFileSync(pathToIndexHtmlFile, {
        encoding: 'utf-8'
      });
      // Remove any scripts in between the theme injector tags:
      const themeInjectorRegex = /<!--\s*injector:theme\s*-->/;

      if (!themeInjectorRegex.test(indexFileContent)) {
        utils.log.error('To enable theme injection, include the injector:theme flag in your index.html file.\nRefer to our migration guide for step-by-step instructions.');
        reject();
      }

      const themeTagsRegex = /<!--\s*injector:theme\s*-->([\s\S]*?)<!--\s*endinjector\s*-->/m;
      const capturedGroup = indexFileContent && indexFileContent.match(themeTagsRegex)[1];
      // An assumption here is that the anything in-between wil start with an opening tag:
      if (capturedGroup && capturedGroup.includes('<')) {
        utils.log.error('Note: Leave the space between <!-- injector:theme --> and <!-- endinjector --> empty in your index.html file.\nStyle tags will be automatically inserted during the build process');
        reject();
      }

      // Scripts for the main.js file. It could be the case that only
      // self-closing script tags are used:
      const scriptsArray = [
        /<script\s+type=["']?\s*text\/javascript\s*["']?\s*src=["']?\s*js\/libs\/require\/require\.js\s*["']?\s*\/?>[\s\S]*?<\/script>/,
        /<script\s+type=["']?\s*text\/javascript\s*["']?\s*src=["']?\s*js\/main\.js\s*["']?\s*\/?>[\s\S]*?<\/script>/,
        /<script\s*src=["']?\s*js\/libs\/require\/require\.js\s*["']?\s*\/?>[\s\S]*?<\/script>/,
        /<script\s*src=["']?\s*js\/main\.js\s*["']?\s*\/?>[\s\S]*?<\/script>/
      ];

      const scriptInjectorRegex = /<!--\s*injector:scripts\s*-->/;
      if (!scriptInjectorRegex.test(indexFileContent)) {
        utils.log.error('To enable js scripts to be injected, include the injector:scripts flag in your index.html file.\nRefer to our migration guide for step-by-step instructions.');
        reject();
      }

      const hasScriptTags = scriptsArray.some(regex => regex.test(indexFileContent));
      if (hasScriptTags) {
        utils.log.error('With the <!-- injector:scripts --> flag in place, you can safely remove any existing main.js and require.js scripts from your index.html file.\nThey will be automatically included during build time. Refer to our migration guide for step-by-step instructions.');
        reject();
      }

      utils.log.success('Validating index.html file finished.');
      resolve();
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _validateMainJsFile(pathToApp, isVDOMApplication, configPaths) {
  utils.log('Validating main.js file...');
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppMain = path.join(
        pathToApp,
        isVDOMApplication ?
          configPaths.src.common :
          path.join(configPaths.src.common, configPaths.src.javascript),
        'main.js'
      );

      const fileContent = fs.readFileSync(pathToMigratingAppMain, {
        encoding: 'utf-8'
      });

      const mainReleaseInjectorRegex = /\/\/\s*injector:\s*mainReleasePaths/;

      if (!mainReleaseInjectorRegex.test(fileContent)) {
        utils.log.error('Missing "injector:mainReleasePaths" flag in main.js. Add it to ensure correct path updates during the release build process.');
      }

      utils.log.success('Validating main.js file finished successfully.');
      resolve();
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _validateAndUpdateHooks(pathToApp) {
  utils.log('Validating and updating hooks...');
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppHooks = path.join(pathToApp, 'scripts', 'hooks');

      if (utils.fsExistsSync(pathToMigratingAppHooks)) {
        const pathToTemplateFolder = path.join(__dirname, '../../template');
        const pathToHooks = path.join(pathToTemplateFolder, 'common', 'scripts', 'hooks');
        const pathToHooksJson = path.join(pathToMigratingAppHooks, 'hooks.json');
        const migratingAppHooksJson = utils.readJsonAndReturnObject(pathToHooksJson);

        const migratingAppHookFiles = fs.readdirSync(pathToMigratingAppHooks);
        const hookFiles = fs.readdirSync(pathToHooks);

        hookFiles.forEach((file) => {
          if (!migratingAppHookFiles.includes(file)) {
            fs.copySync(
              path.join(pathToHooks, file),
              path.join(pathToMigratingAppHooks, file)
            );

            // Read the hooks.json file and then update it accordingly:
            migratingAppHooksJson.hooks[file.replace('.js', '')] = path.posix.join('scripts', 'hooks', file);
          }
        });

        // Check if the config folder under the scripts folder exists:
        if (fs.existsSync(pathToMigratingAppHooks.replace('hooks', 'config'))) {
          utils.log.warning('Found an existing scripts/config folder, which is no longer needed and might cause errors in some cases. Please consider removing it to avoid potential issues.');
        }

        fs.writeJSONSync(
          pathToHooksJson,
          migratingAppHooksJson, {
            encoding: 'utf-8',
            spaces: 2
          }
        );
      } else {
        utils.log.warning('Your app is missing the the hooks folder. Some functionalities might not be working correctly.');
      }

      utils.log.success('Project hooks are validated and updated successfully.');
      resolve();
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _validateAndUpdatePathMappings(pathToApp, isVDOMApplication, configPaths) {
  utils.log('Validating and updating path mappings...');
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppPathMappingJson = path.join(
        pathToApp,
        isVDOMApplication ?
          '' :
          path.join(configPaths.src.common, configPaths.src.javascript),
        constants.PATH_MAPPING_JSON
      );
      // For 'web', 'src', 'js' in this path, we won't use config values
      // as these come from the oraclejetconfig paths, which might be
      // customized by the user.
      let pathToBasicTemplPathMappingJson = path.join(
        pathToApp,
        constants.TEMPLATES_PATH,
        'basic', // we will be using the basic template.
        'web',
        'src',
        'js',
        constants.PATH_MAPPING_JSON
      );
      // This is for the case when the templates are under ojet-cli package:
      const templatesUnderOjetCliNodeModulesPath = pathToBasicTemplPathMappingJson.replace(
        'node_modules',
        path.join('node_modules', '@oracle', 'ojet-cli', 'node_modules')
      );

      if (fs.existsSync(templatesUnderOjetCliNodeModulesPath)) {
        pathToBasicTemplPathMappingJson = templatesUnderOjetCliNodeModulesPath;
      }

      // Retrieve the path_mappings:
      const basicTemplPathMappingJson = utils.readJsonAndReturnObject(
        pathToBasicTemplPathMappingJson || {});
      const migratingAppPathMappingJson = utils.readJsonAndReturnObject(
        pathToMigratingAppPathMappingJson || {});

      // Update the migrating apps path_mappings--we should override
      // its libs property by ensuring that the migrating app's
      // path_mapping.json contains the updated mappings from  the
      // basic template's path_mapping.json.
      migratingAppPathMappingJson.libs = {
        ...migratingAppPathMappingJson.libs,
        ...basicTemplPathMappingJson.libs
      };

      // Update the migrating app's cdns:
      migratingAppPathMappingJson.cdns = basicTemplPathMappingJson.cdns;

      fs.writeJSONSync(
        pathToMigratingAppPathMappingJson,
        migratingAppPathMappingJson, {
          encoding: 'utf-8',
          spaces: 2
        }
      );

      utils.log.success('Path mappings are updated successfully.');
      resolve();
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

function _validateAndUpdateOraclejetConfig(pathToApp, options) {
  utils.log('Validating and updating  oraclejetconfig.json file...');
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppOraclejetConfigJson = path.join(pathToApp, constants.APP_CONFIG_JSON);
      const pathToTemplateFolder = path.join(__dirname, '../../template');
      const pathToOraclejetConfigJsonTemplate = path.join(pathToTemplateFolder, 'common', constants.APP_CONFIG_JSON);

      const templateJson = utils.readJsonAndReturnObject(pathToOraclejetConfigJsonTemplate);
      let migratingAppJson = utils.readJsonAndReturnObject(pathToMigratingAppOraclejetConfigJson);
      const { paths: templatePaths, ...otherTemplateJsonProperties } = templateJson;
      const { paths: migratingAppPaths, ...otherMigratingAppJsonProperties } = migratingAppJson;

      // For paths, the migrating app's oraclejetconfig.json should take precedence because,
      // it could be the case that the user has customized the paths sub-properties to fit
      // user's preferred project structure:
      migratingAppJson = {
        ...migratingAppJson,
        paths: _mergeObjects(templatePaths, migratingAppPaths),
        ..._mergeObjects(otherMigratingAppJsonProperties, otherTemplateJsonProperties)
      };

      // Update the oraclejet config according to the desired
      if (options && options.sassVer) {
        const versionRegex = /(\d+)\.(\d+)\.(\d+)/;
        if (versionRegex.test(options.sassVer)) {
          migratingAppJson.sassVer = options.sassVer;
        } else {
          utils.log.error('Incorrect sass version format: Sass version must be in the format x.y.z');
          reject();
        }
      }

      if (options && options.theme) {
        migratingAppJson.defaultTheme = options.theme;
      }

      fs.writeJSONSync(
        pathToMigratingAppOraclejetConfigJson,
        migratingAppJson, {
          encoding: 'utf-8',
          spaces: 2
        }
      );

      utils.log.success('oraclejetconfig.json file is updated successfully.');
      resolve(options);
    } catch (error) {
      utils.log.error(error);
      reject();
    }
  });
}

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
  // Add this as a flag to ensure we retrieve a correct installer for the task
  // and then remove it.
  // eslint-disable-next-line no-param-reassign
  options.task = 'restore';
  const installer = utils.getInstallerCommand(options);
  // eslint-disable-next-line no-param-reassign
  delete options.task;

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
  const configPaths = utils.loadToolingUtil().getConfiguredPaths();
  const pathToApiDocInSrc = path.join(
    pathToApp,
    configPaths.src.common,
    constants.CUSTOM_JSDOC.API_TEMPLATES
  );
  const pathToApiDocInOraclejet = path.join(
    pathToOracleJet,
    constants.CUSTOM_JSDOC.DIST,
    constants.CUSTOM_JSDOC.FOLDER,
    constants.CUSTOM_JSDOC.API_TEMPLATES
  );

  if (!fs.existsSync(pathToApiDocInSrc) && fs.existsSync(pathToApiDocInOraclejet)) {
    fs.copySync(pathToApiDocInOraclejet, pathToApiDocInSrc, { dereference: true });
  } else if (fs.existsSync(pathToApiDocInSrc)) {
    utils.log('API Doc templates already exist. Skipping addition to avoid overwriting existing files.');
  }
}

function _injectTestFolderAtTheAppRoot({
  pathToTemplateFolder,
  pathToApp,
  testType
}) {
  const pathToTestTemplate = path.join(pathToTemplateFolder, `test-config-${testType}`);
  if (!fs.existsSync(path.join(pathToApp, 'test-config'))) {
    if (fs.existsSync(pathToTestTemplate)) {
      fs.copySync(pathToTestTemplate, path.join(pathToApp, 'test-config'));
    }
  }
}

function _injectTestFolderInExistingComponents({
  testType,
  pathToApp,
  pathToTemplateFolder
}) {
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

function _injectTestFolderInTheComponent({
  testTemplatePath,
  componentsPath,
  component,
  pack = ''
}) {
  const pathToSpecsFolder = path.join(componentsPath, pack, component, '__tests__');
  fs.copySync(testTemplatePath, pathToSpecsFolder);
  _renameTestTemplatePrefixFile({
    pathToSpecsFolder,
    componentsPath,
    pack,
    component
  });
}

function _renameTestTemplatePrefixFile({ pathToSpecsFolder, componentsPath, pack, component }) {
  const testFiles = utils.loadToolingUtil().readDirSync(pathToSpecsFolder);
  testFiles.forEach((file) => {
    if (/@component@/.test(file)) {
      const pathToTestFile = path.join(componentsPath, pack, component, '__tests__', file);
      const renamedPathToTestFile = pathToTestFile.replace('@component@', component);
      fs.renameSync(pathToTestFile, renamedPathToTestFile);
      const fileContent = fs.readFileSync(renamedPathToTestFile, { encoding: 'utf-8' });
      fs.writeFileSync(
        renamedPathToTestFile,
        fileContent.replaceAll('@component-name@', component)
          .replaceAll('@camelcasecomponent-name@', _toCamelCase(component))
      );
    }
  });
}

function _toCamelCase(str) {
  const camelCase = str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  return `${camelCase[0].toUpperCase()}${camelCase.substring(1)}`;
}

function _injectTestScriptsInPackageJson({
  pathToApp,
  testType
}) {
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

  fs.writeJSONSync(pathToPackageJson, packageObj, {
    encoding: 'utf-8',
    spaces: 2
  });
}

function _addEnableDocGenFlagIntoOraclejetConfigFile(pathToApp) {
  const oraclejetConfigFilePath = path.join(pathToApp, constants.APP_CONFIG_JSON);
  const oraclejetConfig = utils.readJsonAndReturnObject(oraclejetConfigFilePath);

  oraclejetConfig.enableDocGen = true;

  fs.writeJSONSync(oraclejetConfigFilePath, oraclejetConfig, { spaces: 2, encoding: 'utf-8' });
}

function _mergeObjects(currentConfigObj, newConfigObj) {
  // Create a deep copy of currentConfigObj to avoid modifying the original object
  const mergedConfigObj = JSON.parse(JSON.stringify(currentConfigObj));

  // Iterate over the properties of newConfigObj
  Object.keys(newConfigObj).forEach((key) => {
    if (!(key in mergedConfigObj)) {
      utils.log(`Adding missing property ${key} in your oraclejetconfig.json file.`);
      mergedConfigObj[key] = newConfigObj[key];
    } else if (utils.isObject(newConfigObj[key]) && utils.isObject(mergedConfigObj[key])) {
      mergedConfigObj[key] = _mergeObjects(mergedConfigObj[key], newConfigObj[key]);
    } else if (mergedConfigObj[key] !== newConfigObj[key]) {
      utils.log(`Updating property ${key} in your oraclejetconfig.json file.`);
      mergedConfigObj[key] = newConfigObj[key];
    }
  });

  return mergedConfigObj;
}

function _ensureStylesheetLinkTag() {
  const pathToApp = utils.loadToolingUtil().destPath();
  const configPaths = utils.loadToolingUtil().getConfiguredPaths();
  const pathToIndexHtmlFile = path.join(pathToApp, `${configPaths.src.common}`, 'index.html');
  let indexHtmlContent = fs.readFileSync(pathToIndexHtmlFile, 'utf8');
  const linkTagFlag = '<!-- Link-tag flag that webpack replaces with theme style links during build time -->';

  // Check if the index.html file contains a stylesheet link tag which is
  // used as an injector to add the style link tags, if not, add it:
  const stylesheetRegex = /<link\s+rel\s*=\s*"stylesheet">/gi;
  if (!stylesheetRegex.test(indexHtmlContent)) {
    // Replace the injector comment with the stylesheet link tag
    // acting as a placeholder:
    indexHtmlContent = indexHtmlContent.replace(
      /<!--\s*injector:theme\s*-->/gmi,
      `${linkTagFlag}\n<link rel="stylesheet">`
    );

    // Remove any existing link tag that references app.css file. This will also
    // be part of the link tags added by replacing <link rel="stylesheet">
    // added above:
    indexHtmlContent = indexHtmlContent.replace(
      /<link\s*rel="stylesheet"\s*href="css\/app.css"\s*type="text\/css"\s*\/>/gm,
      ''
    );
    indexHtmlContent = indexHtmlContent.replace(
      /<link\s*rel="stylesheet"\s*href="styles\/app.css"\s*type="text\/css"\s*\/>/gm,
      ''
    );

    // Remove specific comments which are not needed by the webpack build:
    const commentsToRemove = [
      'This is injects main css file for the default theme',
      'endinjector',
      'This contains icon fonts used by the starter template',
      'injector:font',
      'endinjector:font',
      'This is where you would add any app specific styling',
      'This injects script tags for the main javascript files',
      'injector:scripts'
    ];
    const commentsRegex = new RegExp(`<!--\\s*(${commentsToRemove.join('|')})\\s*-->`, 'gi');
    indexHtmlContent = indexHtmlContent.replace(commentsRegex, '');
    // Remove multiple consecutive whitespace characters due to replacements done above:
    indexHtmlContent = indexHtmlContent.replace(/\n\s*\n\s*\n/g, '\n');
  }

  // Write the updated content back to the index.html file
  fs.writeFileSync(pathToIndexHtmlFile, indexHtmlContent);
}
