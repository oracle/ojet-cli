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
const app = require('../scopes/app');
const config = require('../../config');
const utils = require('../util/utils');

/**
 * # Switch for 'restore' task
 *
 * @public
 * @param {string} task
 * @param {string} [scope]
 * @param {Array} [parameters] - Passed in just to show warning if present
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameters, options) {
  if (!utils.ensureJetApp()) {
    return Promise.reject();
  }
  utils.validateParametersCount(parameters, 0);
  switch (scope) {
    case undefined:
    case config.tasks[task].scopes.app.name:
      return app.restore(options);
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
