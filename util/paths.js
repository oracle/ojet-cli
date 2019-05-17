/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const path = require('path');
const fs = require('fs-extra');
const constants = require('./constants');
const util = require('./index');

const _cachedPathsMap = {};
const _defaultPaths = _getDefaultPaths();

module.exports =
{
  getConfiguredPaths(appDir) {
    let resultPaths = _cachedPathsMap[appDir];
    if (!resultPaths) {
      resultPaths = _deriveConfiguredPaths(appDir);
      _cachedPathsMap[appDir] = resultPaths;
    }
    return resultPaths;
  },

  getDefaultPaths() {
    return _defaultPaths;
  }
};

function _deriveConfiguredPaths(appDir) {
  const configurePaths = {};
  const conf = _getPathsFromOraclejetConfig(appDir);
  Object.defineProperty(configurePaths, 'source', _getValueObj(conf.source.common, _defaultPaths.source));
  Object.defineProperty(configurePaths, 'sourceWeb', _getValueObj(conf.source.web, _defaultPaths.sourceWeb));
  Object.defineProperty(configurePaths, 'sourceHybrid', _getValueObj(conf.source.hybrid, _defaultPaths.sourceHybrid));
  Object.defineProperty(configurePaths, 'sourceJavascript', _getValueObj(conf.source.javascript, _defaultPaths.sourceJavascript));
  Object.defineProperty(configurePaths, 'sourceTests', _getValueObj(conf.source.tests, _defaultPaths.sourceTests));
  Object.defineProperty(configurePaths, 'sourceThemes', _getValueObj(conf.source.themes, _defaultPaths.sourceThemes));
  Object.defineProperty(configurePaths, 'stagingHybrid', _getValueObj(conf.staging.hybrid, _defaultPaths.stagingHybrid));
  Object.defineProperty(configurePaths, 'stagingWeb', _getValueObj(conf.staging.web, _defaultPaths.stagingWeb));
  Object.defineProperty(configurePaths, 'stagingThemes', _getValueObj(conf.staging.themes, _defaultPaths.stagingThemes));
  return configurePaths;
}

function _getDefaultPaths() {
  const defaultPaths = {};
  Object.defineProperty(defaultPaths, 'source', _getValueObj('src'));
  Object.defineProperty(defaultPaths, 'sourceWeb', _getValueObj('src-web'));
  Object.defineProperty(defaultPaths, 'sourceHybrid', _getValueObj('src-hybrid'));
  Object.defineProperty(defaultPaths, 'sourceJavascript', _getValueObj('js'));
  Object.defineProperty(defaultPaths, 'sourceTests', _getValueObj('tests'));
  Object.defineProperty(defaultPaths, 'sourceThemes', _getValueObj('themes'));
  Object.defineProperty(defaultPaths, 'stagingHybrid', _getValueObj('hybrid'));
  Object.defineProperty(defaultPaths, 'stagingWeb', _getValueObj('web'));
  Object.defineProperty(defaultPaths, 'stagingThemes', _getValueObj('themes'));
  return defaultPaths;
}

function _getValueObj(value, defaultValue) {
  return {
    value: _normPath(value) || defaultValue,
    enumerable: true
  };
}

function _normPath(rawValue) {
  return (rawValue) ? path.normalize(rawValue) : null;
}

function _getPathsFromOraclejetConfig(appDir) {
  const configJsonPath = path.resolve(appDir, constants.APP_CONFIG_JSON);
  const configJson = util.fsExistsSync(configJsonPath) ? fs.readJsonSync(configJsonPath) : null;
  return configJson.paths || {};
}
