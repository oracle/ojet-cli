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
 * # Switch for 'create' task
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters]
 * @param {Object} [options]
 */
module.exports = function (scope, parameters, options) {
  const scopes = config.tasks.create.scopes;
  utils.validateParametersCount(parameters, 1);
  const parameter = parameters[0];
  switch (scope) {
    case scopes.theme.name: {
      if (!utils.ensureJetApp()) {
        return Promise.reject();
      }
      return app.createTheme(parameter, options);
    }
    case scopes.component.name: {
      if (!utils.ensureJetApp()) {
        return Promise.reject();
      }
      return app.createComponent(parameter, options);
    }
    case scopes.pack.name: {
      if (!utils.ensureJetApp()) {
        return Promise.reject();
      }
      const tooling = utils.loadTooling();
      return tooling.create(scope, parameter, options);
    }
    case scopes.app.name:
      // ojet create app TestApp: scope = app, parameters = [TestApp]
      return app.create(parameter, options);
    case undefined:
      // ojet create TestApp (API): scope = undefined, parameters = [TestApp]
      return app.create(parameter, options);
    default:
      // ojet create TestApp (CLI): scope = TestApp, parameters = []
      return app.create(scope, options);
  }
};
