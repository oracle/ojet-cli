#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Oracle utils
const config = require('../../config');

// Oracle command libs
const app = require('../scopes/app');

/**
 * # Switch for 'create' task
 *
 * @public
 * @param {string} scope
 * @param {string} [parameter]
 * @param {Object} [options]
 */
module.exports = function (scope, parameter, options) {
  switch (scope) {
    case config.tasks.create.scopes.app.name:
      app.create(parameter, options);
      break;
    case undefined:
    default:
      app.create(scope, options);
  }
};
