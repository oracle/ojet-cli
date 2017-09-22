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
const utils = require('../utils');

/**
 * # Switch for 'publish' task
 *
 * @public
 * @param {string} task
 * @param {string} scope
 * @param {Array} parameters
 * @param {Object} [options]
 */
module.exports = function (task, scope, parameter, options) {
  switch (scope) {
    case config.tasks[task].scopes.component.name:
      utils.ensureParameters(parameter);
      utils.ensureJetApp();
      utils.ensureCatalogUrl();
      component.publish(parameter, options);
      break;
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
