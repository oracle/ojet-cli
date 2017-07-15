#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const utils = require('../utils');
const path = require('path');
const fs = require('fs');

/**
 * # Invoked platform clean
 *
 * @public
 * @param {string} platform
 */
module.exports = function (platform) {
  const toolingPath = path.join(process.cwd(), 'node_modules/oraclejet-tooling');
  // Oracle command libs
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    tooling.clean.platform(platform);
  } else {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
  }
};
