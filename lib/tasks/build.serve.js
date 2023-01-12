/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

/**
 * ## Dependencies
 */
const app = require('../scopes/app');
const config = require('../../config');
const utils = require('../util/utils');
const constants = require('../util/constants');

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
  if (!utils.ensureJetApp()) {
    return Promise.reject();
  }
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  switch (scope) {
    // ojet (build|serve) (component|pack)
    case config.tasks.build.scopes.component.name:
    case config.tasks.build.scopes.pack.name:
      return app.runTooling(task, scope, undefined, { ...options, component: parameter });
    // ojet (build|serve) (app|undefined)
    case config.tasks.build.scopes.app.name:
    case config.tasks.serve.scopes.app.name:
    case undefined:
      return app.runTooling(task, scope, parameter, options);
    default:
      if (constants.SUPPORTED_PLATFORMS.indexOf(scope) > -1) {
        // ojet (build|serve) (web|ios|android|windows)
        return app.runTooling(task, scope, parameter, options);
      }
      utils.log.error(`Invalid platform ${scope}`);
      return Promise.reject();
  }
};
