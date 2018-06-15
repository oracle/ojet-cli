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
 * @param {Array} [parameters] - Passed in just to show warning if present
 */
module.exports = function (task, scope, parameters) {
  switch (scope) {
    case undefined:
    case config.tasks[task].scopes.app.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      app.restore(task);
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
