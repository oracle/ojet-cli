#! /usr/bin/env node
/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * ## Dependencies
 */
const config = require('../../config');
const utils = require('../util/utils');
const app = require('../scopes/app');

/**
 * # Switch for 'migrate' task
 *
 * @public
 * @param {string} scope
 * @param {object} _options
 * @param {Array} [parameters] - Passed in just to show warning if present
 */
module.exports = function (scope, parameters, _options) {
  const task = config.tasks.migrate.name;
  const scopes = config.tasks.migrate.scopes;
  utils.validateParametersCount(parameters, 0);

  switch (scope) {
    case undefined:
    case scopes.app.name: {
      utils.ensureJetApp();
      return app.migrate(_options);
    }
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
