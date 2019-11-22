#! /usr/bin/env node
/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
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
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameters, options) {
  switch (scope) {
    case undefined:
    case config.tasks[task].scopes.app.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      app.restore(options);
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
