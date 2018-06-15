#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
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
 * @param {Array} parameters
 */
module.exports = function (task, scope, parameters) {
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  switch (scope) {
    case config.tasks[task].scopes.catalog.name:
      utils.ensureParameters(parameter);
      utils.ensureJetApp();
      utils.ensureCatalogUrl();

      // Keep this if only for the course of 5.X
      // https://jira.oraclecorp.com/jira/browse/JET-21713
      if (utils.isTooling50x()) {
        catalog.search(parameter);
      } else {
        const tooling = utils.loadTooling();
        tooling.search(scope, parameter);
      }
      break;
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
