/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const constants = require('../lib/util/constants');
const paths = require('../lib/util/paths');
const utils = require('../lib/util/utils');
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
  writeComponentTemplate: function _writeComponentTemplate(generator) {
    return new Promise((resolve) => {
      const componentName = _getComponentName(generator);
      const componentTemplateSrc = _getComponentTemplatePath(generator);
      const componentThemeTemplateSrc = _getComponentThemeTemplatePath('theme');
      const componentDestDirectory = _getComponentDestPath(generator);
      const pack = generator.options.pack;
      // eslint-disable-next-line max-len
      // avoid overwrite component
      if (fs.existsSync(componentDestDirectory)) {
        utils.log.error(`Component with name '${componentName}' already exists.`);
      }
      if (_isVComponent(generator) && !utils.isTypescriptApplication()) {
        utils.log.error('Cannot create a vcomponent in a Javascript application. Please run \'ojet add typescript\' to add Typescript support to your application.');
      }
      fs.ensureDirSync(componentDestDirectory);
      fs.copySync(componentTemplateSrc, componentDestDirectory);
      // Rename loader.ts in destination directory to index.ts for loaderless
      // components--the contents are the same:
      if (_isVComponent(generator) && !_withLoader({ generator, pack })) {
        const loaderFilePath = path.join(componentDestDirectory, 'loader.ts');
        const indexFilePath = path.join(componentDestDirectory, 'index.ts');
        if (fs.existsSync(loaderFilePath)) {
          fs.renameSync(loaderFilePath, indexFilePath);
        }
      }
      // Loaderless components should have @ojmetadata main "@pack-name@/@component-name@"
      // as part of the comment to ensure TSC inputs the main attribute into the component.json
      // file with appropriate pack and component name. Otherwise, remove it.
      if (_isVComponent(generator) && _withLoader({ generator, pack })) {
        const filesToModify = ['@component@-functional-template.tsx', '@component@.tsx'];
        filesToModify.forEach((file) => {
          const filePath = path.join(componentDestDirectory, file);
          const regex = /@ojmetadata\s*main\s*"@pack-name@\/@component-name@"/gm;
          let fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
          fileContent = fileContent.replace(regex, '');
          fs.writeFileSync(filePath, fileContent);
        });
      }
      if (_isResourceComponent(generator)) {
        const fileContent = constants.RESOURCE_COMPONENT_INDEX_FILE_CONTENT;
        fs.writeFileSync(path.join(componentDestDirectory, `index.${utils.isTypescriptApplication() ? 'ts' : 'js'}`), fileContent);
      } else {
        // Only copy theming files for none-resource components
        fs.copySync(componentThemeTemplateSrc, componentDestDirectory);
        // Copy theming template for composit components
        if (utils.validCustomProperties()) {
          const componentTemplateScssSrc = _getComponentThemeTemplatePath('pcss');
          fs.copySync(componentTemplateScssSrc, componentDestDirectory);
        } else {
          const componentTemplateCssSrc = _getComponentThemeTemplatePath('css');
          fs.copySync(componentTemplateCssSrc, componentDestDirectory);
        }
      }
      // replace tokens in template files and file names
      _renameComponentTemplatePrefix(generator);
      _replaceComponentTemplateToken(generator, pack);
      _filterTsxTemplates(generator, componentDestDirectory);
      if (pack) {
        // update pack info
        _updatePackInfo({ generator, pack });
      } else if (_isVComponent(generator)) {
        // remove pack metadata from vcomponent template
        _stripPackFromVComponent({ generator, pack });
      }

      // if in a typescript app, create path mapping in tsconfig.json
      _addComponentToTsconfigPathMapping(generator);
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
  validateComponentName: (generator) => {
    const componentName = _getComponentName(generator);
    const pack = generator.options.pack;
    // eslint-disable-next-line max-len
    let errorMessage;
    if (componentName === undefined || componentName === null) {
      errorMessage = 'Invalid component name: must not be null or undefined.';
      utils.log.error(errorMessage);
    } else if (!pack && _isResourceComponent(generator)) {
      errorMessage = 'Cannot create resource component: please re-run the command with --pack and provide an existing JET pack';
      utils.log.error(errorMessage);
    } else if (!pack && (componentName !== componentName.toLowerCase() || componentName.indexOf('-') < 0 || !/^[a-z]/.test(componentName))) {
      errorMessage = 'Invalid component name: must be all lowercase letters and contain at least one hyphen.';
      utils.log.error(errorMessage);
    } else if (pack && (componentName !== componentName.toLowerCase() || !/^[a-z]/.test(componentName))) {
      errorMessage = 'Invalid component name: must be all lowercase letters.';
      utils.log.error(errorMessage);
    } else if (pack && !fs.existsSync(_getPathToJETPack(generator, pack))) {
      errorMessage = 'Invalid pack name: please provide an existing JET pack';
      utils.log.error(errorMessage);
    } else if (!pack && !_withLoader({ generator, pack }) && _isVComponent(generator)) {
      errorMessage = 'Cannot create a loaderless component without a pack.';
      utils.log.error(errorMessage);
    } else if (!_withLoader({ generator, pack }) && !_isVComponent(generator)) {
      errorMessage = 'Cannot create a loaderless CCA component.';
      utils.log.error(errorMessage);
    }
  },

  /**
   * ## checkThatAppExists
   *
   * Make sure command is being run inside of a JET app
   *
   */
  checkThatAppExists: () => {
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
   */
  logSuccessMessage: (generator) => {
    utils.log(commonMessages.appendJETPrefix(`Add component '${_getComponentName(generator)}' finished.`));
    // Log out a message on what do to generate API docs for vcomponents only.
    if (_isVComponent(generator)) {
      utils.log(`To generate API docs for '${_getComponentName(generator)}', run 'ojet add docgen' before building it.`);
    }
  },

  /**
   * ## getComponentDestPath
   *
   * Return the dest path of the component.
   *
   * @param {object} generator object with build options
   */
  getComponentDestPath: (generator) => {
    const destPath = _getComponentDestPath(generator);
    return destPath;
  }
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

function _getComponentTemplatePath(generator) {
  const templateBasePath = path.join(__dirname, '../template');
  let componentTemplatePath;
  if (_isResourceComponent(generator)) {
    componentTemplatePath = path.join(templateBasePath, 'resource-component');
  } else {
    let componentType;
    if (_isVComponent(generator)) {
      componentType = 'tsx';
    } else {
      componentType = utils.isTypescriptApplication() ? 'ts' : 'js';
    }
    componentTemplatePath = path.join(
      templateBasePath,
      'component',
      componentType
    );
  }
  return path.resolve(componentTemplatePath);
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
 * @param {string} pack optional name of JET pack that the component
 * @returns {string}
 */
function _getPathToJETPack(generator, pack) {
  return path.join(_getComponentsBasePath(generator), pack);
}

/**
 * ## _getComponentDestPath
 *
 * @param {object} generator object with build options
 * @returns {string} component destination path
 */
function _getComponentDestPath(generator) {
  const pack = generator.options.pack;
  const destBase = pack ?
    _getPathToJETPack(generator, pack) : _getComponentsBasePath(generator);
  return path.join(destBase, _getComponentName(generator));
}

/**
 * ## _replaceComponentTemplateToken
 *
 * Replace tokens (@component-name@ & @full-component-name@) in component templates
 *
 * @param {object} generator object with build options
 * @param {string} pack name of pack that component will belong to
 */
function _replaceComponentTemplateToken(generator, pack) {
  const componentName = _getComponentName(generator);
  const componentBasePath = _getComponentDestPath(generator);
  const folderPaths = [
    componentBasePath,
    path.join(componentBasePath, 'resources/nls/root'),
    path.join(componentBasePath, 'themes/base'),
    path.join(componentBasePath, 'themes/redwood'),
    path.join(componentBasePath, 'themes/stable')
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
      // Camel Case component name or class name replacements are
      // needed only for vcomponent .tsx files.
      if (file && (fileExt === '.tsx' || fileExt === '.ts')) {
        fileContent = fileContent.replace(
          new RegExp('@camelcasecomponent-name@', 'g'),
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
function _getComponentsBasePath(generator) {
  const appDir = generator.appDir === undefined
    ? process.cwd() : path.resolve(generator.appDir);
  const _configPaths = generator.appDir === undefined
    ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();
  return path.join(
    appDir,
    _configPaths.source,
    utils.isTypescriptApplication() ? _configPaths.sourceTypescript : _configPaths.sourceJavascript,
    _configPaths.components);
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
 */
function _renameComponentTemplatePrefix(generator) {
  const componentBasePath = _getComponentDestPath(generator);
  const componentName = _getComponentName(generator);
  const folderPaths = [
    componentBasePath,
    path.join(componentBasePath, 'resources/nls/root'),
    path.join(componentBasePath, 'themes/base'),
    path.join(componentBasePath, 'themes/redwood'),
    path.join(componentBasePath, 'themes/stable')
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
 * Add component to packs dependencies (and contents, if monopack)
 * and set pack of component to the provided pack
 *
 * @param {object} generator object with build options
 * @param {string} pack name of JET pack that the component belongs to
 */
function _updatePackInfo({ generator, pack }) {
  // set pack of component
  if (_isVComponent(generator)) {
    _setVComponentPack({ generator, pack });
  } else {
    _setCompositeComponentPack({ generator, pack });
  }
  // add component to dependencies of pack
  _addComponentToPackDependencies({ generator, pack });
  // add component to contents if pack is mono-pack:
  if (_isMonoPack({ generator, pack })) {
    _addComponentToPackContents({ generator, pack });
  }
}

/**
 * ## _updateVComponentPack
 *
 * @param {object} options.generator
 * @param {object} options.pack
 * @param {object} options.strip
 */
function _updateVComponentPack({ generator, pack, strip }) {
  const vComponentPath = path.join(
    _getComponentDestPath(generator),
    `${_getComponentName(generator)}.tsx`
  );
  let vComponentContent = fs.readFileSync(vComponentPath, 'utf-8');
  if (strip) {
    const packRegex = new RegExp('@ojmetadata pack "@pack-name@"');
    vComponentContent = vComponentContent.replace(packRegex, '');
  } else {
    const packRegex = new RegExp('@pack-name@', 'g');
    vComponentContent = vComponentContent.replace(packRegex, pack);
  }
  fs.outputFileSync(vComponentPath, vComponentContent);
}

/**
 * ## _stripPackFromVComponent
 *
 * @param {object} options.generator
 * @param {object} options.pack
 */
function _stripPackFromVComponent({ generator, pack }) {
  _updateVComponentPack({ generator, pack, strip: true });
}

/**
 * ## _setVCompponentPack
 *
 * @param {object} options.generator
 * @param {object} options.pack
 */
function _setVComponentPack({ generator, pack }) {
  _updateVComponentPack({ generator, pack, strip: false });
}

/**
 * ## _setCompositeComponentPack
 *
 * @param {object} options.generator
 * @param {object} options.pack
 */
function _setCompositeComponentPack({ generator, pack }) {
  const componentJsonPath = path.join(
    _getComponentDestPath(generator),
    constants.COMPONENT_JSON
  );
  const componentJson = fs.readJSONSync(componentJsonPath);
  componentJson.pack = pack;
  fs.writeJSONSync(componentJsonPath, componentJson, { spaces: 2 });
}

/**
 * ## _addComponentToPackDependencies
 *
 * @param {object} options.generator
 * @param {object} options.pack
 */
function _addComponentToPackDependencies({ generator, pack }) {
  const componentName = _getComponentName(generator);
  const packComponentJsonPath = path.join(
    _getPathToJETPack(generator, pack),
    constants.COMPONENT_JSON);
  const packComponentJson = fs.readJSONSync(packComponentJsonPath);
  const hasDependenciesToken = utils.loadToolingUtil().hasDependenciesToken(packComponentJson);
  if (!hasDependenciesToken && !_isMonoPack({ generator, pack })) {
    // Only add component to dependencies if the component.json does not have the dependencies
    // token. If it does, the build will take care of adding all JET pack dependencies at build time
    packComponentJson.dependencies = {
      ...(packComponentJson.dependencies || {}),
      [`${pack}-${componentName}`]: '1.0.0'
    };
    fs.writeJSONSync(packComponentJsonPath, packComponentJson, { spaces: 2 });
  }
}

/**
 * ## _addComponentToPackContents
 *
 * @param {object} options.generator
 * @param {object} options.pack
 */
function _addComponentToPackContents({ generator, pack }) {
  const componentName = _getComponentName(generator);
  const packComponentJsonPath = path.join(
    _getPathToJETPack(generator, pack),
    constants.COMPONENT_JSON);
  const packComponentJson = fs.readJSONSync(packComponentJsonPath);
  const contentItem = _isResourceComponent(generator) ? { name: `${componentName}`, type: constants.RESOURCE_COMPONENT } : { name: `${componentName}` };
  if (packComponentJson.contents && Array.isArray(packComponentJson.contents)) {
    packComponentJson.contents.push(contentItem);
  } else {
    packComponentJson.contents = [contentItem];
  }
  fs.writeJSONSync(packComponentJsonPath, packComponentJson, { spaces: 2 });
}

/**
 * ## _addComponentToTsconfigPathMapping
 *
 * If in a typescript application, create a path mapping for the component
 * in the tsconfig.json file
 *
 * @param {object} generator object with build options
 */
function _addComponentToTsconfigPathMapping(generator) {
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
  // type can now be vcomponent or resource so need to cover
  // that case
  if (type !== undefined) {
    return type === constants.VCOMPONENT;
  }
  return vcomponent || utils.loadToolingUtil().isVDOMApplication();
}

/**
 * ## _isResourceComponent
 *
 * @param {object} generator object with build options
 * @returns {boolean}
 */
function _isResourceComponent(generator) {
  return generator.options.type === constants.RESOURCE_COMPONENT;
}

/**
 * ## _isMonoPack
 *
 * @param {object} options.generator
 * @param {object} options.pack
 * @returns {boolean}
 */
function _isMonoPack({ generator, pack }) {
  if (pack) {
    const packComponentJsonPath = path.join(
      _getPathToJETPack(generator, pack),
      constants.COMPONENT_JSON
    );
    const packComponentJson = fs.readJSONSync(packComponentJsonPath);
    return packComponentJson.type === constants.MONO_PACK;
  }
  return false;
}

/**
 * ## _withLoader
 *
 * @param {object} options.generator
 * @param {object} options.pack
 * @returns {boolean}
 */
function _withLoader({ generator, pack }) {
  if (generator.options.withLoader === false ||
     (_isMonoPack({ generator, pack }) && _isVComponent(generator))) {
    // Ensure that the withLoader attribute in options object is false.
    // This is because it can happen that the user creates the vcomponent
    // in a mono-pack, which should default to a loaderless component, whether
    // the withLoader flag is used or otherwise:
    if (generator.options.withLoader === undefined) {
      // eslint-disable-next-line no-param-reassign
      generator.options.withLoader = false;
    }
    return generator.options.withLoader;
  }
  return true;
}

/**
 * ## _filterTsxTemplates
 *
 * @param {object} generator object with build options
 * @param {object} destPath
 */
function _filterTsxTemplates(generator, destPath) {
  const componentName = _getComponentName(generator);
  const pathToClassBasedTemplate = path.join(destPath, `${componentName}.tsx`);
  const pathToFunctionalBasedTemplate = path.join(destPath, `${componentName}-functional-template.tsx`);
  if (generator.options.vcomponent === 'class') {
    // do nothing--file begins as class based with root name
  } else if (generator.options.vcomponent) {
    // do function/functional by default
    // <componentName>.tsx now has functional based template after overwriting it
    // with <componentName-functional>.tsx contents. We need to do this because,
    // once the chosen template is vcomponent, then we need to use the functional
    // based template and not the class based one in <componentName>.tsx . However,
    // the staging folder needs to have only one file: <componentName>.tsx. Hence,
    // the need to overwrite the file and delete <componentName-functional>.tsx after
    // overwriting.
    fs.renameSync(pathToFunctionalBasedTemplate, pathToClassBasedTemplate);
  }
  fs.removeSync(pathToFunctionalBasedTemplate);
}
