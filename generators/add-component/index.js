/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const common = require('../../common');
const commonComponent = require('../../common/component');
const commonHookRunner = require('../../common/hookRunner');

/**
 * # Entry point for 'add component' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 * @param {utils} utility module
 */
module.exports = function (parameters, opt, utils) {
  const addComponent = {
    arguments: parameters,
    options: Object.assign({ namespace: 'add-component', componentName: parameters }, opt)
  };
  common.validateFlags(addComponent)
  .then(() => commonComponent.checkThatAppExists(utils))
  .then(() => commonComponent.validateComponentName(addComponent, utils))
  .then(() => commonComponent.writeComponentTemplate(addComponent, utils))
  .then(() => commonHookRunner.runAfterComponentCreateHook(
    { componentPath: commonComponent.getComponentDestPath(addComponent, utils) }))
  .then(() => commonComponent.logSuccessMessage(addComponent, utils))
  .catch(utils.log.error);
};
