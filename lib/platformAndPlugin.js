/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * ## Dependencies
 */
const utils = require('./utils');
const config = require('../config');

/**
 * # Platform
 *
 * @public
 * @param {string} scope
 * @param {string} task
 * @param {string} [hybridPlatform]
 */
module.exports = function (scope, task, hybridPlatform) {
  utils.ensureHybrid();

  const currentScope = config.scope[scope];
  const execCommand = _constructExecCommand(scope, task, hybridPlatform);

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

  switch (task) {
    case currentScope.tasks.list.key:
    case currentScope.tasks.add.key:
    case currentScope.tasks.remove.key: {
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
      break;
    }
    case undefined:
      throw utils.toError(utils.toMissingInputMessage(`${currentScope.key}`));
    default:
      throw utils.toError(utils.toNotSupportedMessage(`${currentScope.key} ${task}`));
  }
};

/**
 * ## constructExecCommand
 *
 * @private
 * @param {string} domain
 * @param {string} command
 * @param {string} [hybridPlatform]
 * @returns {string} execCommand
 */
function _constructExecCommand(domain, task, hybridPlatform) {
  let execCommand = `cordova ${domain === 'platform' ? `${domain}` : 'plugin'}`;
  execCommand = `${execCommand} ${task}`;
  execCommand = hybridPlatform ? `${execCommand} ${hybridPlatform}` : execCommand;
  return execCommand;
}
