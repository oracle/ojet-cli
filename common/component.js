/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const CONSTANTS = require('../util/constants');
const paths = require('../util/paths');
const commonMessages = require('./messages');

module.exports = {
  /**
   * ## writeComponentTemplate
   *
   * Create a new component from our templates
   * in /template/component
   *
   * @param {object} generator object with build options
   * @param {object} utils object with helper methods
   * @returns {Promise}
   */
  writeComponentTemplate: function _writeComponentTemplate(generator, utils) {
    return new Promise((resolve) => {
      const componentName = _getComponentName(generator);
      const componentTemplateSrc = _getComponentTemplatePath(utils);
      const componentDestDirectory = _getComponentDestPath(generator, utils);
      const pack = generator.options.pack;
      // avoid overwrite component
      if (fs.existsSync(componentDestDirectory)) {
        utils.log.error(`Component with name '${componentName}' already exists.`);
      }
      fs.ensureDirSync(componentDestDirectory);
      fs.copySync(componentTemplateSrc, componentDestDirectory);
      if (pack) {
        _updatePackInfo(generator, utils, pack);
      }
      _renameComponentTemplatePrefix(generator, utils);
      _replaceComponentTemplateToken(generator, utils, pack);
      resolve();
    });
  },

  /**
   * ## validateComponentName
   *
   * Make sure the provided component name meets all
   * of our requirements
   *
   * @param {object} generator object with build options
   * @param {object} utils object with helper methods
   */
  validateComponentName: (generator, utils) => {
    const componentName = _getComponentName(generator);
    const pack = generator.options.pack;
    let errorMessage;
    if (componentName === undefined || componentName === null) {
      errorMessage = 'Invalid component name: must not be null or undefined.';
      utils.log.error(errorMessage);
    } else if (!pack && (componentName !== componentName.toLowerCase() || componentName.indexOf('-') < 0 || !/^[a-z]/.test(componentName))) {
      errorMessage = 'Invalid component name: must be all lowercase letters and contain at least one hyphen.';
      utils.log.error(errorMessage);
    } else if (pack && (componentName !== componentName.toLowerCase() || !/^[a-z]/.test(componentName))) {
      errorMessage = 'Invalid component name: must be all lowercase letters.';
      utils.log.error(errorMessage);
    } else if (pack && !fs.existsSync(_getPathToJETPack(generator, utils, pack))) {
      errorMessage = 'Invalid pack name: please provide an existing JET pack';
      utils.log.error(errorMessage);
    }
  },


  /**
   * ## checkThatAppExists
   *
   * Make sure command is being run inside of a JET app
   *
   * @param {object} utils object with helper methods
   */
  checkThatAppExists: (utils) => {
    const errorMessage = 'Please create an application first, then create the component from within that app.'; // eslint-disable-line max-len
    if (!utils.isCwdJetApp()) {
      utils.log.error(errorMessage);
    }
  },

  /**
   * ## logSuccessMessage
   *
   * Log success message indicating that component has been
   * created
   * @param {object} generator object with build options
   * @param {object} utils object with helper methods
   */
  logSuccessMessage: (generator, utils) => {
    utils.log(commonMessages.appendJETPrefix(`Add component '${_getComponentName(generator)}' finished.`));
  },

  /**
   * ## getComponentDestPath
   *
   * Return the dest path of the component.
   *
   * @param {object} generator object with build options
   * @param {object} utils object with helper methods
   */
  getComponentDestPath: (generator, utils) => (
    _getComponentDestPath(generator, utils)
  )
};

/**
 * ## _getComponentTemplatePath
 *
 * Get path to component template. Either ../template/component/js
 * or ../template/component/ts depending on whether application is
 * Typescript or Javascript based
 *
 * @param {object} utils object with helper methods
 * @returns {string} component template path
 */

function _getComponentTemplatePath(utils) {
  const componentTemplatePath = path.join(
    '..',
    'template',
    'component',
    utils.isTypescriptApplication() ? 'ts' : 'js'
  );
  return path.resolve(__dirname, componentTemplatePath);
}

/**
 * ## _getPathToJETPack
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 * @param {string} pack optional name of JET pack that the component
 * @returns {string}
 */
function _getPathToJETPack(generator, utils, pack) {
  return path.join(_getComponentsBasePath(generator, utils), pack);
}

/**
 * ## _getComponentDestPath
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 * @returns {string} component destination path
 */
function _getComponentDestPath(generator, utils) {
  const pack = generator.options.pack;
  const destBase = pack ?
    _getPathToJETPack(generator, utils, pack) : _getComponentsBasePath(generator, utils);
  return path.join(destBase, _getComponentName(generator));
}

