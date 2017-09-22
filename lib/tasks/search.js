#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Oracle
const catalog = require('../scopes/catalog');
const config = require('../../config');
const utils = require('../utils');

/**
 * # Switch for 'search' task
 *
 * @public
 * @param {string} task
 * @param {string} scope
 * @param {string} parameter
 */
module.exports = function (task, scope, parameter) {
  switch (scope) {
    case config.tasks[task].scopes.catalog.name:
      utils.ensureParameters(parameter);
      utils.ensureJetApp();
      utils.ensureCatalogUrl();
      catalog.search(parameter);
      break;
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
