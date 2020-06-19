/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const constants = require('../../util/constants');
const common = require('../../common');
const paths = require('../../util/paths');
const commonMessages = require('../../common/messages');

const DEFAULT_THEME = 'mytheme';
const JET_PCSS_SRC_PATH = 'node_modules/@oracle/oraclejet/dist/pcss/oj/';
const JET_VERSION_TOKEN = '<%= jetversion %>';
const THEMENAME_TOKEN = '<%= themename %>';
const COMPONENT_TOKEN = '<%= importcomponents %>';
const COMPONENT_ALL_TOKEN = '<%= importallcomponents %>';
const IMPORT_OJ_TAGS = '<%= importojnotags %>';
const ALL_COMP_RW_PATH = 'oj/all-components/themes/redwood';
const COMPONENT_LIST = {
  all: `${ALL_COMP_RW_PATH}/_oj-all-components.scss`,
  all_notag: `${ALL_COMP_RW_PATH}/_oj-all-components-notag.scss`,
  common: `${ALL_COMP_RW_PATH}/_oj-all-components-common.scss`
};

function _isvalidThemeName(themeName) {
  return !(/-!$%^&*()_+|~=`{}\[\]:";'<>?,.\//.test(themeName));
}

function _getSettingsFileByTech(tech) {
  return (tech === 'sass') ? '_oj.redwood.settings.scss' : 'oj.redwood.cssvars.settings.css';
}

function _setSettingsFileByTech(tech) {
  return (tech === 'sass') ? `_${DEFAULT_THEME}.${tech}.settings.scss` : `_${DEFAULT_THEME}.${tech}.settings.scss`;
}

function _getJETVersion() {
  let getPackageJson = path.resolve('./node_modules/@oracle/oraclejet/package.json');
  getPackageJson = fs.readJsonSync(getPackageJson);
  return getPackageJson.version;
}

function _getComponentsList() {
  const replaceCopyright = /^\/\/.+copyright.*/gmi;
  const srcNotagAllCompPath =
  path.join(JET_PCSS_SRC_PATH, `v${_getJETVersion()}`, COMPONENT_LIST.all_notag);
  const srcAllCompPath =
  path.join(JET_PCSS_SRC_PATH, `v${_getJETVersion()}`, COMPONENT_LIST.all);
  const srcCommonCompPath =
  path.join(JET_PCSS_SRC_PATH, `v${_getJETVersion()}`, COMPONENT_LIST.common);
  let notagCompContent = fs.readFileSync(srcNotagAllCompPath, 'utf-8');
  notagCompContent = notagCompContent.replace(replaceCopyright, '')
    .replace(/^.*components-common.*/gmi, '')
    .replace(/^/gmi, '//');
  let commonCompContent = fs.readFileSync(srcCommonCompPath, 'utf-8');
  commonCompContent = commonCompContent.replace(replaceCopyright, '');
  let allCompContent = fs.readFileSync(srcAllCompPath, 'utf-8');
  allCompContent = allCompContent.replace(replaceCopyright, '')
    .replace(/^.*components-common.*/gmi, commonCompContent)
    .replace(/^/gmi, '//');
  return {
    notagCompContent,
    allCompContent
  };
}

function _getReplaceValuePairsArray(tech) {
  if (tech === 'sass') {
    return [
      {
        findstr: new RegExp('@import\ \"\.\.\/utilities', 'g'), //eslint-disable-line
        replacewith: `@import "../../../../node_modules/@oracle/oraclejet/dist/pcss/oj/v${_getJETVersion()}/utilities`
      },
      {
        findstr: new RegExp('.*\\$themeName.*'),
        replacewith: `$themeName:           ${THEMENAME_TOKEN} !default;`
      },
      {
        findstr: new RegExp('.*\\$imageDir.*'),
        replacewith: `$imageDir: "../../../redwood/${JET_VERSION_TOKEN}/web/images/" !default;`
      },
      {
        findstr: new RegExp('.*\\$fontDir.*'),
        replacewith: `$fontDir:  "../../../redwood/${JET_VERSION_TOKEN}/web/fonts/" !default;`,
      },
      {
        findstr: new RegExp('.*\\$commonImageDir.*'),
        replacewith: `$commonImageDir:  "../../../redwood/${JET_VERSION_TOKEN}/common/images/" !default;`,
      }
    ];
  } else { return false; } //eslint-disable-line
}

function _injectDefaultValues(destPath, tech) {
  let destFileContent = fs.readFileSync(destPath, 'utf-8');
  const valueReplacePairs = _getReplaceValuePairsArray(tech);
  if (valueReplacePairs) {
    valueReplacePairs.forEach((valuePair) => {
      destFileContent = destFileContent.replace(valuePair.findstr, valuePair.replacewith);
    });
    fs.outputFileSync(destPath, destFileContent);
  }
}

