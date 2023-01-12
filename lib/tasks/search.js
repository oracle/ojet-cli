#! /usr/bin/env node
/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * ## Dependencies
 */
// Oracle
const config = require('../../config');
const utils = require('../util/utils');

/**
 * # Switch for 'search' task
 *
 * @public
 * @param {string} task
 * @param {string} scope
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (task, scope, parameters, options) {
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  switch (scope) {
    case config.tasks[task].scopes.exchange.name: {
      utils.ensureParameters(parameter);
      utils.ensureJetApp();

      const tooling = utils.loadTooling();
      return tooling.search(scope, parameter, options);
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      return Promise.reject();
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
      return Promise.reject();
  }
};
