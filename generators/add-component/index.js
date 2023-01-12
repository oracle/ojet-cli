/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const common = require('../../common');
const commonComponent = require('../../common/component');
const commonHookRunner = require('../../common/hookRunner');
const utils = require('../../lib/util/utils');


/**
 * # Entry point for 'add component' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (parameters, opt) {
  const addComponent = {
    arguments: parameters,
    options: Object.assign({ namespace: 'add-component', componentName: parameters }, opt)
  };
  return common.validateFlags(addComponent)
    .then(() => commonComponent.checkThatAppExists)
    .then(() => commonComponent.validateComponentName(addComponent))
    .then(() => commonComponent.writeComponentTemplate(addComponent))
    .then(() => commonHookRunner.runAfterComponentCreateHook(
      { componentPath: commonComponent.getComponentDestPath(addComponent) }))
    .then(() => commonComponent.logSuccessMessage(addComponent))
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
};
