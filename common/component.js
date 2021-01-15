/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

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
      const componentTemplateSrc = _getComponentTemplatePath(generator, utils);
      const componentThemeTemplateSrc = _getComponentThemeTemplatePath('theme');
      const componentDestDirectory = _getComponentDestPath(generator, utils);
      const pack = generator.options.pack;
      // avoid overwrite component
      if (fs.existsSync(componentDestDirectory)) {
        utils.log.error(`Component with name '${componentName}' already exists.`);
      }
      if (_isVComponent(generator) && !utils.isTypescriptApplication()) {
        utils.log.error('Cannot create a vcomponent in a Javascript application. Please run \'ojet add typescript\' to add Typescript support to your application.');
      }
      fs.ensureDirSync(componentDestDirectory);
      fs.copySync(componentTemplateSrc, componentDestDirectory);
      fs.copySync(componentThemeTemplateSrc, componentDestDirectory);
      // Copy theming template for composit components
      if (utils.validCustomProperties()) {
        const componentTemplateScssSrc = _getComponentThemeTemplatePath('pcss');
        fs.copySync(componentTemplateScssSrc, componentDestDirectory);
      } else {
        const componentTemplateCssSrc = _getComponentThemeTemplatePath('css');
        fs.copySync(componentTemplateCssSrc, componentDestDirectory);
      }
      // replace tokens in template files and file names
      _renameComponentTemplatePrefix(generator, utils);
      _replaceComponentTemplateToken(generator, utils, pack);
      if (pack) {
        // update pack info
        _updatePackInfo({ generator, utils, pack });
      } else if (_isVComponent(generator)) {
        // remove pack metadata from vcomponent template
        _stripPackFromVComponet({ generator, utils, pack });
      }
      // if in a typescript app, create path mapping in tsconfig.json
      _addComponentToTsconfigPathMapping(generator, utils);
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

function _getComponentTemplatePath(generator, utils) {
  let componentType;
  if (_isVComponent(generator)) {
    componentType = 'tsx';
  } else {
    componentType = utils.isTypescriptApplication() ? 'ts' : 'js';
  }
  const componentTemplatePath = path.join(
    '..',
    'template',
    'component',
    componentType
  );
  return path.resolve(__dirname, componentTemplatePath);
}

/**
 * ## _getComponentThemeTemplatePath
 *
 * Get path to component theme template.
 *
 * @returns {string} component template path
 */

function _getComponentThemeTemplatePath(directoryPath) {
  const themeTemplatePath = path.join('..', 'template', 'component', directoryPath);
  return path.resolve(__dirname, themeTemplatePath);
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
  const folderPaths = [
    componentBasePath,
    path.join(componentBasePath, 'resources/nls'),
    path.join(componentBasePath, 'themes/base'),
    path.join(componentBasePath, 'themes/redwood'),
  ];
  folderPaths.forEach((templatepath) => {
    if (fs.existsSync(templatepath)) {
      _replaceComponentTokenInFileList(templatepath, componentName, pack);
    }
  });
}

/**
 * ## _toCamelCase
 *
 * Converts a hyphenated class name, such as oj-foo, to camel case (ojFoo).
 * @param {String} str
 */
