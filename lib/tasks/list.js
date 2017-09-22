#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const component = require('../scopes/component');
const config = require('../../config');
const platformAndPlugin = require('../scopes/platform.plugin');
const utils = require('../utils');

/**
 * # Switch for 'list' task
 *
 * @public
 * @param {string} scope
 * @param {string} [parameter] - Passed in just to show error if present
 */
module.exports = function (scope, parameter) {
  const task = config.tasks.list.name;
  const scopes = config.tasks.list.scopes;

  switch (scope) {
    case scopes.component.name: {
      utils.ensureJetApp();
      component.list();
      break;
    }
    case scopes.platform.name:
    case scopes.plugin.name: {
      utils.ensureJetHybridApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
      } else {
        platformAndPlugin(task, scope);
      }
      break;
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
