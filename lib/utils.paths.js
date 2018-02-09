#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');
const path = require('path');

// Oracle
const CONSTANTS = require('./utils.constants');
const utils = require('./utils');

/**
 * # Paths
 *
 * @public
 */

const paths = module.exports;

/**
 * ## getConfiguredPaths
 *
 * @public
 * @param {string} appDir
 * @returns {Promise}
 */
paths.getConfiguredPaths = function (appDir) {
  const cachedPathsMap = {};
  let resultPaths = cachedPathsMap[appDir];
  if (!resultPaths) {
    resultPaths = _deriveConfiguredPaths(appDir);
    cachedPathsMap[appDir] = resultPaths;
  }
  return resultPaths;
};

/**
 * ## getDefaultPaths
 *
 * @public
 * @returns {Object} defaultPaths
 */
paths.getDefaultPaths = function () {
  const defaultPaths = {};
  Object.defineProperty(defaultPaths, 'source', _getValueObj('src'));
  Object.defineProperty(defaultPaths, 'sourceWeb', _getValueObj('src-web'));
  Object.defineProperty(defaultPaths, 'sourceHybrid', _getValueObj('src-hybrid'));
  Object.defineProperty(defaultPaths, 'sourceJavascript', _getValueObj('js'));
  Object.defineProperty(defaultPaths, 'sourceThemes', _getValueObj('themes'));
  Object.defineProperty(defaultPaths, 'stagingHybrid', _getValueObj('hybrid'));
  Object.defineProperty(defaultPaths, 'stagingWeb', _getValueObj('web'));
  Object.defineProperty(defaultPaths, 'stagingThemes', _getValueObj('themes'));
  return defaultPaths;
};

/**
 * ## _deriveConfiguredPaths
 *
 * @private
 * @param {string} appDir
 * @returns {Object} configurePaths
 */
function _deriveConfiguredPaths(appDir) {
  const defaultPaths = paths.getDefaultPaths();
  const configurePaths = {};
  const conf = _getPathsFromOraclejetConfig(appDir);
  Object.defineProperty(configurePaths, 'source', _getValueObj(conf.source.common, defaultPaths.source));
  Object.defineProperty(configurePaths, 'sourceWeb', _getValueObj(conf.source.web, defaultPaths.sourceWeb));
  Object.defineProperty(configurePaths, 'sourceHybrid', _getValueObj(conf.source.hybrid, defaultPaths.sourceHybrid));
  Object.defineProperty(configurePaths, 'sourceJavascript', _getValueObj(conf.source.javascript, defaultPaths.sourceJavascript));
  Object.defineProperty(configurePaths, 'sourceThemes', _getValueObj(conf.source.themes, defaultPaths.sourceThemes));
  Object.defineProperty(configurePaths, 'stagingHybrid', _getValueObj(conf.staging.hybrid, defaultPaths.stagingHybrid));
  Object.defineProperty(configurePaths, 'stagingWeb', _getValueObj(conf.staging.web, defaultPaths.stagingWeb));
  Object.defineProperty(configurePaths, 'stagingThemes', _getValueObj(conf.staging.themes, defaultPaths.stagingThemes));
  return configurePaths;
}

/**
 * ## _getValueObj
 *
 * @private
 * @param {string} value
 * @param {string} defaultValue
 * @returns {Object}
 */
function _getValueObj(value, defaultValue) {
  return {
    value: _normPath(value) || defaultValue,
    enumerable: true
  };
}

/**
 * ## _normPath
 *
 * @private
 * @param {string} rawValue
 * @returns {string || null}
 */
function _normPath(rawValue) {
  return (rawValue) ? path.normalize(rawValue) : null;
}

/**
 * ## _getPathsFromOraclejetConfig
 *
 * @private
 * @param {string} appDir
 * @returns {Object}
 */
function _getPathsFromOraclejetConfig(appDir) {
  const configJsonPath = path.resolve(appDir, CONSTANTS.APP_CONFIG_JSON);
  const configJson = fs.existsSync(configJsonPath) ?
    utils.readJsonAndReturnObject(configJsonPath) : {};
  return configJson.paths;
}
