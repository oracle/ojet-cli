#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const config = require('../../config');
const utils = require('../utils');

/**
 * # Switch for 'configure' task
 *
 * @public
 * @param {string} task
 * @param {Array} [parameters] - Passed in just to show warning if present
 * @param {string} scope
 */
module.exports = function (task, scope, parameters, options) {
  utils.validateParametersCount(parameters, 0);
  switch (scope) {
    case config.tasks[task].scopes.app.name:
    case undefined:
      utils.ensureJetApp();
      if (options && utils.hasProperty(options, config.exchangeUrlParam)) {
        const tooling = utils.loadTooling();
        tooling.configure('exchange', options);
      } else {
        utils.log.error(`Please check 'ojet help ${task}' and provide valid configuration options.`);
      }
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
