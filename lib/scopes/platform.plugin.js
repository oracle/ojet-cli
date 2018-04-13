#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const utils = require('../utils');
const CONSTANTS = require('../utils.constants');

/**
 * # Platform
 *
 * @public
 * @param {string} task
 * @param {string} scope
 * @param {string || Array} [param]
 * @param {Object} [options]
 */
module.exports = function (task, scope, param, options) {
  if (task !== 'list') _validatePlatform(scope, param);
  const execCommand = _constructExecCommand(task, scope, param, options);
  const successMessage = (task === 'add') ? 'Saved plugin' : undefined;

  utils.exec(execCommand, { cwd: `${process.cwd()}/hybrid` }, successMessage)
    .then(() => {
      utils.log.success('Command succeeded.');
    })
    .catch((err) => {
      utils.log.error(err);
    });
};

/**
 * ## _validatePlatform
 *
 * @private
 * @param {string} scope
 * @param {string || Array} [param]
 */
function _validatePlatform(scope, param) {
  if (scope === 'platform') {
    param.forEach((platform) => {
      if (CONSTANTS.SUPPORTED_PLATFORMS.indexOf(platform) < 0) utils.log.error(`Platform ${platform} not supported!`);
    });
  }
}

/**
 * ## _constructExecCommand
 *
 * @private
 * @param {string} task
 * @param {string} scope
 * @param {string || Array} [param]
 * @param {Object} [options]
 * @returns {string} execCommand
 */
function _constructExecCommand(task, scope, param, options) {
  let joinedParam = '';
  if (param && typeof param === 'object') {
    joinedParam = param.join(' ');
  }
  const opts = _serialiseOptionsToString(options);

  let execCommand = `cordova ${scope} ${task}`;
  execCommand = joinedParam ? `${execCommand} ${joinedParam}` : execCommand;
  execCommand = opts ? `${execCommand}${opts}` : execCommand;
  return execCommand;
}

/**
 * ## _serialiseOptionsToString
 *
 * @private
 * @param {Object} [options]
 * @returns {string}
 */
function _serialiseOptionsToString(options) {
  let string = '';
  if (!options || utils.isObjectEmpty(options)) {
    return string;
  }
  Object.keys(options).forEach((key) => {
    const transformedKey = key.length === 1 ? `-${key}` : `--${key}`;
    string += ` ${transformedKey} ${options[key]}`;
  });
  return string;
}
