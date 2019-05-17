/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const common = require('../../common');
const commonComponent = require('../../common/component');
const commonHookRunner = require('../../common/hookRunner');
const commonMessages = require('../../common/messages');
const commonTest = require('../../common/test');
const addApp = require('../app');
const fs2 = require('fs');
const path = require('path');

function _validateComponentName(generator, utils) {
  const name = generator.options.componentName;
  if (name === undefined || name === null) {
    utils.log.error('Missing component name.');
  } else if (name !== name.toLowerCase() || name.indexOf('-') < 0 || !/^[a-z]/.test(name)) {
    const message = 'Invalid component name. Must be all lowercase letters and contain at least one hyphen.';
    utils.log.error(`\x1b[31m${new Error(message)}\x1b[0m`); //eslint-disable-line
  }
}

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
  .then(() => { _validateComponentName(addComponent, utils); })
  .then(() => commonComponent.writeComponentTemplate(addComponent, utils))
  .then(() => commonTest.writeTestTemplate(addComponent))
  .then(() => commonHookRunner.runAfterComponentCreateHook())
  .then(() => {
    const cwd = process.cwd();
    const isApp = fs2.existsSync(path.join(cwd, 'oraclejetconfig.json'));
    if (!isApp) {
      delete addComponent.options.namespace;
      addApp(parameters, addComponent.options, utils);
    } else {
      utils.log(commonMessages.appendJETPrefix(`Add component ${addComponent.options.componentName} finished.`));
    }
    if (isApp) process.exit(0);
  })
  .catch((err) => {
    if (err) {
      utils.log(err);
      process.exit(1);
    }
  });
};
