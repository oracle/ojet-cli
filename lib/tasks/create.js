#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
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
 * @param {string} [parameter]
 * @param {Object} [options]
 */
module.exports = function (scope, parameter, options) {
  const scopes = config.tasks.create.scopes;

  switch (scope) {
    case scopes.app.name:
      app.create(parameter, options);
      break;
    case scopes.theme.name:
      utils.ensureJetApp();
      app.delegateToGenerator('add-theme', parameter);
      break;
    case scopes.component.name:
      app.delegateToGenerator('add-component', parameter);
      break;
    case undefined:
    default:
      app.create(scope, options);
  }
};
