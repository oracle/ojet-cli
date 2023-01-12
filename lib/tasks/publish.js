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
const config = require('../../config');
const utils = require('../util/utils');

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
      if (!utils.hasProperty(options, 'path')) {
        utils.ensureParameters(parameter);
      }
      utils.ensureJetApp();
      return runTooling(scope, parameter, options);
    case config.tasks[task].scopes.pack.name: {
      utils.ensureParameters(parameter);
      utils.ensureJetApp();
      return runTooling(scope, parameter, options);
    }
    case undefined:
      if (utils.hasProperty(options, 'path')) {
        return runTooling(scope, parameter, options);
      }
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
  return false;
};

function runTooling(scope, parameter, options) {
  const tooling = utils.loadTooling();
  return tooling.publish(scope, parameter, options);
}
