#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Node
const path = require('path');
const fs = require('fs');

// Oracle
const config = require('../../config');
const CONSTANTS = require('../utils.constants');
const utils = require('../utils');

/**
 * # Invoked platform clean
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters]
 */
module.exports = function (scope, parameters) {
  utils.ensureJetApp();
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  const toolingPath = path.join(process.cwd(), 'node_modules/@oracle/oraclejet-tooling');
  // Oracle command libs
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    const platform = parameter === undefined ? scope : parameter;
    switch (scope) {
      case config.tasks.clean.scopes.app.name:
      case undefined:
      default:
        if (CONSTANTS.SUPPORTED_PLATFORMS.indexOf(platform) > -1) {
          tooling.clean.platform(platform);
        } else {
          utils.log.error(`Invalid platform ${platform}`);
        }
    }
  } else {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
  }
};
