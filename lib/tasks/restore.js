#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Oracle
const app = require('../scopes/app');
const config = require('../../config');
const utils = require('../utils');

/**
 * # Switch for 'restore' task
 *
 * @public
 * @param {string} task
 * @param {string} [scope]
 * @param {string} [parameter]
 */
module.exports = function (task, scope, parameter) {
  switch (scope) {
    case undefined:
    case config.tasks[task].scopes.app.name:
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
      } else {
        app.restore(task);
      }
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
