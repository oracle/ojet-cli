#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Oracle command libs
const app = require('../scopes/app');

/**
 * # Switch for 'build' and 'serve' tasks
 *
 * @public
 * @param {string} task
 * @param {string} [scope]
 * @param {string} [parameter]
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameter, options) {
  let param = parameter;

  if (scope && scope !== 'app') {
    param = scope;
  }

  app.runGrunt(task, param, options);
};
