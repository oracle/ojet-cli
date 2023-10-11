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
const app = require('../scopes/app');
const config = require('../../config');
const utils = require('../util/utils');

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
      return tooling.add(scope, parameters, options);
    }
    case scopes.sass.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addSass(options);
    case scopes.theming.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addPcss(options);
    case scopes.typescript.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addTypescript(options);
    case scopes.docgen.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addJsdoc(options);
    case scopes.testing.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addTesting(options);
    case scopes.pwa.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addpwa();
    case scopes.webpack.name:
      utils.validateParametersCount(parameters, 0);
      utils.ensureJetApp();
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addwebpack(options);
    case scopes.web.name:
      utils.validateParametersCount(parameters, 0);
      if (parameter) {
        utils.log.error(utils.toNotSupportedMessage(`${task} ${scope} ${parameter}`));
        return Promise.reject();
      }
      return app.addWeb();
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      return Promise.reject();
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
