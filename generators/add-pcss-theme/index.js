/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const constants = require('../../lib/util/constants');
const common = require('../../common');
const paths = require('../../lib/util/paths');
const utils = require('../../lib/util/utils');
const commonMessages = require('../../common/messages');

const DEFAULT_THEME = 'mytheme';
const JET_VERSION_TOKEN = '<%= jetversion %>';
const THEMENAME_TOKEN = '<%= themename %>';
const COMPONENT_TOKEN = '<%= importcomponents %>';
const COMPONENT_ALL_TOKEN = '<%= importallcomponents %>';
const IMPORT_OJ_TAGS = '<%= importojnotags %>';
const ALL_COMP_RW_PATH = 'oj/all-components/themes/';
const COMPONENT_LIST = {
  all: '/_oj-all-components.scss',
  all_notag: '/_oj-all-components-notag.scss',
  common: '/_oj-all-components-common.scss'
};

function _isvalidThemeName(themeName) {
  return !(/-!$%^&*()_+|~=`{}\[\]:";'<>?,.\//.test(themeName));
}

function _getSettingsFileByTech(basetheme, tech) {
  return (tech === 'sass') ? `_oj.${basetheme}.settings.scss` : `oj.${basetheme}.cssvars.settings.css`;
}

function _setSettingsFileByTech(tech) {
  return (tech === 'sass') ? `_${DEFAULT_THEME}.${tech}.settings.scss` : `_${DEFAULT_THEME}.${tech}.settings.scss`;
}

function _getJETVersion() {
  const toolingUtil = utils.loadToolingUtil();
  return toolingUtil.getJETVersionV(toolingUtil.getJETVersion());
}

function _getComponentsList(baseName) {
  const replaceCopyright = /^\/\/.+copyright.*/gmi;
  const componentNotag = ALL_COMP_RW_PATH + baseName + COMPONENT_LIST.all_notag;
  const componentAll = ALL_COMP_RW_PATH + baseName + COMPONENT_LIST.all;
  const componentCommon = ALL_COMP_RW_PATH + baseName + COMPONENT_LIST.common;

  const JET_PCSS_SRC_PATH = path.join(utils.loadToolingUtil().getOraclejetPath(), 'dist', 'pcss', 'oj');

  const srcAllCompPath =
  path.join(JET_PCSS_SRC_PATH, _getJETVersion(), componentAll);
  const srcCommonCompPath =
  path.join(JET_PCSS_SRC_PATH, _getJETVersion(), componentCommon);
  const srcNotagAllCompPath =
  path.join(JET_PCSS_SRC_PATH, _getJETVersion(), componentNotag);

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

function _getReplaceValuePairsArray(basetheme, tech) {
  if (tech === 'sass') {
    return [
      {
        findstr: new RegExp('@import\ \"\.\.\/utilities', 'g'), //eslint-disable-line
        replacewith: `@import "../../../../node_modules/@oracle/oraclejet/dist/pcss/oj/${_getJETVersion()}/utilities`
      },
      {
        findstr: new RegExp('.*\\$themeName.*'),
        replacewith: `$themeName:           ${THEMENAME_TOKEN} !default;`
      },
      {
        findstr: new RegExp('.*\\$imageDir.*'),
        replacewith: `$imageDir: "../../../${basetheme}/${JET_VERSION_TOKEN}/web/images/" !default;`
      },
      {
        findstr: new RegExp('.*\\$fontDir.*'),
        replacewith: `$fontDir:  "../../../${basetheme}/${JET_VERSION_TOKEN}/web/fonts/" !default;`,
      }
    ];
  } else { return false; } //eslint-disable-line
}

function _injectDefaultValues(basetheme, destPath, tech) {
  let destFileContent = fs.readFileSync(destPath, 'utf-8');
  const valueReplacePairs = _getReplaceValuePairsArray(basetheme, tech);
  if (valueReplacePairs) {
    valueReplacePairs.forEach((valuePair) => {
      destFileContent = destFileContent.replace(valuePair.findstr, valuePair.replacewith);
    });
    fs.outputFileSync(destPath, destFileContent);
  }
}

