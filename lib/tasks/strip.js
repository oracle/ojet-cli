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
const config = require('../../config');
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
    _removeRegisteredComponents();
  } else {
    utils.log.error('Your JET project does not have oraclejet-tooling installed.');
  }
};

function _removeRegisteredComponents() {
  const names = _getComponentNames() || [];
  const tooling = utils.loadTooling();
  tooling.remove(config.tasks.remove.scopes.component.name, names, true);
}

function _getComponentNames() {
  const configObj = utils.readJsonAndReturnObject(config.configFile);
  return configObj.composites ? Object.keys(configObj.composites) : undefined;
}
