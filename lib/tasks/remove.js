#! /usr/bin/env node
/**
  Copyright (c) 2015, 2024, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * ## Dependencies
 */
const config = require('../../config');
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
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      return Promise.reject();
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
