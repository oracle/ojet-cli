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
const utils = require('../utils');

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
  switch (scope) {
    case config.tasks.build.scopes.app.name:
    case config.tasks.serve.scopes.app.name:
    case undefined:
      app.runGrunt(options);
      break;
    default:
      if (utils.getSupportedPlatforms().indexOf(scope) > -1) {
        app.runGrunt(options);
      } else {
        utils.log.error(`Invalid platform ${scope}`);
      }
  }
};
