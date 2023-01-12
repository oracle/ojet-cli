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

// Oracle
const config = require('../../config');
const constants = require('../util/constants');
const utils = require('../util/utils');

/**
 * # Invoked platform clean
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters]
 */
module.exports = function (scope, parameters) {
  if (!utils.ensureJetApp()) {
    return Promise.reject();
  }
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  // Oracle command libs
  let tooling;
  try {
    tooling = require(constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME); // eslint-disable-line
  } catch (e) {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
    return Promise.reject();
  }
  const platform = parameter === undefined ? scope : parameter;
  switch (scope) {
    case config.tasks.clean.scopes.app.name:
    case undefined:
    default:
      if (constants.SUPPORTED_PLATFORMS.indexOf(platform) > -1) {
        return tooling.clean.platform(platform);
      }
      utils.log.error(`Invalid platform ${platform}`);
      return Promise.reject();
  }
};
