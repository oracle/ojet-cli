#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
const app = require('../scopes/app');
const config = require('../../config');
const platformAndPlugin = require('../scopes/platform.plugin');
const utils = require('../utils');

/**
 * # Switch for 'add' task
 *
 * @public
 * @param {string} scope
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (scope, parameters, options) {
  const task = config.tasks.add.name;
  const scopes = config.tasks.add.scopes;
  const parameter = parameters[0];
  switch (scope) {
    case scopes.component.name:
    case scopes.pack.name: {
      utils.ensureParameters(parameters);
      utils.ensureJetApp();

      const tooling = utils.loadTooling();
      tooling.add(scope, parameters, options);
      break;
    }
    case scopes.hybrid.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
      } else {
        app.delegateToGenerator('add-hybrid', '', options);
      }
      break;
    case scopes.platform.name:
    case scopes.plugin.name: {
      utils.ensureParameters(parameters);
      utils.ensureJetHybridApp();
      // For 3.1.0 we do not want to support passing options other than --variable
      // http://aseng-wiki.us.oracle.com/asengwiki/display/ASDevJDeveloper/JET+CLI+Proposal
      let opts = { save: true };
      if (utils.hasProperty(options, 'variable')) {
        opts = Object.assign(opts, { variable: options.variable });
      }
      platformAndPlugin(task, scope, parameters, opts);
      break;
    }
    case scopes.sass.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
      } else {
        app.delegateToGenerator('add-sass');
      }
      break;
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      break;
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
