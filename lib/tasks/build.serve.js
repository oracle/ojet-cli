#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const app = require('../scopes/app');
const config = require('../../config');
const utils = require('../utils');
const CONSTANTS = require('../utils.constants');

/**
 * # Switch for 'build' and 'serve' tasks
 *
 * @public
 * @param {string} task
 * @param {string} [scope]
 * @param {Array} [parameters]
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameters, options) {
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  switch (scope) {
    case config.tasks.build.scopes.app.name:
    case config.tasks.serve.scopes.app.name:
    case config.tasks.build.scopes.component.name:
      app.runTooling(task, scope, [], { component: parameters[0] });
      break;
    case undefined:
      utils.ensureJetApp();
      app.runTooling(task, scope, parameter, options);
      break;
    default:
      if (CONSTANTS.SUPPORTED_PLATFORMS.indexOf(scope) > -1) {
        app.runTooling(task, scope, parameter, options);
      } else {
        utils.log.error(`Invalid platform ${scope}`);
      }
  }
};
