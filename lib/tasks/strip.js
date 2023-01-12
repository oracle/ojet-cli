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
// Node
const fs = require('fs');
const path = require('path');
const constants = require('../util/constants');

// Oracle
const utils = require('../util/utils');
/**
 * # Invoke 'strip' task
 *
 * @public
 * @param {Array} [parameters] - Passed in just to show warning if present
 */
module.exports = function (parameters) {
  if (!utils.ensureJetApp()) {
    return Promise.reject();
  }
  utils.validateParametersCount(parameters, 0);
  const toolingPath = path.join(process.cwd(), constants.TOOLING_PATH);
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    return tooling.strip();
  }
  try {
    // Use global install if available
    const tooling = require(constants.ORACLEJET_TOOLING_PACKAGE_JSON_NAME); // eslint-disable-line
    return tooling.strip();
  } catch (e) {
    // Don't error
  }

  utils.log.error('Your JET project has already had oraclejet-tooling removed.');
  return Promise.reject();
};