function _copyCssSettingsFile(themeName, destPath, setTechnology) {
  const srcSettings = _getSettingsFileByTech(setTechnology);
  const srcPath =
  path.join(JET_PCSS_SRC_PATH, `v${_getJETVersion()}`, ALL_COMP_RW_PATH, srcSettings);
  const destSettingsFileName = _setSettingsFileByTech(setTechnology);
  const destSettingsPath = path.join(destPath, constants.DEFAULT_PCSS_THEME, destSettingsFileName);
  fs.copySync(srcPath, destSettingsPath);
  _injectDefaultValues(destSettingsPath, setTechnology);
}

function _isSassCssFile(file) {
  return (/scss/.test(path.extname(file)) || /css/.test(path.extname(file)));
}

function _renameFile(themeName, fileDir, cssScssFile) {
  const oldPath = path.join(fileDir, cssScssFile);
  let newPath = cssScssFile.replace(DEFAULT_THEME, themeName);
  newPath = path.join(fileDir, newPath);
  fs.renameSync(oldPath, newPath);
  return newPath;
}

function _replaceTokens(destPath, themeName) {
  let fileContent = fs.readFileSync(destPath, 'utf-8');
  const jetVersion = _getJETVersion();
  fileContent = fileContent.replace(new RegExp(JET_VERSION_TOKEN, 'g'), jetVersion);
  fileContent = fileContent.replace(new RegExp(THEMENAME_TOKEN, 'g'), themeName);
  fs.outputFileSync(destPath, fileContent);
}

function _renameFilesTokens(themeName, themePath) {
  const fileDir = path.join(themePath, constants.DEFAULT_PCSS_THEME);
  const fileList = fs.readdirSync(fileDir);
  const cssScssFiles = fileList.filter(_isSassCssFile);
  cssScssFiles.forEach((cssScssFile) => {
    const newPath = _renameFile(themeName, fileDir, cssScssFile);
    _replaceTokens(newPath, themeName);
  });
}

function _loadComponentRefrence(themeName, themeDest) {
  // Imports all components url from pcss in node_modules
  const destPath = path.join(themeDest, constants.DEFAULT_PCSS_THEME, `${themeName}.scss`);
  let destFileContent = fs.readFileSync(destPath, 'utf-8');
  destFileContent = destFileContent.replace(new RegExp(COMPONENT_TOKEN, 'g'), COMPONENT_LIST.all);
  fs.outputFileSync(destPath, destFileContent);

  // write entire components list imports in _themename.components.scss
  const { notagCompContent, allCompContent } = _getComponentsList();
  const allCompDestPath = path.join(themeDest, constants.DEFAULT_PCSS_THEME, `_${themeName}.components.scss`);
  let destAllCompContent = fs.readFileSync(allCompDestPath, 'utf-8');
  destAllCompContent = destAllCompContent.replace(new RegExp(IMPORT_OJ_TAGS, 'g'), notagCompContent);
  destAllCompContent = destAllCompContent.replace(new RegExp(COMPONENT_ALL_TOKEN, 'g'), allCompContent);
  fs.outputFileSync(allCompDestPath, destAllCompContent);
}

function _addPcssTheme(addTheme) {
  const themeName = addTheme.themeName;
  const _configpaths = paths.getConfiguredPaths(path.resolve('.'));
  const srcPath = _configpaths.source;
  const srcThemes = _configpaths.sourceThemes;
  // Desination path of created theme folder
  const themeDestPath = path.resolve(srcPath, srcThemes, themeName);
  // Path of generator template folder
  const source = path.resolve(__dirname, 'templates', DEFAULT_THEME);
  // Create templates and default theme folder from generator template
  fs.ensureDirSync(themeDestPath);
  return new Promise((resolve, reject) => {
    try {
      // Copy pcss theme template to project folder under src
      fs.copySync(source, themeDestPath);
      // Copy sass settings file
      _copyCssSettingsFile(themeName, themeDestPath, 'sass');
      // Copy css vars settings file
      _copyCssSettingsFile(themeName, themeDestPath, 'cssvars');
      // rename copied template files with created theme name
      _renameFilesTokens(themeName, themeDestPath, 'sass');
      // load component refrence data dynamically from source
      _loadComponentRefrence(themeName, themeDestPath);
      resolve(addTheme);
    } catch (err) {
      reject();
    }
  });
}

/**
 * # Entry point for 'add pcss theme' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 * @param {utils} utility module
 */
module.exports = function (parameters, opt, utils) {
  const pcssTheme = {
    themeName: parameters,
    arguments: [parameters],
    options: Object.assign({ namespace: 'add-pcss-theme' }, opt)
  };
  if (pcssTheme.themeName === constants.DEFAULT_PCSS_NAME ||
    pcssTheme.themeName === constants.DEFAULT_THEME) {
    utils.log.error(`Theme ${pcssTheme.themeName} is reserved.`);
  }
  if (!_isvalidThemeName(pcssTheme.themeName)) {
    utils.log.error(`Special characters invalid in theme name ${pcssTheme.themeName}.`);
  }
  common.validateArgs(pcssTheme)
  .then(common.validateFlags)
  .then(_addPcssTheme(pcssTheme))
  .then(() => {
    utils.log.success(commonMessages.appendJETPrefix(`${pcssTheme.themeName} theme added, with css variables support.`));
  })
  .catch((error) => {
    utils.log(error);
  });
};
