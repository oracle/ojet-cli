#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const config = require('../../config');
const platformAndPlugin = require('../scopes/platform.plugin');
const utils = require('../utils');

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
      tooling.list(scope);
      break;
    }
    case scopes.platform.name:
    case scopes.plugin.name: {
      utils.ensureJetHybridApp();
      platformAndPlugin(task, scope);
      break;
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
