#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const utils = require('../utils');

/**
 * # Platform
 *
 * @public
 * @param {string} task
 * @param {string} scope
 * @param {Array || null} [parameters]
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameters, options) {
  utils.ensureHybrid();

  const execCommand = _constructExecCommand(task, scope, parameters, options);

  /**
   * ## _execute
   * Can not exist out of main module scope as private method as it is executed
   * from the Promise chain we do not want to pollute with arguments or nasty bindings
   *
   * @private
   * @returns {Promise}
   */
  function _execute() {
    return utils.exec(execCommand);
  }

  utils.cdToCordovaDirectory()
    .then(_execute)
    .then(utils.cdFromCordovaDirectory)
    .catch((error) => {
      // Can not throw in promise catch handler
      // http://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler
      setTimeout(() => {
        throw utils.toError(error);
      }, 0);
    });
};

/**
 * ## _constructExecCommand
 *
 * @private
 * @param {string} task
 * @param {string} scope
 * @param {Array} [parameters]
 * @param {Object} [options]
 * @returns {string} execCommand
 */
function _constructExecCommand(task, scope, parameters, options) {
  let params = '';
  if (parameters) {
    params = parameters.join(' ');
  }
  const opts = _serialiseOptionsToString(options);

  let execCommand = `cordova ${scope} ${task}`;
  execCommand = params ? `${execCommand} ${params}` : execCommand;
  execCommand = opts ? `${execCommand} ${opts}` : execCommand;
  return execCommand;
}

/**
 * ## _serialiseOptionsToString
 *
 * @private
 * @param {Object} [options]
 * @returns {string}
 */
function _serialiseOptionsToString(object) {
  let string = '';
  if (!object || utils.isObjectEmpty(object)) {
    return string;
  }
  let loop = 1;
  const objSize = Object.keys(object).length;
  for (let key in object) { //eslint-disable-line
    const transformedKey = key.length === 1 ? `-${key}` : `--${key}`;
    string += `${transformedKey} ${object[key]}`;
    // Adding gap if not the last loop
    if (loop < objSize) {
      string += ' ';
    }
    loop += 1;
  }
  return string;
}
