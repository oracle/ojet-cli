#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

const utils = require('../utils');
const path = require('path');
const fs = require('fs');

/**
 * # Invoke 'strip' task
 *
 * @public
 */
module.exports = function () {
  const toolingPath = path.join(process.cwd(), 'node_modules/oraclejet-tooling');
  // Oracle command libs
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    tooling.strip();
  } else {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
  }
};