function _copyCssSettingsFile(addTheme, destPath, setTechnology) {
  const whichTheme = addTheme.themeOptionValue;
  const srcSettings = _getSettingsFileByTech(whichTheme, setTechnology);
  const JET_PCSS_SRC_PATH = path.join(utils.loadToolingUtil().getOraclejetPath(), 'dist', 'pcss', 'oj');
  const srcPath =
  path.join(JET_PCSS_SRC_PATH, _getJETVersion(), ALL_COMP_RW_PATH, whichTheme, srcSettings);
  const destSettingsFileName = _setSettingsFileByTech(setTechnology);
  const destSettingsPath = path.join(destPath, constants.DEFAULT_PCSS_THEME, destSettingsFileName);
  fs.copySync(srcPath, destSettingsPath);
  _injectDefaultValues(whichTheme, destSettingsPath, setTechnology);
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

function _isThemeExist(themePath) {
  const isExist = fs.existsSync(themePath);
  return isExist;
}

function _loadComponentRefrence(addTheme, themeDest) {
  const themeName = addTheme.themeName;
  const baseName = addTheme.themeOptionValue;
  // Imports all components url from pcss in node_modules
  const destPath = path.join(themeDest, constants.DEFAULT_PCSS_THEME, `${themeName}.scss`);
  let destFileContent = fs.readFileSync(destPath, 'utf-8');
  const componentAllPath = ALL_COMP_RW_PATH + baseName + COMPONENT_LIST.all;
  destFileContent = destFileContent.replace(new RegExp(COMPONENT_TOKEN, 'g'), componentAllPath);
  fs.outputFileSync(destPath, destFileContent);

  // write entire components list imports in _themename.components.scss
  const { notagCompContent, allCompContent } = _getComponentsList(baseName);
  const allCompDestPath = path.join(themeDest, constants.DEFAULT_PCSS_THEME, `_${themeName}.optimize-components.scss`);
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

  try {
    // Copy pcss theme template to project folder under src
    fs.copySync(source, themeDestPath);
    // Copy sass settings file
    _copyCssSettingsFile(addTheme, themeDestPath, 'sass');
    // Copy css vars settings file
    _copyCssSettingsFile(addTheme, themeDestPath, 'cssvars');
    // rename copied template files with created theme name
    _renameFilesTokens(themeName, themeDestPath, 'sass');
    // load component refrence data dynamically from source
    _loadComponentRefrence(addTheme, themeDestPath);
    return Promise.resolve(addTheme);
  } catch (err) {
    utils.log.error(err);
    return Promise.reject();
  }
}

function _updateBaseTheme(themeAdded) {
  const themeName = themeAdded.themeName;
  const _configpaths = paths.getConfiguredPaths(path.resolve('.'));
  const srcPath = _configpaths.source;
  const srcThemes = _configpaths.sourceThemes;
  // Desination path of created theme folder
  const themeDestPath = path.resolve(srcPath, srcThemes, themeName);
  const themeConfigPath = path.join(themeDestPath, 'theme.json');

  try {
    utils.log(`'Adding basetheme: ${themeAdded.themeOptionValue} to ${themeConfigPath}'.`);
    const themeConfigJson = utils.readJsonAndReturnObject(themeConfigPath);
    themeConfigJson.basetheme = themeAdded.themeOptionValue;
    fs.writeFileSync(themeConfigPath, JSON.stringify(themeConfigJson, null, 2));
    return Promise.resolve(themeAdded);
  } catch (err) {
    utils.log.error(err);
    return Promise.reject();
  }
}

/**
 * # Entry point for 'add pcss theme' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (parameters, opt) {
  const pcssTheme = {
    themeOption: Object.prototype.hasOwnProperty.call(opt, constants.PCSS_THEME_FLAG),
    themeOptionValue: opt[constants.PCSS_THEME_FLAG],
    themeName: parameters,
    arguments: [parameters],
    options: Object.assign({ namespace: 'add-pcss-theme' }, opt)
  };

  const baseValues = [constants.PCSS_STABLE_FLAG, constants.DEFAULT_PCSS_NAME];

  if (!pcssTheme.themeOption || baseValues.indexOf(pcssTheme.themeOptionValue) === -1) {
    utils.log.error('The flag --basetheme is required. It supports values for two themes, redwood and stable. For example, "ojet create theme myCustomTheme --basetheme=stable"\n\nredwood: Redwood is the theme for Oracle applications. Oracle will make future changes to this theme that can affect custom themes that use it as the base theme.\n\nstable: Use the Stable theme as the base theme for your custom theme if you want to minimize the possibility that your custom theme will be affected by future changes to the base theme.\n');
  }

  if (pcssTheme.themeName === constants.DEFAULT_PCSS_NAME ||
    pcssTheme.themeName === constants.DEFAULT_THEME) {
    utils.log.error(`Theme ${pcssTheme.themeName} is reserved.`);
  }

  if (!_isvalidThemeName(pcssTheme.themeName)) {
    utils.log.error(`Special characters invalid in theme name ${pcssTheme.themeName}.`);
  }

  const srcThemePath = path.resolve(path.resolve('./'),
    paths.getDefaultPaths().source, paths.getDefaultPaths().sourceThemes, pcssTheme.themeName);

  if (_isThemeExist(srcThemePath)) {
    utils.log.error(`Theme name ${pcssTheme.themeName} already exists, please use different name.`);
  }

  return common.validateArgs(pcssTheme)
    .then(common.validateFlags)
    .then(_addPcssTheme(pcssTheme))
    .then(_updateBaseTheme(pcssTheme))
    .then(() => {
      utils.log.success(commonMessages.appendJETPrefix(`${pcssTheme.themeName} theme added, with css variables support.`));
    })
    .catch((error) => {
      utils.log(error);
      return Promise.reject();
    });
};
