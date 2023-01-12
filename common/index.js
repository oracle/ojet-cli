/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const commonMessages = require('./messages');
const constants = require('../lib/util/constants');
const app = require('../lib/scopes/app');
const utils = require('../lib/util/utils');

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

  writeCommonTemplates: function _writeCommonTemplates(generator) {
    const templateSrc = path.resolve(__dirname, '../template/common');
    const templateDest = path.resolve('.');
    function filter(src, dest) {
      const isOracleJetConfigJson = path.basename(src) === constants.APP_CONFIG_JSON;
      const isVDOMTemplate = utils.isVDOMTemplate(generator);
      if (isVDOMTemplate && isOracleJetConfigJson) {
        // for vdom templates, update the oracljetconfig.json to
        // support the new architecture
        const oraclejetConfigJson = fs.readJSONSync(src);
        oraclejetConfigJson[constants.APPLICATION_ARCHITECTURE] = constants.VDOM_ARCHITECTURE;
        oraclejetConfigJson.paths.source.javascript = '.';
        oraclejetConfigJson.paths.source.typescript = '.';
        oraclejetConfigJson.paths.source.styles = 'styles';
        oraclejetConfigJson.paths.source.components = 'components';
        oraclejetConfigJson.paths.source.exchangeComponents = 'exchange_components';
        fs.writeJSONSync(dest, oraclejetConfigJson, { spaces: 2 });
        return false;
      } else if (isOracleJetConfigJson) {
        // for none-vdom templates, update oraclejetconfig.json
        // to indicate that architecture is mvvm (model-view-view-model)
        const oraclejetConfigJson = fs.readJSONSync(src);
        oraclejetConfigJson[constants.APPLICATION_ARCHITECTURE] = constants.MVVM_ARCHITECTURE;
        fs.writeJSONSync(dest, oraclejetConfigJson, { spaces: 2 });
        return false;
      }
      return true;
    }
    try {
      fs.copySync(templateSrc, templateDest, { filter });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  updatePackageJSON: function _updatePacakgeJSON(generator) {
    _updateJSON(generator, 'package.json');
    return Promise.resolve(generator);
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
    const args = generator.arguments;
    const validLength = _getValidArgLength(generator.options.namespace);

    if (args.length > validLength) {
      return Promise.reject(commonMessages.error(`Invalid additional arguments: ${args.splice(validLength)}`, 'validateArgs'));
    }
    return Promise.resolve(generator);
  },

  validateFlags: function _validateFlags(generator) {
    return new Promise((resolve, reject) => {
      const flags = generator.options;
      const SUPPORTED_FLAGS = constants.SUPPORTED_FLAGS(flags.namespace);
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

  addTypescript: (generator) => {
    if (generator.options.typescript) {
      return app.addTypescript(generator.options)
        .then(() => {
          if (generator.options.webpack && utils.isVDOMTemplate(generator)) {
            _customizeVDOMTemplateTsconfigForWebpack();
          }
        });
    }
    return Promise.resolve();
  },

  addpwa: (generator) => {
    if (generator.options.pwa) {
      return app.addpwa();
    }
    return Promise.resolve();
  },

  addwebpack: (generator) => {
    if (generator.options.webpack) {
      return app.addwebpack(generator.options)
        .then(() => {
          if (utils.isVDOMTemplate(generator)) {
            _customizeVDOMTemplateForWebpack();
          }
        });
    }
    return Promise.resolve();
  }
};

function _getValidArgLength(namespace) {
  // add-hybrid allows no argument
  // add-theme, app, hybrid, optional to take 1 argument
  return (/add-hybrid/.test(namespace)) ? 0 : 1;
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

function _updateJSON(generator, jsonPath) {
  const json = fs.readJSONSync(path.resolve('.', jsonPath));
  // space in app name will result in npm install failure
  json.name = _removeSpaceInAppName(generator.options.appname);
  if (generator.options[constants.USE_GLOBAL_TOOLING]) {
    // If create wants to use the global oraclejet-tooling,
    // then remove the dependency link in the created package.json
    delete json.devDependencies[constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME];
  }
  utils.loadToolingUtil().writeObjectAsJsonFile(path.resolve('.', jsonPath), json);
}

function _removeSpaceInAppName(appName) {
  return appName.replace(/\s/g, '-');
}

function _customizeVDOMTemplateTsconfigForWebpack() {
  // Add resolveJsonModule and esModuleInterop to app's tsconfig.json
  const pathToApp = '.';
  const pathToOraclejetConfigJson = path.join(pathToApp, 'oraclejetconfig.json');
  const oraclejetConfigJson = fs.readJSONSync(pathToOraclejetConfigJson);
  const pathToTsconfigJson = path.join(pathToApp, 'tsconfig.json');
  const tsconfigJson = fs.readJSONSync(pathToTsconfigJson);
  const toolingUtil = utils.loadToolingUtil();
  const preactPath = toolingUtil.getModulePath('./node_modules/preact', 'preact');
  const preactCompat = path.join(preactPath, 'compat', 'src', 'index.d.ts');

  tsconfigJson.compilerOptions.rootDir = `./${oraclejetConfigJson.paths.source.common}`;
  tsconfigJson.compilerOptions.outDir = `./${oraclejetConfigJson.paths.staging.web}`;
  tsconfigJson.compilerOptions.typeRoots.unshift('./types');
  tsconfigJson.compilerOptions.resolveJsonModule = true;
  tsconfigJson.compilerOptions.esModuleInterop = true;
  tsconfigJson.compilerOptions.removeComments = true;
  tsconfigJson.compilerOptions.strict = true;
  tsconfigJson.compilerOptions.paths.react = [
    preactCompat
  ];
  tsconfigJson.compilerOptions.paths['react-dom'] = [
    preactCompat
  ];
  fs.writeJSONSync(pathToTsconfigJson, tsconfigJson, { spaces: 2 });
}

function _customizeVDOMTemplateForWebpack() {
  const pathToApp = '.';
  const pathToOraclejetConfigJson = path.join(pathToApp, 'oraclejetconfig.json');
  const oraclejetConfigJson = fs.readJSONSync(pathToOraclejetConfigJson);
  // Remove injector tokens from index.html
  const pathToIndexHtml = path.join(
    pathToApp,
    oraclejetConfigJson.paths.source.common,
    'index.html'
  );
  let indexHtmlContent = fs.readFileSync(pathToIndexHtml, { encoding: 'utf-8' }).toString();
  indexHtmlContent = indexHtmlContent.replace(/<!-- .* -->/gm, '').replace(/^\s*\n/gm, '');
  indexHtmlContent = indexHtmlContent.replace(/(<meta name="description".* \/>)/, '$1\n    <!-- css:redwood -->');
  fs.outputFileSync(pathToIndexHtml, indexHtmlContent);
  // Delete ./src/main.js since webpack entry point is index.ts
  const pathToMainJs = path.join(
    pathToApp,
    oraclejetConfigJson.paths.source.common,
    oraclejetConfigJson.paths.source.javascript,
    'main.js'
  );
  fs.removeSync(pathToMainJs);
  // Delete ./scripts since not used by webpack build
  const pathToScriptsFolder = path.join(pathToApp, 'scripts');
  fs.removeSync(pathToScriptsFolder);
  // Delete ./path_mapping.json since not used by webpack build
  const pathToPathMappingJson = path.join(pathToApp, 'path_mapping.json');
  fs.removeSync(pathToPathMappingJson);
  // Replace ./.gitignore and replace
  const pathToGitIgnore = path.join(pathToApp, '.gitignore');
  const gitIgnoreContent =
  `/node_modules
/${oraclejetConfigJson.paths.source.exchangeComponents}
/${oraclejetConfigJson.paths.staging.web}
.DS_Store`.trim();
  fs.outputFileSync(pathToGitIgnore, gitIgnoreContent);
  // Inject ./types/components/index.ts
  const pathToComponentTypes = path.join(pathToApp, 'types/components/index.d.ts');
  const componentTypesContent = `
  // Add custom element entries to preact.JSX.IntrinsicElements for custom elements
  // used in JSX that do not have the required type definitions
  declare namespace preact.JSX {
    interface IntrinsicElements {

    }
  }`;
  fs.outputFileSync(pathToComponentTypes, componentTypesContent);
}
