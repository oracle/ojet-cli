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

// Oracle
const config = require('../../config');
const constants = require('../util/constants');
const utils = require('../util/utils');

/**
 * # Invoked clean
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters]
 */
module.exports = function (scope) {
  if (!utils.ensureJetApp()) {
    return Promise.reject();
  }
  // Oracle command libs
  let tooling;
  try {
    tooling = require(constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME); // eslint-disable-line
  } catch (e) {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
    return Promise.reject();
  }
  switch (scope) {
    case config.tasks.clean.scopes.app.name:
    case undefined:
    default:
      return tooling.clean.platform();
  }
};