/**
 * ## _replaceComponentTemplateToken
 *
 * Replace tokens (@component-name@ & @full-component-name@) in component templates
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 * @param {string} pack name of pack that component will belong to
 */
function _replaceComponentTemplateToken(generator, utils, pack) {
  const componentName = _getComponentName(generator);
  const componentBasePath = _getComponentDestPath(generator, utils);
  const componentResourcesPath = path.join(componentBasePath, 'resources/nls');
  _replaceComponentTokenInFileList(componentBasePath, componentName, pack);
  _replaceComponentTokenInFileList(componentResourcesPath, componentName, pack);
}

/**
 * ## _replaceComponentTokenInFileList
 *
 * Replace tokens (@component@) in list of component template files
 *
 * @param {object} componentDir directory containing component files
 * @param {object} componentName name of component
 * @param {string} pack name of JET pack that the component will belong to
 */
function _replaceComponentTokenInFileList(componentDir, componentName, pack) {
  const fullComponentName = pack ?
    `${pack}-${componentName}` : componentName;
  let fileContent;
  fs.readdirSync(componentDir).forEach((file) => {
    if (path.extname(file).length !== 0) {
      fileContent = fs.readFileSync(path.join(componentDir, file), 'utf-8');
      // replace @full-component-name@ token with pack-component if in pack.
      // otherwise replace with component
      fileContent = fileContent.replace(
        new RegExp('@full-component-name@', 'g'),
        fullComponentName
      );
      // replace @component-name@ with component name
      fileContent = fileContent.replace(new RegExp('@component-name@', 'g'), componentName);
      fs.outputFileSync(path.join(componentDir, file), fileContent);
    }
  });
}

/**
 * ## _getComponentsBasePath
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 * @returns {string} component base path
 */
function _getComponentsBasePath(generator, utils) {
  const appDir = generator.appDir === undefined
    ? process.cwd() : path.resolve(generator.appDir);
  const _configPaths = generator.appDir === undefined
    ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();
  return path.join(
    appDir,
    _configPaths.source,
    utils.isTypescriptApplication() ? _configPaths.sourceTypescript : _configPaths.sourceJavascript,
    CONSTANTS.JET_COMPOSITES);
}

/**
 * ## _getComponentName
 *
 * @param {object} generator object with build options
 * @returns {string} component name
 */
function _getComponentName(generator) {
  return generator.options.componentName;
}

/**
 * ## _renameComponentTemplatePrefix
 *
 * Replace token (@component@) in component file names
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 */
function _renameComponentTemplatePrefix(generator, utils) {
  const componentBasePath = _getComponentDestPath(generator, utils);
  const componentName = _getComponentName(generator);
  fs.readdirSync(componentBasePath).forEach((file) => {
    if (/@component@/.test(file)) _renameComponentTemplatePrefixFile(componentBasePath, file, componentName);
  });
  const componentResourcesPath = path.join(componentBasePath, 'resources/nls');
  if (fs.existsSync(componentResourcesPath)) {
    fs.readdirSync(componentResourcesPath).forEach((file) => {
      if (/@component@/.test(file)) _renameComponentTemplatePrefixFile(componentResourcesPath, file, componentName);
    });
  }
}

/**
 * ## _renameComponentTemplatePrefixFile
 *
 * Replace token (@component@) in component file name
 *
 * @param {string} componentDir name of file directory
 * @param {string} file name of file
 * @param {string} componentName name of component
 */
function _renameComponentTemplatePrefixFile(componentDir, file, componentName) {
  const oldPath = path.join(componentDir, file);
  const newPath = path.join(componentDir, file.replace('@component@', componentName));
  fs.renameSync(oldPath, newPath);
}

/**
 * ## _updatePackInfo
 *
 * Add component to packs dependencies and set pack of component
 * to the provided pack
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 * @param {string} pack name of JET pack that the component belongs to
 */
function _updatePackInfo(generator, utils, pack) {
  // set pack of component
  const componentJsonPath = path.join(
    _getComponentDestPath(generator, utils),
    CONSTANTS.COMPONENT_JSON
  );
  const componentJson = fs.readJSONSync(componentJsonPath);
  componentJson.pack = pack;
  fs.writeJSONSync(componentJsonPath, componentJson, { spaces: 2 });
  // add component to dependencies of pack
  const componentName = _getComponentName(generator);
  const packComponentJsonPath = path.join(_getPathToJETPack(
    generator, utils, pack),
    CONSTANTS.COMPONENT_JSON
  );
  const packComponentJson = fs.readJSONSync(packComponentJsonPath);
  packComponentJson.dependencies = packComponentJson.dependencies || {};
  packComponentJson.dependencies[`${pack}-${componentName}`] = '1.0.0';
  fs.writeJSONSync(packComponentJsonPath, packComponentJson, { spaces: 2 });
}

