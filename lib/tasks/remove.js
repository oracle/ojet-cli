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
const platformAndPlugin = require('../scopes/platform.plugin');

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
    case scopes.platform.name:
    case scopes.plugin.name: {
      // For 3.1.0 we do not want to support passing options
      platformAndPlugin(task, scope, parameters, { save: true });
      break;
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task} ${scope}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
