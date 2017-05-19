#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Oracle utils
const config = require('../../config');
const utils = require('../utils');

// Oracle command libs
const app = require('../scopes/app');

/**
 * # Switch for 'restore' task
 *
 * @public
 * @param {string} [scope]
 * @param {string} [parameter]
 */
module.exports = function (scope, parameter) {
  const task = config.tasks.restore.name;

  switch (scope) {
    case undefined:
    case config.tasks.restore.scopes.app.name:
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
      } else {
        app.delegateToGenerator(task);
      }
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