function _toCamelCase(str) {
  const camelCase = str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  return `${camelCase[0].toUpperCase()}${camelCase.substring(1)}`;
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
  let fileExt;
  fs.readdirSync(componentDir).forEach((file) => {
    fileExt = path.extname(file);
    if (fileExt.length !== 0) {
      fileContent = fs.readFileSync(path.join(componentDir, file), 'utf-8');
      fileContent = (fileExt !== '.scss') ? fileContent.replace(
        new RegExp('@full-component-name@', 'g'),
        fullComponentName
      ) : fileContent.replace(
        new RegExp('@full-component-name@', 'g'), fullComponentName).replace(
        new RegExp('@style-component-name@', 'g'), componentName
      );
      // replace @component-name@ with component name
      fileContent = fileContent.replace(new RegExp('@component-name@', 'g'), componentName);
      // Camel Case component name replacements are
      // needed only for vcomponent .tsx files.
      if (file && (fileExt === '.tsx' || fileExt === '.ts')) {
        fileContent = fileContent.replace(
          new RegExp('@camelcase-component-name@', 'g'),
          _toCamelCase(componentName));
      }

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
  const folderPaths = [
    componentBasePath,
    path.join(componentBasePath, 'resources/nls'),
    path.join(componentBasePath, 'themes/base'),
    path.join(componentBasePath, 'themes/redwood'),
  ];
  folderPaths.forEach((templatepath) => {
    if (fs.existsSync(templatepath)) {
      fs.readdirSync(templatepath).forEach((file) => {
        if (/@component@/.test(file)) _renameComponentTemplatePrefixFile(templatepath, file, componentName);
      });
    }
  });
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
function _updatePackInfo({ generator, utils, pack }) {
  // set pack of component
  if (_isVComponent(generator)) {
    _setVComponentPack({ generator, utils, pack });
  } else {
    _setCompositeComponentPack({ generator, utils, pack });
  }
  // add component to dependencies of pack
  _addComponentToPackDependencies({ generator, utils, pack });
}

/**
 * ## _updateVComponentPack
 *
 * @param {object} options.generator
 * @param {object} options.utils
 * @param {object} options.pack
 * @param {object} options.strip
 */
function _updateVComponentPack({ generator, utils, pack, strip }) {
  const vComponentPath = path.join(
    _getComponentDestPath(generator, utils),
    `${_getComponentName(generator)}.tsx`
  );
  let vComponentContent = fs.readFileSync(vComponentPath, 'utf-8');
  if (strip) {
    const packRegex = new RegExp('@ojmetadata pack "@pack-name@"');
    vComponentContent = vComponentContent.replace(packRegex, '');
  } else {
    vComponentContent = vComponentContent.replace('@pack-name@', pack);
  }
  fs.outputFileSync(vComponentPath, vComponentContent);
}

/**
 * ## _stripPackFromVComponent
 *
 * @param {object} options.generator
 * @param {object} options.utils
 * @param {object} options.pack
 */
function _stripPackFromVComponet({ generator, utils, pack }) {
  _updateVComponentPack({ generator, utils, pack, strip: true });
}

/**
 * ## _setVCompponentPack
 *
 * @param {object} options.generator
 * @param {object} options.utils
 * @param {object} options.pack
 */
function _setVComponentPack({ generator, utils, pack }) {
  _updateVComponentPack({ generator, utils, pack, strip: false });
}

/**
 * ## _setCompositeComponentPack
 *
 * @param {object} options.generator
 * @param {object} options.utils
 * @param {object} options.pack
 */
function _setCompositeComponentPack({ generator, utils, pack }) {
  const componentJsonPath = path.join(
    _getComponentDestPath(generator, utils),
    CONSTANTS.COMPONENT_JSON
  );
  const componentJson = fs.readJSONSync(componentJsonPath);
  componentJson.pack = pack;
  fs.writeJSONSync(componentJsonPath, componentJson, { spaces: 2 });
}

/**
 * ## _addComponentToPackDependencies
 *
 * @param {object} options.generator
 * @param {object} options.utils
 * @param {object} options.pack
 */
function _addComponentToPackDependencies({ generator, utils, pack }) {
  const componentName = _getComponentName(generator);
  const packComponentJsonPath = path.join(
    _getPathToJETPack(generator, utils, pack),
    CONSTANTS.COMPONENT_JSON);
  const packComponentJson = fs.readJSONSync(packComponentJsonPath);
  packComponentJson.dependencies = {
    ...(packComponentJson.dependencies || {}),
    [`${pack}-${componentName}`]: '1.0.0'
  };
  fs.writeJSONSync(packComponentJsonPath, packComponentJson, { spaces: 2 });
}

/**
 * ## _addComponentToTsconfigPathMapping
 *
 * If in a typescript application, create a path mapping for the component
 * in the tsconfig.json file
 *
 * @param {object} generator object with build options
 * @param {object} utils object with helper methods
 */
function _addComponentToTsconfigPathMapping(generator, utils) {
  // dont create path mapping if not in a typescript application
  // or if component will be in a pack. The pack will already have a
  // path mapping that the component can be accessed through i.e
  // <pack>/<component>
  if (!utils.isTypescriptApplication() || generator.options.pack) {
    return;
  }
  const toolingUtil = utils.loadToolingUtil();
  toolingUtil.addComponentToTsconfigPathMapping({
    component: _getComponentName(generator),
    isLocal: true
  });
}

/**
 * ## _isVComponent
 *
 * @param {object} generator object with build options
 * @returns {boolean}
 */
function _isVComponent(generator) {
  const type = generator.options.type;
  const vcomponent = generator.options.vcomponent;
  return (type && type === CONSTANTS.VCOMPONENT) || vcomponent;
}
