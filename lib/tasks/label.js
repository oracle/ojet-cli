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
const config = require('../../config');
const utils = require('../util/utils');

/**
 * # Switch for 'label' task
 *
 * @public
 * @param {string} scope
 * @param {Array} [parameters]
 */
module.exports = function (scope, parameters, options) {
  const task = config.tasks.list.name;
  const scopes = config.tasks.list.scopes;
  const parameter = parameters[0];

  /*
    The command structure for labeling components:
      1. ojet label component componentName@<version | label> <labelName>
      2. ojet label pack packName@<version | label> <labelName>

    The parameter array becomes: [componentName@<version | label>, labelName].
    Hence, to propagate the label value into the exchange method
    handling the labeling task, we add it into the options object.
  */
  if (parameters[1]) {
    // eslint-disable-next-line no-param-reassign
    options.label = parameters[1];
  } else {
    utils.log.error('Provide the label name and then try again. Run \'ojet label --help\' for more info.');
    return Promise.reject();
  }

  switch (scope) {
    case scopes.component.name:
    case scopes.pack.name: {
      utils.ensureJetApp();
      const tooling = utils.loadTooling();
      return tooling.label(scope, parameter, options);
    }
    case undefined:
      utils.log.error(utils.toMissingInputMessage(`${task}`));
      return Promise.reject();
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
      return Promise.reject();
  }
};
