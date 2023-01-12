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
const platformAndPlugin = require('../scopes/platform.plugin');
const utils = require('../util/utils');

/**
 * # Switch for 'list' task
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters] - Passed in just to show warning if present
 */
module.exports = function (scope, parameters) {
  const task = config.tasks.list.name;
  const scopes = config.tasks.list.scopes;
  utils.validateParametersCount(parameters, 0);

  switch (scope) {
    case scopes.component.name:
    case scopes.pack.name: {
      utils.ensureJetApp();
      const tooling = utils.loadTooling();
      return tooling.list(scope);
    }
    case scopes.platform.name:
    case scopes.plugin.name: {
      utils.ensureJetHybridApp();
      return platformAndPlugin(task, scope);
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      return Promise.reject();
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
