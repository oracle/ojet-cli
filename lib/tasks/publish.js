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
 * # Switch for 'publish' task
 *
 * @public
 * @param {string} task
 * @param {string} scope
 * @param {Array} parameters
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameters, options) {
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];

  switch (scope) {
    case config.tasks[task].scopes.component.name:
    case config.tasks[task].scopes.pack.name: {
      utils.ensureParameters(parameter);
      utils.ensureJetApp();
      utils.ensureExchangeUrl();

      const tooling = utils.loadTooling();
      tooling.publish(scope, parameter, options);
      break;
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
