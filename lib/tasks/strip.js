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
const fs = require('fs');
const path = require('path');

// Oracle
const utils = require('../utils');
const component = require('../scopes/component');
const config = require('../../config');
/**
 * # Invoke 'strip' task
 *
 * @public
 */
module.exports = function () {
  const toolingPath = path.join(process.cwd(), 'node_modules/@oracle/oraclejet-tooling');
  // Oracle command libs
  utils.ensureJetApp();
  if (fs.existsSync(toolingPath)) {
    const tooling = require(toolingPath); // eslint-disable-line
    tooling.strip();
    _removeRegisteredComponents();
  } else {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
  }
};

function _removeRegisteredComponents() {
  const names = _getComponentNames() || [];
  component.remove(names, true);
}

function _getComponentNames() {
  const configObj = utils.readJsonAndReturnObject(config.configFile);
  return configObj.composites ? Object.keys(configObj.composites) : undefined;
}
