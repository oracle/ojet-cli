/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const constants = require('../lib/util/constants');
const commonMessages = require('../common/messages');
const DOMParser = require('@xmldom/xmldom').DOMParser;
const endOfLine = require('os').EOL;
const graphics = require('./graphics');
const paths = require('../lib/util/paths');
const utils = require('../lib/util/utils');

const ORACLEJET_APP_ID = 'org.oraclejet.';
const iOSPlugins = ['cordova-plugin-wkwebview-file-xhr',
  'cordova-plugin-wkwebview-engine'];

const CORDOVA_HOOKS =
  [
    {
      type: 'after_prepare', src: 'scripts/hooks/jetAfterPrepare.js'
    }
  ];


module.exports =
{
  setupHybridEnv: function _setupHybridEnv(generatorArg) {
    // platforms that will be added by cordova API.
    // note if this.options.platforms is not provided
    // it will test out the platform candidates during the prompting
    // lifecycle; otherwise it will parse the provided
    // platforms options and filter to those that are capable
    // on the user's machine
    const generator = generatorArg;
    generator._platformsToInstall = [];

    // prefer appname but support appName
    const appname = generator.options.appname ?
      generator.options.appname : generator.options.appName;
    if (!appname) {
      generator.options.appname = _getAppBaseName(generator.appDir);
    } else {
      generator.options.appname = appname;
    }

    // prefer appid but support appId
    const appid = generator.options.appid ? generator.options.appid : generator.options.appId;
    if (!appid) {
      generator.options.appid = _getDefaultAppId(generator.appDir);
    } else {
      generator.options.appid = appid;
    }
  },

  removeExtraCordovaFiles: function _removeExtraCordovaFiles() {
    const cordovaDir = _getHybridPath();
    try {
      fs.removeSync(path.resolve(cordovaDir, 'hooks'));
      fs.removeSync(path.resolve(cordovaDir, 'www/*'));
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(commonMessages.error(err, 'removeExtraCordovaFiles'));
    }
  },

  copyResources: function _copyResources() {
    const source = path.resolve(__dirname, '../generators/hybrid/templates/common/res');
    const dest = _getHybridPath('res/');
    fs.emptyDirSync(dest);
    return new Promise((resolve, reject) => {
      fs.copy(source, dest, { overwrite: false }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },

  updateConfigXml: function _updateConfigXml(generator) {
    const cordovaDir = _getHybridPath();
    const configXml = path.resolve(`${cordovaDir}/${constants.CORDOVA_CONFIG_XML}`);

    try {
      const configRead = fs.readFileSync(configXml, 'utf-8');
      const document = new DOMParser().parseFromString(configRead, 'text/xml');
      _addCordovaConfigDescription(document);
      _addCordovaConfigHooks(document);
      if (generator._platformsToInstall && generator._platformsToInstall.indexOf('ios') !== -1) {
        _addIosPlugins(document);
      }
      _addIosOrientationPreference(document);
      _addIosOverscrollPreference(document);
      _addAndroidOverscrollPreference(document);
      _addWindowsPreferences(document);
      _addIcons(document);
      _addSplash(document);
      fs.writeFileSync(configXml, document.toString());
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(commonMessages.error(err, 'updateConfigXml'));
    }
  },

  copyHooks() {
    const toolingSource = utils.getToolingPath();

    return new Promise((resolve, reject) => {
      if (toolingSource === null) {
        reject('Missing folder \'@oracle/oraclejet-tooling/hooks/\'.');
      }
      const source = path.join(toolingSource, 'hooks');
      const dest = _getHybridPath('scripts/hooks/');
      fs.copy(source, dest, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
};

function _getDefaultAppId(appDirArg) {
  const appDir = _getAppBaseName(appDirArg);

  // strip non-word chars
  let appId = appDir.replace(/\W/g, '');

  // make sure the id does not start with a digit or underscore
  if (/^[\d_]+/.test(appId)) {
    appId = `oj${appId}`;
  }

  return ORACLEJET_APP_ID + appId.toLowerCase();
}


function _getAppBaseName(appDir) {
  return path.basename(path.resolve(appDir));
}


function _addCordovaConfigDescription(document) {
  const widget = _getFirstElementByTagName(document, 'widget');
  const packageJSON = fs.readJSONSync(path.resolve('package.json'));
  _updateCordovaConfigDescription(widget, packageJSON);
}

function _updateCordovaConfigDescription(widget, packageJSON) {
  const description = packageJSON.description;
  const descriptionElement = _getFirstElementByTagName(widget, 'description');
  descriptionElement.childNodes[0].data = `\n        ${description}\n    `;
}

function _addCordovaConfigHooks(document) {
  const widget = _getFirstElementByTagName(document, 'widget');

  CORDOVA_HOOKS.forEach((value) => {
    widget.appendChild(_createHookElement(document, value));
    widget.appendChild(_createNewLineElement(document));
  });
}

function _addIosOrientationPreference(document) {
  _addPlatformElement(document, 'ios', 'preference', 'Orientation', 'all');
}

function _addIosOverscrollPreference(document) {
  _addPlatformElement(document, 'ios', 'preference', 'DisallowOverscroll', 'true');
}

function _addIosPlugins(document) {
  iOSPlugins.forEach((plugin) => {
    _addPluginElement(document, plugin);
  });
}

function _addPluginElement(document, pluginName) {
  const widget = _getFirstElementByTagName(document, 'widget');
  const elementNode = document.createElement('plugin');
  elementNode.setAttribute('name', pluginName);
  widget.appendChild(elementNode);
  widget.appendChild(_createNewLineElement(document));
}


function _addAndroidOverscrollPreference(document) {
  _addPlatformElement(document, 'android', 'preference', 'DisallowOverscroll', 'true');
}

function _addPlatformElement(document, platform, element, attribute, value) {
  const platforms = document.getElementsByTagName('platform');

  for (let i = 0; i < platforms.length; i += 1) {
    if (platforms[i].getAttribute('name') === platform) {
      const elementNode = document.createElement(element);
      elementNode.setAttribute('name', attribute);
      elementNode.setAttribute('value', value);

      platforms[i].appendChild(elementNode);
      break;
    }
  }
}

function _addIcons(document) {
  const platforms = document.getElementsByTagName('platform');

  for (let i = 0; i < platforms.length; i += 1) {
    const platform = platforms[i].getAttribute('name');
    const platformIcons = graphics.ICONS[platform];
    for (let j = 0; j < platformIcons.length; j += 1) {
      const icon = document.createElement('icon');
      icon.setAttribute('src', path.posix.join(graphics.PATH, 'icon', platform, platformIcons[j].file));
      icon.setAttribute('width', platformIcons[j].width);
      icon.setAttribute('height', platformIcons[j].height);
      platforms[i].appendChild(icon);
    }
  }
}

function _addSplash(document) {
  const platforms = document.getElementsByTagName('platform');

  for (let i = 0; i < platforms.length; i += 1) {
    const platform = platforms[i].getAttribute('name');
    const platformSplash = graphics.SPLASH[platform];
    for (let j = 0; j < platformSplash.length; j += 1) {
      const splash = document.createElement('splash');
      Object.keys(platformSplash[j]).forEach((prop) => {
        if (prop === 'src') {
          splash.setAttribute(prop, path.posix.join(graphics.PATH, 'screen', platform, platformSplash[j].src));
        } else {
          splash.setAttribute(prop, platformSplash[j][prop]);
        }
      });
      platforms[i].appendChild(splash);
    }
  }
}

function _addWindowsPreferences(document) {
  const windowsPlatformElem = _getWindowsPreferencesSection(document);
  const preference = document.createElement('preference');
  preference.setAttribute('name', 'windows-target-version');
  preference.setAttribute('value', '10.0');
  windowsPlatformElem.appendChild(preference);
  const preference2 = document.createElement('preference');
  preference2.setAttribute('name', 'SplashScreenDelay');
  preference2.setAttribute('value', '0');
  windowsPlatformElem.appendChild(preference2);
  const preference3 = document.createElement('preference');
  preference3.setAttribute('name', 'SplashScreenBackgroundColor');
  preference3.setAttribute('value', '');
  windowsPlatformElem.appendChild(preference3);
}

function _getWindowsPreferencesSection(document) {
  const platforms = document.getElementsByTagName('platform');

  for (let i = 0; i < platforms.length; i += 1) {
    if (platforms[i].getAttribute('name') === 'windows') {
      return platforms[i];
    }
  }
  const windowsPlatformElem = document.createElement('platform');
  windowsPlatformElem.setAttribute('name', 'windows');
  platforms[0].parentNode.insertBefore(windowsPlatformElem, platforms[0]);
  return windowsPlatformElem;
}

function _createHookElement(document, value) {
  const hook = document.createElement('hook');
  hook.setAttribute('type', value.type);
  hook.setAttribute('src', value.src);

  return hook;
}

function _createNewLineElement(document) {
  return document.createTextNode(endOfLine);
}

function _getFirstElementByTagName(node, tag) {
  return node.getElementsByTagName(tag)[0];
}

function _getHybridPath(subDir) {
  const appDir = path.resolve('.');
  const hybridRoot = paths.getConfiguredPaths(appDir).stagingHybrid;
  return (subDir) ? path.join(hybridRoot, subDir) : hybridRoot;
}
