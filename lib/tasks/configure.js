#! /usr/bin/env node
/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

// Oracle
const config = require('../../config');
const CONSTANTS = require('../utils.constants');
const utils = require('../utils');

/**
 * # Switch for 'configure' task
 *
 * @public
 * @param {string} task
 * @param {Array} [parameters] - Passed in just to show warning if present
 * @param {string} scope
 */
module.exports = function (task, scope, parameters, options) {
  utils.validateParametersCount(parameters, 0);
  switch (scope) {
    case config.tasks[task].scopes.app.name:
    case undefined:
      if (options && utils.hasProperty(options, config.exchangeUrlParam)) {
        if (utils.hasGlobalOption(options)) {
          // Ensure storage dir
          const storeDir = path.join(homedir, CONSTANTS.OJET_LOCAL_STORAGE_DIR);
          if (!fs.existsSync(storeDir)) {
            fs.mkdirSync(storeDir, { recursive: true });
          }

          const data = {};
          data[CONSTANTS.EXCHANGE_GLOBAL_URL_KEY] = options[config.exchangeUrlParam];

          // Write file
          const content = JSON.stringify(data, null, 2);
          const pathToFile = path.join(storeDir, CONSTANTS.EXCHANGE_URL_FILE);
          try {
            fs.writeFileSync(pathToFile, content);
          } catch (error) {
            utils.log.error(`File '${pathToFile}' could not be written. More details: ${error}`);
          }
          utils.log.success(`Global Exchange url set: ${options[config.exchangeUrlParam]}`);
        } else {
          utils.ensureJetApp();
          const tooling = utils.loadTooling();
          tooling.configure('exchange', options);
        }
      } else {
        utils.log.error(`Please check 'ojet help ${task}' and provide valid configuration options.`);
      }
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
