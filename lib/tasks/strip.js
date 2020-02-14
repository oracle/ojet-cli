#! /usr/bin/env node
/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');
const path = require('path');

// Oracle
const utils = require('../utils');
/**
 * # Invoke 'strip' task
 *
 * @public
 * @param {Array} [parameters] - Passed in just to show warning if present
 */
module.exports = function (parameters) {
  utils.validateParametersCount(parameters, 0);
  utils.ensureJetApp();
  const toolingPath = path.join(process.cwd(), 'node_modules/@oracle/oraclejet-tooling');
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    tooling.strip();
  } else {
    utils.log.error('Your JET project has already had oraclejet-tooling removed.');
  }
};
