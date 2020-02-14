/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * ## Dependencies
 */
const app = require('../scopes/app');
const config = require('../../config');
const utils = require('../utils');

/**
 * # Switch for 'create' task
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters]
 * @param {Object} [options]
 */
module.exports = function (scope, parameters, options) {
  const scopes = config.tasks.create.scopes;
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];

  switch (scope) {
    case scopes.app.name:
      app.create(parameter, options, utils);
      break;
    case scopes.theme.name:
      utils.ensureJetApp();
      app.createTheme(parameter, options, utils);
      break;
    case scopes.component.name:
      app.createComponent(parameter, options, utils);
      break;
    case scopes.pack.name: {
      utils.ensureJetApp();
      const tooling = utils.loadTooling();
      tooling.create(scope, parameter);
      break;
    }
    case undefined:
    default:
      app.create(scope, options, utils);
  }
};
