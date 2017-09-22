#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const catalog = require('../scopes/catalog');
const config = require('../../config');
const utils = require('../utils');

/**
 * # Switch for 'configure' task
 *
 * @public
 * @param {string} task
 * @param {string} scope
 */
module.exports = function (task, scope, options) {
  const opts = options;
  switch (scope) {
    case config.tasks[task].scopes.app.name:
    case undefined:
      utils.ensureJetApp();
      if (opts && utils.hasProperty(opts, 'catalog-url')) {
        catalog.configureCatalogUrl(opts['catalog-url']);
      } else {
        utils.log.error(utils.toError(`Please check 'ojet help ${task}' and provide valid configuration options.`));
      }
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${config.tasks[task].name} ${scope}`));
  }
};
