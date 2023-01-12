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
 * # Switch for 'remove' task
 *
 * @public
 * @param {string} scope
 * @param {Array} parameters
 * @param {Object} [options]
 */
module.exports = function (scope, parameters, options) {
  const task = config.tasks.remove.name;
  const scopes = config.tasks.remove.scopes;

  switch (scope) {
    case scopes.component.name:
    case scopes.pack.name: {
      utils.ensureJetApp();
      utils.ensureParameters(parameters);

      const tooling = utils.loadTooling();
      return tooling.remove(scope, parameters, false, options);
    }
    case scopes.platform.name:
    case scopes.plugin.name: {
      // For 3.1.0 we do not want to support passing options
      utils.ensureJetHybridApp();
      utils.ensureParameters(parameters);
      return platformAndPlugin(task, scope, parameters, { save: true });
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      return Promise.reject();
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
