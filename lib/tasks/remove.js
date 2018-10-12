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
 * # Switch for 'remove' task
 *
 * @public
 * @param {string} scope
 * @param {Array} parameters
 */
module.exports = function (scope, parameters) {
  const task = config.tasks.remove.name;
  const scopes = config.tasks.remove.scopes;

  switch (scope) {
    case scopes.component.name:
    case scopes.pack.name: {
      utils.ensureJetApp();
      utils.ensureParameters(parameters);

      const tooling = utils.loadTooling();
      tooling.remove(scope, parameters);
      break;
    }
    case scopes.platform.name:
    case scopes.plugin.name: {
      // For 3.1.0 we do not want to support passing options
      utils.ensureJetHybridApp();
      utils.ensureParameters(parameters);
      platformAndPlugin(task, scope, parameters, { save: true });
      break;
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
