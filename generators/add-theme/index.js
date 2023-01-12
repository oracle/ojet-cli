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

const PLATFORM_TOKEN = '<%= platform %>';
const JET_VERSION_TOKEN = '<%= jetversion %>';
const THEMENAME_TOKEN = '<%= themename %>';

/**
 * # Entry point for 'add theme' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (parameters, opt) {
  const addTheme = {
    themeName: parameters,
    arguments: [parameters],
    options: Object.assign({ namespace: 'add-theme' }, opt)
  };
  if (addTheme.themeName === constants.DEFAULT_THEME ||
    addTheme.themeName === constants.DEFAULT_PCSS_NAME) {
    utils.log.error(`Theme ${addTheme.themeName} is reserved.`);
  }

  if (!_isValidThemeName(addTheme.themeName)) {
    utils.log.error(`Special characters invalid in theme name ${addTheme.themeName}.`);
  }

  return common.validateArgs(addTheme)
    .then(common.validateFlags)
    .then(_addSassTheme(addTheme))
    .then(() => {
      utils.log.success(commonMessages.appendJETPrefix(`${addTheme.themeName} theme added.`));
    })
    .catch((error) => {
      utils.log(error);
      return Promise.reject();
    });
};

function _addSassTheme(addTheme) {
  const themeName = addTheme.themeName;
  const _configPaths = paths.getConfiguredPaths(path.resolve('.'));
  const srcPath = _configPaths.source;
  const srcThemes = _configPaths.sourceThemes;
  const themeDestPath = path.resolve(srcPath, srcThemes, themeName);
  fs.ensureDirSync(themeDestPath);

  const source = path.resolve(__dirname, 'templates', DEFAULT_THEME);

  try {
    // first copy over templates
    fs.copySync(source, themeDestPath);
    _copySettingsFilesFromJETSrc(themeName, themeDestPath);
    _renameFilesAllPlatforms(themeName, themeDestPath);
    return Promise.resolve(addTheme);
  } catch (err) {
    utils.log.error(err);
    return Promise.reject();
  }
}

function _renameFilesAllPlatforms(themeName, dest) {
  const platforms = _getAllSupportedPlatforms();

  platforms.forEach((platform) => {
    _renameFileOnePlatform(themeName, dest, platform);
  });
}

function _getAllSupportedPlatforms() {
  return constants.SUPPORTED_PLATFORMS;
}

function _renameFileOnePlatform(themeName, dest, platform) {
  const fileDir = path.join(dest, platform);
  const fileList = fs.readdirSync(fileDir);
  const scssFiles = fileList.filter(_isScssFile);

  scssFiles.forEach((file) => {
    const newPath = _renameFile(themeName, fileDir, file);
    _replaceTokens(newPath, themeName, platform);
  });
}

// replace mytheme.css to the actual themeName.css
function _renameFile(themeName, fileDir, file) {
  const oldPath = path.join(fileDir, file);
  let newPath = file.replace(DEFAULT_THEME, themeName);
  newPath = path.join(fileDir, newPath);
  fs.renameSync(oldPath, newPath);
  return newPath;
}

function _isScssFile(file) {
  return /scss/.test(path.extname(file));
}

function _isValidThemeName(string) {
  return !(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(string)); //eslint-disable-line
}

function _getJetVersion() {
  const toolingUtil = utils.loadToolingUtil();
  return toolingUtil.getJETVersionV(toolingUtil.getJETVersion());
}

// default marker <%= jetversion %> <%= themename %> <%= platform %>
// are used to inject jet version and themename
function _replaceTokens(filePath, themeName, platform) {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  const jetVersion = _getJetVersion();
  fileContent = fileContent.replace(new RegExp(JET_VERSION_TOKEN, 'g'), jetVersion);
  fileContent = fileContent.replace(new RegExp(THEMENAME_TOKEN, 'g'), themeName);
  fileContent = fileContent.replace(new RegExp(PLATFORM_TOKEN, 'g'), platform);
  fs.outputFileSync(filePath, fileContent);
}

function _copySettingsFilesFromJETSrc(themeName, dest) {
  const settingsFileName = `_oj.alta.${PLATFORM_TOKEN}settings.scss`;

  constants.SUPPORTED_PLATFORMS.forEach((platform) => {
    const platformPath = _getPlatformPath(platform);
    const srcSettingFileName = _getSrcSettingFileName(platform);
    const JET_SCSS_SRC_PATH = path.join(utils.loadToolingUtil().getOraclejetPath(), 'dist', 'scss');

    const srcPath = path.join(JET_SCSS_SRC_PATH, platformPath, srcSettingFileName);

    const destSettingFileName = _getDestSettingFileName(DEFAULT_THEME, platform);
    const destPath = path.join(dest, platform, destSettingFileName);

    fs.copySync(srcPath, destPath);
    _injectDefaultValues(destPath);
  });

  function _getDestSettingFileName(name, platform) {
    return `_${name}.${platform}.settings.scss`;
  }

  function _getSrcSettingFileName(platform) {
    const platformName = (platform === 'web') ? '' : `${platform}.`;
    return settingsFileName.replace(PLATFORM_TOKEN, platformName);
  }

  function _getPlatformPath(platform) {
    return (platform === 'web') ? 'alta' : `alta-${platform}`;
  }

  function _injectDefaultValues(filePath) {
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    const valuePairs = _getValuePairsArray();
    valuePairs.forEach((valuePair) => {
      fileContent = fileContent.replace(valuePair.str, valuePair.newStr);
    });
    fs.outputFileSync(filePath, fileContent);
  }

  function _getValuePairsArray() {
    return [
      {
        str: new RegExp('@import\ \"\.\.\/utilities', 'g'), //eslint-disable-line
        newStr: '@import "../../../../node_modules/@oracle/oraclejet/dist/scss/utilities',
      },
      {
        str: new RegExp('.*\\$themeName.*'),
        newStr: `$themeName:           ${THEMENAME_TOKEN} !default;`,
      },
      {
        str: new RegExp('.*\\$imageDir.*'),
        newStr: `$imageDir: "../../../alta/${JET_VERSION_TOKEN}/${PLATFORM_TOKEN}/images/" !default;`,
      },
      {
        str: new RegExp('.*\\$fontDir.*'),
        newStr: `$fontDir:  "../../../alta/${JET_VERSION_TOKEN}/${PLATFORM_TOKEN}/fonts/" !default;`,
      },
      {
        str: new RegExp('.*\\$commonImageDir.*'),
        newStr: `$commonImageDir:  "../../../alta/${JET_VERSION_TOKEN}/common/images/" !default;`,
      },
    ];
  }
}

