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
      // When the execute command is ojet migrate,
      // then do not log this message. We need to
      // tell the user what typescript version is
      // installed and from what version, both in
      // in the ojet.migrate.log file and the console.
      if (options.command !== 'migrate') {
        utils.log.success('add typescript complete');
      }
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

app.addTranslationIcu = function (options) {
  const toolingModule = utils.loadTooling();
  return toolingModule.addtranslationicu(options)
    .then(() => _addTranslationsBundlesToJetApp())
    .then(() => utils.log.success('Translation setup complete! Your application is now ready for translation. Refer to our documentation for guidance on configuring translation settings and generating translated bundles.'))
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

app.addwebpack = async function (options) {
  const toolingModule = utils.loadTooling();

  if (utils.hasLocalComponents()) {
    try {
      const continueOperation = await _promptUser();
      if (continueOperation) {
        utils.log('Continuing with adding webpack to your project...');
      } else {
        utils.log('Aborting the command "ojet add webpack"...');
        process.exit(0);
      }
    } catch (error) {
      utils.log(error);
      return Promise.reject();
    }
  }

  return toolingModule.addwebpack(options)
    .then(() => {
      // This link tag ensures that the style links
      // are properly injected into the index html file
      // during build time.
      _ensureStylesheetLinkTag();
      if (options['multi-locale']) {
        _addMultiLocaleSupport();
      }
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
      {
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
    const pathToLogFile = path.join(pathToApp, constants.OJET_MIGRATE_LOG_FILE);
    const configPaths = utils.loadToolingUtil().getConfiguredPaths();
    const isVDOMApplication = utils.loadToolingUtil().isVDOMApplication();
    const pathToIndexHtmlFile = path.join(pathToApp, `${configPaths.src.common}`, 'index.html');
    const currentJetVersion = utils.getPackageVersion('@oracle/oraclejet');
    const commonValidationSteps = [
      _validateJetVersion.bind(null, options),
      _validateExchangeComponents.bind(null, options),
      _validateAndUpdateOraclejetConfig.bind(null, pathToApp, options),
      _installUpdatedTypescriptVersion.bind(null, options),
      _runOjetRestore.bind(null, options),
    ];

    const webpackSpecificSteps = [
      _validateOjetConfigFile.bind(null, pathToApp),
      _validateAndUpdateHooksForWebpack.bind(null, pathToApp),
      _validateIndexHtmlFileForWebpack.bind(null, pathToIndexHtmlFile),
      _checkAndWarnAboutPathMappingFileForWebpack.bind(null, pathToApp,
        isVDOMApplication, configPaths)
    ];

    const nonWebpackSpecificSteps = [
      _validateAndUpdatePathMappings.bind(null, pathToApp, isVDOMApplication, configPaths),
      _validateAndUpdateHooks.bind(null, pathToApp),
      _validateMainJsFile.bind(null, pathToApp, isVDOMApplication, configPaths),
      _validateIndexHtmlFile.bind(null, pathToIndexHtmlFile)
    ];

    function finishMigration(promiseChain) {
      return promiseChain
        .then(() => {
          utils.writeToMigrationLogFile(
            'SUCCESS',
            'Migration process finished successfully!'
          );
          utils.log.success('Migration process finished successfully!');
          resolve(options);
        })
        .catch((error) => {
          utils.log.error(error);
          reject();
        });
    }

    if (fs.existsSync(pathToLogFile)) {
      fs.removeSync(pathToLogFile);
    }

    utils.writeToMigrationLogFile(
      'INFO',
      `Starting the migration process to JET version ${currentJetVersion}.`
    );

    utils.log(`Starting the migration process to JET version ${currentJetVersion}.`);

    if (utils.isWebpackProject()) {
      finishMigration(
        commonValidationSteps
          .concat(webpackSpecificSteps)
          .reduce(
            (promiseChain, currentStep) => promiseChain.then(currentStep), Promise.resolve()
          )
      );
    } else {
      finishMigration(
        commonValidationSteps
          .concat(nonWebpackSpecificSteps)
          .reduce(
            (promiseChain, currentStep) => promiseChain.then(currentStep), Promise.resolve()
          )
      );
    }
  });
};

function _installUpdatedTypescriptVersion(options) {
  return new Promise((resolve, reject) => {
    try {
      if (utils.isTypescriptApplication()) {
        utils.log('Updating typescript version and tsconfig.json file.');
        utils.writeToMigrationLogFile(
          'INFO',
          'Updating typescript version and tsconfig.json file.'
        );

        const pathToTsConfigFile = utils.loadToolingUtil().getPathToTsConfig('.');
        const typescriptVersionBeforeUpdates = utils.getPackageVersion('typescript');
        const tsconfigContentsBeforeUpdates = utils.readJsonAndReturnObject(pathToTsConfigFile);
        // Add an option to indicate what command we are executing: migrate.
        // This ensures that we only install the new typescript version
        // without changing/updating the existing tsconfig file in the
        // addTypescript implementation: We need to update the file here.

        // eslint-disable-next-line no-param-reassign
        options.command = 'migrate';
        app.addTypescript(options)
          .then(() => {
            // After the updates:
            const typescriptVersionAfterUpdates = utils.getPackageVersion('typescript');
            const tsconfigContentsAfterUpdates = utils.readJsonAndReturnObject(pathToTsConfigFile);
            if (typescriptVersionBeforeUpdates === typescriptVersionAfterUpdates) {
              utils.writeToMigrationLogFile(
                'INFO',
                'Skipped re-installing typescript.'
              );
              utils.log('Skipped re-installing typescript.');
            } else {
              utils.writeToMigrationLogFile(
                'INFO',
                `Typescript package is updated to version ${typescriptVersionAfterUpdates} from ${typescriptVersionBeforeUpdates}.`
              );
            }

            const result = _objectDiff(tsconfigContentsBeforeUpdates, tsconfigContentsAfterUpdates);
            _logDiffResultToFileAndConsole(result);

            utils.log('Updating typescript version and tsconfig.json file task finished.');
            utils.writeToMigrationLogFile(
              'INFO',
              'Updating typescript version and tsconfig.json file task finished.'
            );
            resolve(options);
          })
          .catch((error) => {
            utils.writeToMigrationLogFile(
              'ERROR',
              error
            );
            utils.log.error(error);
            reject();
          });
      } else {
        resolve(options);
      }
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
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
  utils.log('Validating JET version.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating JET version.'
  );
  return new Promise((resolve, reject) => {
    try {
      const versionRegex = /(\d+)\.(\d+)\.(\d+)/;
      const currentJetVersion = utils.getPackageVersion('@oracle/oraclejet');
      const match = (currentJetVersion || '').match(versionRegex);

      if (match) {
        const majorVersion = parseInt(match[1], 10);
        if (majorVersion < 13) {
          utils.writeToMigrationLogFile(
            'ERROR',
            'The command ojet migrate only works for apps using JET version 13.0.0 or later.'
          );
          utils.log.error('The command ojet migrate only works for apps using JET version 13.0.0 or later.');
          reject();
        }
      }
      utils.log('Validating JET version task finished.');
      utils.writeToMigrationLogFile(
        'INFO',
        'The JET version you are migrating to meets the condition of being 13.0.0 or later.'
      );
      utils.writeToMigrationLogFile(
        'INFO',
        'Validating JET version task finished.'
      );
      resolve(options);
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _validateExchangeComponents(options) {
  utils.log('Validating and updating exchange components versions.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating and updating exchange component versions.'
  );
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
      utils.writeToMigrationLogFile(
        'DEBUG',
        `Setting JET version to ^${migrationTargetVersion} in a call to exchange component API to test for JET version compatibility.`
      );
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
          utils.writeToMigrationLogFile(
            'DEBUG',
            `Adding ${component}-${_component} to component exchange payload for all its versions.`
          );
        });
      });
      const projectExchangeUrl = utils.getExchangeUrl();

      if (!projectExchangeUrl) {
        utils.writeToMigrationLogFile(
          'ERROR',
          'The command has been terminated because the exchange url is not configured. Run ojet help configure for more info.'
        );
        utils.log.error('Exchange url is not configured. Please see \'ojet help configure\' for instructions.');
      }

      utils.writeToMigrationLogFile(
        'DEBUG',
        `Sending a request to ${projectExchangeUrl}/dependencyResolver.`
      );
      utils.loadToolingUtil().request({
        useUrl: `${projectExchangeUrl}/dependencyResolver`,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      }, JSON.stringify(requestObj))
        .then((response) => {
          const { solutions, details } = JSON.parse(response.responseBody || {});
          if (solutions && solutions.length > 0) {
            const { configChanges } = solutions[0] || {};

            const addedComponents = Object.getOwnPropertyNames(
              (configChanges && configChanges.add) ? configChanges.add : {}
            ) || [];

            // Update the components versions in the oraclejet config which are compatible
            // with the migrating JET version.
            utils.writeToMigrationLogFile(
              'INFO',
              'Updating components\' versions under the component property in the oraclejetconfig.json file that are compatible with the migrating JET version.'
            );
            utils.log('Updating components\' versions under the component property in the oraclejetconfig.json file that are compatible with the migrating JET version.');
            addedComponents.forEach((addedComponent) => {
              const componentsInJetConfig = oraclejetConfig.components[addedComponent].components;
              const componentsFromResponse = configChanges.add[addedComponent].components;
              const components = Object.getOwnPropertyNames(componentsInJetConfig || {});

              // eslint-disable-next-line max-len
              oraclejetConfig.components[addedComponent].components = configChanges.add[addedComponent].components;

              // After updating the component version, then let the user know about what changed:
              components.forEach((component) => {
                utils.writeToMigrationLogFile(
                  'INFO',
                  `Updated ${component} version from ${JSON.stringify(componentsInJetConfig[component])} to ${JSON.stringify(componentsFromResponse[component])}.`
                );
                utils.log(`Updated ${component} version from ${JSON.stringify(componentsInJetConfig[component])} to ${JSON.stringify(componentsFromResponse[component])}.`);
              });
            });
            utils.writeToMigrationLogFile(
              'INFO',
              'Updating components\' versions task finished.'
            );
            utils.log.success('Updating components\' versions task finished.');
            fs.writeJSONSync(pathToOracleJetConfig, oraclejetConfig, { encoding: 'utf-8', spaces: 2 });
          } else {
            _extractResponseDataAndWriteToLogFile(details);
            utils.log.error('You have exchange components that are not compatible with the version you are migrating to. For more info, open: ojet.migrate.log');
            reject();
          }
        })
        .then(() => {
          utils.log('Validating and updating exchange components versions task finished.');
          utils.writeToMigrationLogFile(
            'INFO',
            'Validating and updating exchange component versions task finished.'
          );
          resolve(options);
        })
        .catch((error) => {
          utils.log.error(error);
          utils.writeToMigrationLogFile(
            'ERROR',
            error
          );
          reject();
        });
    } else {
      utils.writeToMigrationLogFile(
        'INFO',
        'Skipped validating exchange components: no components were added to the project.'
      );
      utils.log('Skipping validating exchange components: no components were added to the project.');
      resolve(options);
    }
  });
}

function _validateIndexHtmlFile(pathToIndexHtmlFile) {
  utils.log('Validating index.html file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating index.html file.'
  );
  return new Promise((resolve, reject) => {
    try {
      const indexFileContent = fs.readFileSync(pathToIndexHtmlFile, {
        encoding: 'utf-8'
      });
      // Remove any scripts in between the theme injector tags:
      const themeInjectorRegex = /<!--\s*injector:theme\s*-->/;

      if (!themeInjectorRegex.test(indexFileContent)) {
        utils.writeToMigrationLogFile(
          'ERROR',
          'Executing the validating index.html file step terminated because the injector:theme flag in your index.html file is absent. Refer to our migration guide for step-by-step instructions.'
        );
        utils.log.error('To enable theme injection, include the <!-- injector:theme --> flag in your index.html file.\nRefer to our migration guide for step-by-step instructions.');
        reject();
      }

      const themeTagsRegex = /<!--\s*injector:theme\s*-->([\s\S]*?)<!--\s*endinjector\s*-->/m;
      const capturedGroup = indexFileContent && indexFileContent.match(themeTagsRegex)[1];
      // An assumption here is that the anything in-between wil start with an opening tag:
      if (capturedGroup && capturedGroup.includes('<')) {
        utils.writeToMigrationLogFile(
          'ERROR',
          'Leave the space between <!-- injector:theme --> and <!-- endinjector --> empty in your index.html file.\nStyle tags will be automatically inserted in-between the tags during the build process.'
        );
        utils.log.error('Leave the space between <!-- injector:theme --> and <!-- endinjector --> empty in your index.html file.\nStyle tags will be automatically inserted in-between the tags during the build process.');
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
        utils.writeToMigrationLogFile(
          'ERROR',
          'To enable js scripts to be injected, include the <!-- injector:scripts --> flag in your index.html file. Refer to our migration guide for step-by-step instructions.'
        );
        utils.log.error('To enable js scripts to be injected, include the <!-- injector:scripts --> flag in your index.html file. Refer to our migration guide for step-by-step instructions.');
        reject();
      }

      const hasScriptTags = scriptsArray.some(regex => regex.test(indexFileContent));
      if (hasScriptTags) {
        utils.writeToMigrationLogFile(
          'ERROR',
          'With the <!-- injector:scripts --> flag in place, you can safely remove any existing main.js and require.js scripts from your index.html file. They will be automatically included during build time. Refer to our migration guide for step-by-step instructions.'
        );
        utils.log.error('With the <!-- injector:scripts --> flag in place, you can safely remove any existing main.js and require.js scripts from your index.html file. They will be automatically included during build time. Refer to our migration guide for step-by-step instructions.');
        reject();
      }

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating index.html file task finished.'
      );

      utils.log('Validating index.html file task finished.');

      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _validateIndexHtmlFileForWebpack(pathToIndexHtmlFile) {
  utils.log('Validating index.html file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating index.html file.'
  );
  return new Promise((resolve, reject) => {
    try {
      let indexHtmlContent = fs.readFileSync(pathToIndexHtmlFile, {
        encoding: 'utf-8'
      });
      // Remove any scripts in between the theme injector tags:
      const linkTagFlag = '<!-- Link-tag flag that webpack replaces with theme style links during build time -->';
      const themeCommentRegex = /<!--\s*Link-tag\s*flag\s*that\s*webpack\s*replaces\s*with\s*theme\s*style\s*links\s*during\s*build\s*time\s*-->/gi;
      const stylePlaceholderRegex = /<link\s+rel\s*=\s*"stylesheet"\s*>/gi;

      if (!stylePlaceholderRegex.test(indexHtmlContent)) {
        indexHtmlContent = indexHtmlContent.replace(
          /<link\s*rel="stylesheet"\s*href="css\/app.css"\s*type="text\/css"\s*\/>/gm,
          ''
        );
        indexHtmlContent = indexHtmlContent.replace(
          /<link\s*rel="stylesheet"\s*href="styles\/app.css"\s*type="text\/css"\s*\/>/gm,
          ''
        );
        indexHtmlContent = indexHtmlContent.replace(/<!-- injector:theme -->/gm, '<link rel="stylesheet">');
        indexHtmlContent = indexHtmlContent.replace(/(<meta name="description".* \/>)/, '');

        utils.writeToMigrationLogFile(
          'INFO',
          'Removed the styles tags and replaced them with <link rel="stylesheet">; webpack will use this as a flag when injecting style tags during build time.'
        );

        utils.log('Removed the styles tags and replaced them with <link rel="stylesheet">; webpack will use this as a flag when injecting style tags during build time.');
      }

      if (!themeCommentRegex.test(indexHtmlContent)) {
        indexHtmlContent = indexHtmlContent.replace('<link rel="stylesheet">', `${linkTagFlag}\n<link rel="stylesheet">`);
        indexHtmlContent = indexHtmlContent.replaceAll(/^\s*\n/gm, '');
        utils.writeToMigrationLogFile(
          'INFO',
          'Added a comment in the index.html file to explain why we <link rel="stylesheet"> was added.'
        );

        utils.log('Added a comment in the index.html file to explain why we <link rel="stylesheet"> was added.');
      }

      fs.writeFileSync(pathToIndexHtmlFile, indexHtmlContent);

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating index.html file task finished.'
      );

      utils.log('Validating index.html file task finished.');

      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _checkAndWarnAboutPathMappingFileForWebpack(pathToApp, isVDOMApplication, configPaths) {
  utils.log('Checking the presense of a path_mapping.json file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Checking the presense of a path_mapping.json file.'
  );
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppPathMappingJson = path.join(
        pathToApp,
        isVDOMApplication ?
          '' :
          path.join(configPaths.src.common, configPaths.src.javascript),
        constants.PATH_MAPPING_JSON
      );

      if (fs.existsSync(pathToMigratingAppPathMappingJson)) {
        utils.writeToMigrationLogFile(
          'WARNING',
          'The path_mapping.json file is not utilized in Webpack-based projects. You can safely delete this file.'
        );
        utils.log.warning('The path_mapping.json file is not utilized in Webpack-based projects. You can safely delete this file.');
      }

      utils.writeToMigrationLogFile(
        'INFO',
        'Checking the presense of a path_mapping.json file task finished.'
      );
      utils.log('Checking the presense of a path_mapping.json file task finished.');
      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _validateMainJsFile(pathToApp, isVDOMApplication, configPaths) {
  utils.log('Validating main.js file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating main.js file.'
  );
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppMain = path.join(
        pathToApp,
        isVDOMApplication ?
          configPaths.src.common :
          path.join(configPaths.src.common, configPaths.src.javascript),
        'main.js'
      );

      if (fs.existsSync(pathToMigratingAppMain)) {
        const fileContent = fs.readFileSync(pathToMigratingAppMain, {
          encoding: 'utf-8'
        });

        const mainReleaseInjectorRegex = /\/\/\s*injector:\s*mainReleasePaths/;

        if (!mainReleaseInjectorRegex.test(fileContent)) {
          utils.writeToMigrationLogFile(
            'ERROR',
            'Missing "injector:mainReleasePaths" flag in main.js. Add it to ensure correct path updates during the release build process.'
          );
          utils.log.error('Missing "injector:mainReleasePaths" flag in main.js. Add it to ensure correct path updates during the release build process.');
        }
      } else {
        utils.writeToMigrationLogFile(
          'WARNING',
          'Missing the main.js file. Your app may not work correctly without this file.'
        );
        utils.log.warning('Missing the main.js file. Your app may not work correctly without this file.');
      }

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating main.js file task finished.'
      );
      utils.log('Validating main.js file task finished.');
      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _validateAndUpdateHooks(pathToApp) {
  utils.log('Validating and updating project hooks.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating and updating project hooks.'
  );
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppHooks = path.join(pathToApp, 'scripts', 'hooks');

      if (utils.fsExistsSync(pathToMigratingAppHooks)) {
        const pathToTemplateFolder = path.join(__dirname, '../../template');
        const pathToHooks = path.join(pathToTemplateFolder, 'common', 'scripts', 'hooks');
        const pathToTemplateHooksJson = path.join(pathToHooks, 'hooks.json');
        const pathToHooksJson = path.join(pathToMigratingAppHooks, 'hooks.json');
        const migratingAppHooksJson = utils.readJsonAndReturnObject(pathToHooksJson);
        const templateHooksJson = utils.readJsonAndReturnObject(pathToTemplateHooksJson);
        const migratingAppHookFiles = fs.readdirSync(pathToMigratingAppHooks);
        const hookFiles = fs.readdirSync(pathToHooks);

        const result = _objectDiff(migratingAppHooksJson, templateHooksJson);
        _logDiffResultToFileAndConsole(result);

        hookFiles.forEach((file) => {
          const hasFileEntryInHooksJson = migratingAppHooksJson.hooks[file.replace('.js', '')];
          if (!migratingAppHookFiles.includes(file)) {
            fs.copySync(
              path.join(pathToHooks, file),
              path.join(pathToMigratingAppHooks, file)
            );

            if (!hasFileEntryInHooksJson) {
              // Read the hooks.json file and then update it accordingly:
              migratingAppHooksJson.hooks[file.replace('.js', '')] = path.join('scripts', 'hooks', file);
            }
          } else if (migratingAppHookFiles.includes(file) && !hasFileEntryInHooksJson &&
            file.endsWith('.js')) {
            // Read the hooks.json file and then update it accordingly:
            migratingAppHooksJson.hooks[file.replace('.js', '')] = path.join('scripts', 'hooks', file);
          }
        });

        // Check if the config folder under the scripts folder exists:
        if (fs.existsSync(pathToMigratingAppHooks.replace('hooks', 'config'))) {
          utils.writeToMigrationLogFile(
            'WARNING',
            'Found an existing scripts/config folder, which is no longer needed and might cause errors in some cases. Please consider removing it to avoid potential issues.'
          );
          utils.log.warning('Found an existing scripts/config folder, which is no longer needed and might cause errors in some cases. Please consider removing it to avoid potential issues.');
        }

        fs.writeJSONSync(
          pathToHooksJson,
          migratingAppHooksJson,
          {
            encoding: 'utf-8',
            spaces: 2
          }
        );
      } else {
        utils.writeToMigrationLogFile(
          'WARNING',
          'Your app is missing the the hooks folder. Some functionalities might not be working correctly.'
        );
        utils.log.warning('Your app is missing the the hooks folder. Some functionalities might not be working correctly.');
      }

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating and updating project hooks task finished.'
      );
      utils.log('Validating and updating project hooks task finished.');
      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

/**
 * Validates the contents of the ojet.config.js file.
 *
 * @param {string} pathToApp - The path to the project root folder.
 */
function _validateOjetConfigFile(pathToApp) {
  utils.log('Validating ojet.config.js file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating ojet.config.js file.'
  );
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(
        path.join(pathToApp, constants.OJET_CONFIG_FILE),
        'utf-8'
      );

      const fileDescription = fileContent.match(/(?<=module\.exports\s*=\s*\{)([\s\S]*?)(?=webpack:)/gs);
      const removeWhiteSpaces = str => str.replace(/[ \t\r\n]+/g, '').replace(/\s+/g, '');

      if (!fileDescription) {
        utils.writeToMigrationLogFile(
          'WARNING',
          'ojet.config.js file lacks a function description. While this omission does not impact the build process, including a description can improve code readability and facilitate future maintenance.'
        );
        utils.log.warning('ojet.config.js file lacks a function description. While this omission does not impact the build process, including a description can improve code readability and facilitate future maintenance.');
      }

      // Validate function description
      if (removeWhiteSpaces(constants.OJET_CONFIG_FILE_DESCRIPTION) !==
        removeWhiteSpaces(fileDescription[0])) {
        utils.writeToMigrationLogFile(
          'WARNING',
          `Description mismatch detected in ojet.config.js. Please update it to match the standard format: ${constants.OJET_CONFIG_FILE_DESCRIPTION}.`
        );
      }

      // Validate function return type and contents:
      const returnStatementRegex = /return\s*({[^}]+})/;
      const match = fileContent.match(returnStatementRegex);
      if (match && Array.isArray(match) && match[1]) {
        const hasRequiredProperties = ['webpack:', 'context'].every(item => match[1].includes(item));

        if (!hasRequiredProperties) {
          utils.writeToMigrationLogFile(
            'ERROR',
            'The returned object from the webpack function in ojet.config.js is missing required properties: either webpack (with assigned value config) or context, expected "return { context, webpack: config }".'
          );
          utils.log.error('The returned object from the webpack function in ojet.config.js is missing required properties: either webpack (with assigned value config) or context, expected "return { context, webpack: config }"');
        }
      }

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating ojet.config.js file task finished.'
      );
      utils.log('Validating ojet.config.js file task finished.');
      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

/**
 * Validates the hooks in the project to ensure the ones needed
 * for webpack based projects are present.
 *
 * @param {string} pathToApp - The path to the project root folder.
 */
function _validateAndUpdateHooksForWebpack(pathToApp) {
  utils.log('Validating and updating project hooks.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating and updating project hooks.'
  );
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppHooks = path.join(pathToApp, 'scripts', 'hooks');

      if (utils.fsExistsSync(pathToMigratingAppHooks)) {
        const pathToTemplateFolder = path.join(__dirname, '../../template');
        const pathToHooks = path.join(pathToTemplateFolder, 'common', 'scripts', 'hooks');
        const pathToTemplateHooksJson = path.join(pathToHooks, 'hooks.json');
        const pathToHooksJson = path.join(pathToMigratingAppHooks, 'hooks.json');
        const migratingAppHooksJson = utils.readJsonAndReturnObject(pathToHooksJson);
        const templateHooksJson = utils.readJsonAndReturnObject(pathToTemplateHooksJson);
        const migratingAppHookFiles = fs.readdirSync(pathToMigratingAppHooks);
        const hookFiles = fs.readdirSync(pathToHooks);
        const hooksNeededForWebpackApps = [
          'after_build.js',
          'after_serve.js',
          'before_build.js',
          'before_serve.js',
          'after_app_restore.js',
          'after_app_create.js'
        ];
        hookFiles.forEach((file) => {
          if (!migratingAppHookFiles.includes(file) && hooksNeededForWebpackApps.includes(file)) {
            fs.copySync(
              path.join(pathToHooks, file),
              path.join(pathToMigratingAppHooks, file)
            );

            // Read the hooks.json file and then update it accordingly:
            migratingAppHooksJson.hooks[file.replace('.js', '')] = path.join('scripts', 'hooks', file);
          } else if (!hooksNeededForWebpackApps.includes(file)) {
            utils.writeToMigrationLogFile(
              'INFO',
              `Found ${file} hook in your project, which is not required in a Webpack-based setup. Consider removing it to avoid potential conflicts or unnecessary overhead.`
            );
            utils.log.warning(`Found ${file} hook in your project, which is not required in a Webpack-based setup. Consider removing it to avoid potential conflicts or unnecessary overhead.`);
          }
        });

        // Check if the config folder under the scripts folder exists:
        if (fs.existsSync(pathToMigratingAppHooks.replace('hooks', 'config'))) {
          utils.writeToMigrationLogFile(
            'WARNING',
            'Found an existing scripts/config folder, which is no longer needed and might cause errors in some cases. Please consider removing it to avoid potential issues.'
          );
          utils.log.warning('Found an existing scripts/config folder, which is no longer needed and might cause errors in some cases. Please consider removing it to avoid potential issues.');
        }

        fs.writeJSONSync(
          pathToHooksJson,
          migratingAppHooksJson, {
            encoding: 'utf-8',
            spaces: 2
          }
        );

        const result = _objectDiff(migratingAppHooksJson, templateHooksJson);
        _logDiffResultToFileAndConsole(result);
      } else {
        utils.writeToMigrationLogFile(
          'WARNING',
          'Your app is missing the the hooks folder. Some functionalities might not be working correctly.'
        );
        utils.log.warning('Your app is missing the the hooks folder. Some functionalities might not be working correctly.');
      }

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating and updating project hooks task finished.'
      );
      utils.log('Validating and updating project hooks task finished.');
      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _validateAndUpdatePathMappings(pathToApp, isVDOMApplication, configPaths) {
  utils.log('Validating and updating path_mapping.json file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating and updating path_mapping.json file.'
  );
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
      const updatedPathMappingJson = utils.loadToolingUtil().deepMerge(
        migratingAppPathMappingJson,
        basicTemplPathMappingJson
      );

      // Let's retrieve info on what has been changed or added and log it to file
      // and console:
      const result = _objectDiff(migratingAppPathMappingJson, updatedPathMappingJson);
      _logDiffResultToFileAndConsole(result);

      // Update the migrating app's path_mapping.json:
      fs.writeJSONSync(
        pathToMigratingAppPathMappingJson,
        updatedPathMappingJson, {
          encoding: 'utf-8',
          spaces: 2
        }
      );

      utils.writeToMigrationLogFile(
        'INFO',
        'Validating and updating path_mapping.json file task finished.'
      );
      utils.log('Validating and updating path_mapping.json file task finished.');
      resolve();
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
      utils.log.error(error);
      reject();
    }
  });
}

function _validateAndUpdateOraclejetConfig(pathToApp, options) {
  utils.log('Validating and updating oraclejetconfig.json file.');
  utils.writeToMigrationLogFile(
    'INFO',
    'Validating and updating oraclejetconfig.json file.'
  );
  return new Promise((resolve, reject) => {
    try {
      const pathToMigratingAppOraclejetConfigJson = path.join(pathToApp, constants.APP_CONFIG_JSON);
      const pathToTemplateFolder = path.join(__dirname, '../../template');
      const pathToOraclejetConfigJsonTemplate = path.join(pathToTemplateFolder, 'common', constants.APP_CONFIG_JSON);

      const templateJson = utils.readJsonAndReturnObject(pathToOraclejetConfigJsonTemplate);
      const migratingAppJson = utils.readJsonAndReturnObject(pathToMigratingAppOraclejetConfigJson);
      const { paths: templatePaths, ...otherTemplateJsonProperties } = templateJson;
      const { paths: migratingAppPaths, ...otherMigratingAppJsonProperties } = migratingAppJson;

      // For VDOM application, by default, paths.source.[javascript | typescript] must
      // have values ".". If it happens that the migrating app does not have the
      // paths for the two properties at all, then make sure they have the default
      // values since the template we are using is nont vdom's.
      if (utils.loadToolingUtil().isVDOMApplication()) {
        const migratingAppJsonPaths = migratingAppJson.paths;
        const srcPaths = migratingAppJsonPaths && migratingAppJsonPaths.source;
        const tsPath = srcPaths && srcPaths.typescript;
        const jsPath = srcPaths && srcPaths.javascript;

        if (!tsPath) {
          templateJson.paths.source.typescript = '.';
        }

        if (!jsPath) {
          templateJson.paths.source.javascript = '.';
        }
      }

      // For paths, the migrating app's oraclejetconfig.json should take precedence because,
      // it could be the case that the user has customized the paths sub-properties to fit
      // user's preferred project structure:
      const newMigratingAppJson = {
        ...migratingAppJson,
        paths: utils.loadToolingUtil().deepMerge(templatePaths, migratingAppPaths),
        ...utils.loadToolingUtil().deepMerge(
          otherMigratingAppJsonProperties,
          otherTemplateJsonProperties
        )
      };

      // Update the oraclejet config according to the desired
      if (options && options.sassVer) {
        const versionRegex = /(\d+)\.(\d+)\.(\d+)/;
        if (versionRegex.test(options.sassVer)) {
          newMigratingAppJson.sassVer = options.sassVer;
        } else {
          utils.writeToMigrationLogFile(
            'ERROR',
            'Incorrect sass version format: Sass version must be in the format x.y.z'
          );
          utils.log.error('Incorrect sass version format: Sass version must be in the format x.y.z');
          reject();
        }
      }

      if (options && options.theme) {
        newMigratingAppJson.defaultTheme = options.theme;
      }

      // Log the changes to the ojet.migrate.log file and on the console:
      const result = _objectDiff(migratingAppJson, newMigratingAppJson);
      _logDiffResultToFileAndConsole(result);

      fs.writeJSONSync(
        pathToMigratingAppOraclejetConfigJson,
        newMigratingAppJson,
        {
          encoding: 'utf-8',
          spaces: 2
        }
      );

      utils.log('Validating and updating oraclejetconfig.json file task finished.');
      utils.writeToMigrationLogFile(
        'INFO',
        'Validating and updating oraclejetconfig.json file task finished.'
      );
      resolve(options);
    } catch (error) {
      utils.writeToMigrationLogFile(
        'ERROR',
        error
      );
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
  const configPath = path.join(process.cwd(), constants.APP_CONFIG_JSON);
  let configJson;

  if (fs.existsSync(configPath)) {
    configJson = utils.readJsonAndReturnObject(configPath);
  }

  const { enableLegacyPeerDeps } = configJson || {};
  // Add this as a flag to ensure we retrieve a correct installer for the task
  // and then remove it.
  // eslint-disable-next-line no-param-reassign
  options.task = 'restore';
  const installer = utils.getInstallerCommand(options);
  // eslint-disable-next-line no-param-reassign
  delete options.task;


  let command = `${installer.installer} ${installer.verbs.install}`;
  const installFlags = [];

  if (enableLegacyPeerDeps && installer.installer === 'npm') {
    command += ` ${installer.flags.legacy}`; // putting extra space to ensure the flag is properly appended
    installFlags.push(installer.flags.legacy);
  }

  if (restoreExchangeOnly && installer.installer === 'npm') {
    utils.log(`Skipping '${command}'.`);
    return Promise.resolve();
  }

  utils.log(`Performing '${command}'. may take a bit.`);
  return utils.spawn(installer.installer, [installer.verbs.install, ...installFlags]);
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
    utils.log.error('Flag \'--platform\' is not supported.');
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

/**
 * Calculates the difference between two objects, including added and updated properties.
 *
 * @param {object} obj1 - The base object to compare against.
 * @param {object} obj2 - The object to compare with obj1.
 * @param {string} [modifiedPropertyPath=''] - The current property path being compared.
 *                                             Used for recursive calls.
 * @returns {object} An object representing the differences between obj1 and obj2.
 *                   An example output is {"b.d": { old: 3, new: 4 }, "b.f": { added: 6 }}
 */
function _objectDiff(obj1, obj2, modifiedPropertyPath = '') {
  const diff = {};
  Object.keys(obj1 || {}).forEach((key) => {
    const currentPath = modifiedPropertyPath ? `${modifiedPropertyPath}.${key}` : key;
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      const subDiff = _objectDiff(obj1[key], obj2[key], currentPath);
      Object.keys(subDiff).forEach((subKey) => {
        diff[subKey] = subDiff[subKey];
      });
    } else if (Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] !== obj2[key]) {
      diff[currentPath] = { old: obj1[key], new: obj2[key] };
    }
  });

  // Check for newly added properties
  Object.keys(obj2 || {}).forEach((key) => {
    const currentPath = modifiedPropertyPath ? `${modifiedPropertyPath}.${key}` : key; // Use modifiedPropertyPath here
    if (!Object.prototype.hasOwnProperty.call(obj1, key)) {
      diff[currentPath] = { added: obj2[key] };
    }
  });

  return diff;
}

/**
 * Logs the differences between two objects to the console and the ojet.migrate.log file.
 *
 * @param {object} result - An object containing the changes that occurred during migration.
 *                          The object should have the following structure:
 *                          {
 *                            propertyName: {
 *                              added: newValue, // New property added
 *                              old: oldValue,   // Old value of updated property
 *                              new: newValue    // New value of updated property
 *                            }
 *                          }
 * @description This function iterates over the result object and logs each change to the
 *              console and the ojet.migrate.log file. It handles three types of changes:
 *              added properties, updated properties, and unchanged properties.
 */
function _logDiffResultToFileAndConsole(result) {
  if (utils.isObjectEmpty(result)) {
    utils.log('Task executed without modifications: compatibility confirmed.');
    utils.writeToMigrationLogFile(
      'INFO',
      'Task executed without modifications: compatibility confirmed.'
    );
    return;
  }

  // Iterate over each property in the result object.
  Object.keys(result).forEach((propertyName) => {
    if (result[propertyName].added !== undefined) {
      // Log added property to console and file.
      _logAddedProperty(propertyName, result[propertyName]);
    } else if (result[propertyName].old !== undefined && result[propertyName].new !== undefined) {
      // Log updated property to console and file.
      _logUpdatedProperty(propertyName, result[propertyName]);
    }
  });
}

/**
 * Logs an updated property to the console and the ojet.migrate.log file.
 *
 * @param {string} propertyName - The name of the property that was updated.
 * @param {object} propertyValue - An object containing the old and new values of the property.
 *                                The object should have the following structure:
 *                                {
 *                                  old: oldValue,   // Old value of the property
 *                                  new: newValue    // New value of the property
 *                                }
 * @description This function logs the updated property to the console and
 *              the ojet.migrate.log file. If either the old or new value
 *              is an object, it will be stringified using JSON.stringify().
 */
function _logUpdatedProperty(propertyName, propertyValue) {
  if (typeof propertyValue.old === 'object' || typeof propertyValue.new === 'object') {
    // Log updated property with object values to console and file.
    utils.log(`Updated property ${propertyName} from ${JSON.stringify(propertyValue.old, null, 2)} to ${JSON.stringify(propertyValue.new, null, 2)}`);
    utils.writeToMigrationLogFile(
      'INFO',
      `Updated property "${propertyName}" from ${JSON.stringify(propertyValue.old)} to ${JSON.stringify(propertyValue.new)}`
    );
  } else {
    // Log updated property with primitive values to console and file.
    utils.log(`Updated property ${propertyName} from ${propertyValue.old} to ${propertyValue.new}`);
    utils.writeToMigrationLogFile(
      'INFO',
      `Updated property "${propertyName}" from ${propertyValue.old} to ${propertyValue.new}`
    );
  }
}

/**
 * @param {string} propertyName - The name of the property that was added.
 * @param {object} propertyValue - An object containing the added value of the property.
 *                                The object should have the following structure:
 *                                {
 *                                  added: addedValue // Value of the added property
 *                                }
 * @description This function logs the added property to the console and the ojet.migrate.log file.
 *              If the added value is an object, it will be stringified using JSON.stringify().
 */
function _logAddedProperty(propertyName, propertyValue) {
  if (typeof propertyValue.added === 'object') {
    // Log added property with object value to console and file.
    utils.log(`Added new property ${propertyName} with value: ${JSON.stringify(propertyValue.added, null, 2)}`);
    utils.writeToMigrationLogFile(
      'INFO',
      `Added new property "${propertyName}" with value: ${JSON.stringify(propertyValue.added)}`
    );
  } else {
    // Log added property with primitive value to console and file.
    utils.log(`Added new property ${propertyName} with value: ${propertyValue.added}`);
    utils.writeToMigrationLogFile(
      'INFO',
      `Added new property "${propertyName}" with value: ${propertyValue.added}`
    );
  }
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

function _addMultiLocaleSupport() {
  const pathToApp = utils.loadToolingUtil().destPath();
  const toolingUtil = utils.loadToolingUtil();
  const configPaths = toolingUtil.getConfiguredPaths();
  const pathtoSrcFolder = path.join(pathToApp, configPaths.src.common);
  const pathToJsFolder = path.join(pathtoSrcFolder, configPaths.src.javascript);
  const pathToTsFolder = path.join(pathtoSrcFolder, configPaths.src.typescript);

  // We create a new root file that will pre-load the bundles before
  // rendering the UI. This root file will start with init- to indicate
  // that is an initial root file.
  if (toolingUtil.isVDOMApplication()) {
    _createInitFile(
      path.join(pathtoSrcFolder, 'index.ts')
    );
  } else if (toolingUtil.isTypescriptApplication()) {
    _createInitFile(
      path.join(pathToTsFolder, 'root.ts')
    );
  } else {
    _createInitFile(
      path.join(pathToJsFolder, 'root.js')
    );
  }

  // Update the the oracljetconfig.json file:
  const pathToConfigJson = path.join(pathToApp, constants.APP_CONFIG_JSON);
  const configJson = utils.readJsonAndReturnObject(pathToConfigJson);

  configJson.multiLocaleSupport = true;

  fs.writeJsonSync(pathToConfigJson, configJson);
}

function _createInitFile(filePath) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExtension = path.basename(filePath, path.extname(filePath));

  // Create a new root file:
  const fileContent = `
    ${filePath.endsWith('root.js') ? '' : '// @ts-ignore\n'}
    import { loadTranslationBundles } from 'bootstrap';\n
    (
      async () => {
        await loadTranslationBundles();
        import ('./${fileNameWithoutExtension}');
      }
    )();
  `;

  fs.writeFileSync(
    filePath.replace(fileName, `init-${fileName}`),
    fileContent
  );
}

/**
 * @param {object} data - An object containing error messages for each pack and version.
 *                        The object should have the following structure:
 *                        {
 *                          packName: {
 *                            version: [
 *                              'error message 1: [list of component(s) causing the error]',
 *                              'error message 2: [list of dependency(ies) causing the error]'
 *                            ],
 *                            ...
 *                          }
 *                        }
 * @description This function iterates over the data object and extracts
 *              error messages for each pack/component and version. It then writes
 *              these error messages to the migration log file with an
 *              ERROR severity level.
 */
function _extractResponseDataAndWriteToLogFile(data) {
  if (utils.isObjectEmpty(data)) {
    return;
  }
  // Iterate over each pack in the data object
  Object.keys(data).forEach((packName) => {
    const incompatibleVersions = [];

    // Iterate over each version of the pack
    Object.keys(data[packName]).forEach(version => incompatibleVersions.push(version));

    // Remove duplicates from arrays, if any:
    const uniqueIncompatibleVersions = [...new Set(incompatibleVersions)];

    // Write the error message to the log file
    if (uniqueIncompatibleVersions.length > 0) {
      const versionsListMessage = uniqueIncompatibleVersions.length > 1 ?
        `The incompatible versions are ${uniqueIncompatibleVersions.join(', ')}` :
        `The incompatible version is ${uniqueIncompatibleVersions[0]}`;
      utils.writeToMigrationLogFile(
        'ERROR',
        `The component "${packName}" has version(s) with components and/or dependencies that are incompatible with the JET version. ${versionsListMessage}.`
      );
    }
  });
}

function _addTranslationsBundlesToJetApp() {
  const pathToApp = utils.loadToolingUtil().destPath();
  const toolingUtil = utils.loadToolingUtil();
  const configPaths = toolingUtil.getConfiguredPaths();
  const pathToSrcFolder = path.join(pathToApp, configPaths.src.common);
  const pathToJsAppResourcesFolder = path.join(
    pathToSrcFolder,
    configPaths.src.javascript,
    constants.RESOURCES
  );
  const pathToTsAppResourcesFolder = path.join(
    pathToSrcFolder,
    configPaths.src.typescript,
    constants.RESOURCES
  );
  const pathToVdomAppResourcesFolder = path.join(
    pathToSrcFolder,
    constants.RESOURCES
  );

  let pathToResourcesFolder;
  // let pathToTranslationsBundles;
  if (utils.isTypescriptApplication()) {
    pathToResourcesFolder = pathToTsAppResourcesFolder;
  } else if (utils.isVDOMApplication()) {
    pathToResourcesFolder = pathToVdomAppResourcesFolder;
  } else {
    pathToResourcesFolder = pathToJsAppResourcesFolder;
  }

  const pathToNlsFolder = path.join(pathToResourcesFolder, constants.NLS);
  if (!fs.existsSync(pathToResourcesFolder)) {
    // First, create the resources folder if it doesn't exist
    fs.mkdirSync(pathToResourcesFolder);

    // Then check if the nls folder exists as well:
    if (!fs.existsSync(pathToNlsFolder)) {
      fs.mkdirSync(pathToNlsFolder);
    }
  } else if (!fs.existsSync(pathToNlsFolder)) {
    fs.mkdirSync(pathToNlsFolder);
  }

  // Create the root bundle
  const rootBundle = path.join(pathToNlsFolder, 'translationBundle.json');
  if (!fs.existsSync(rootBundle)) {
    fs.writeJSONSync(rootBundle, { greeting: 'Hello! How are you doing?' }, { spaces: 2, encoding: 'utf8' });
  }

  // Create the de translations:
  const deTranslationsBundleFolder = path.join(pathToNlsFolder, 'de');
  if (!fs.existsSync(deTranslationsBundleFolder)) {
    fs.mkdirSync(deTranslationsBundleFolder);
  }

  const deTranslationsBundle = path.join(deTranslationsBundleFolder, 'translationBundle.json');
  if (!fs.existsSync(deTranslationsBundle)) {
    fs.writeJSONSync(deTranslationsBundle, { greeting: 'Hallo! Wie geht\'s dir?' }, { spaces: 2, encoding: 'utf8' });
  }

  // add these configurations in the oraclejetconfig.json file:
  const pathToConfigJson = path.join(pathToApp, constants.APP_CONFIG_JSON);
  const configJson = utils.readJsonAndReturnObject(pathToConfigJson);

  if (!configJson.buildICUTranslationsBundle) {
    configJson.buildICUTranslationsBundle = true;
    fs.writeJsonSync(pathToConfigJson, configJson);
  }

  const folderName = utils.isTypescriptApplication() ? configPaths.src.typescript :
    configPaths.src.javascript;

  if (!configJson.translation) {
    // We are adding undefined values because
    // we are not sure how the user's project is set
    // and where the translation file will be:
    configJson.translation = {
      type: 'icu',
      options: {
        rootDir: `./${configPaths.src.common}/${folderName}/${constants.RESOURCES}/${constants.NLS}`,
        bundleName: 'translationBundle.json',
        locale: 'en-US',
        outDir: `./${configPaths.src.common}/${folderName}/${constants.RESOURCES}/${constants.NLS}`,
        hooks: undefined,
        module: (!utils.isTypescriptApplication() && !utils.isVDOMApplication()) ? 'amd' : undefined, // this generates .js files Js Apps
        exportType: undefined,
        override: undefined,
        supportedLocales: 'de',
        // eslint-disable-next-line no-template-curly-in-string
        componentBundleName: '${componentName}-strings.json'
      }
    };

    fs.writeJsonSync(pathToConfigJson, configJson, { spaces: 2 });
  }
}

function _promptUser() {
  // eslint-disable-next-line global-require
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    function askQuestion() {
      utils.log('Local components detected in your project. With adding webpack you won\'t be able to create, build, package, and publish your components. Would you like to continue? (yes/no)');

      readline.question('', (response) => {
        if (response.toLowerCase() === 'yes') {
          readline.close();
          resolve(true);
        } else if (response.toLowerCase() === 'no') {
          readline.close();
          resolve(false);
        } else {
          utils.log('Invalid response. Please enter "yes" or "no".');
          askQuestion();
        }
      });
    }

    askQuestion();
  });
}
