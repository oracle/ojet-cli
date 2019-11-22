/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const common = require('../../common');
const commonComponent = require('../../common/component');
const commonHookRunner = require('../../common/hookRunner');
const commonMessages = require('../../common/messages');

function _validateComponentName(generator, pack, utils) {
  const name = generator.options.componentName;
  if (name === undefined || name === null) {
    utils.log.error('Missing component name.');
  } else if (!pack && (name !== name.toLowerCase() || name.indexOf('-') < 0 || !/^[a-z]/.test(name))) {
    const message = 'Invalid component name. Must be all lowercase letters and contain at least one hyphen.';
    utils.log.error(`\x1b[31m${new Error(message)}\x1b[0m`); //eslint-disable-line
  }
}


// Verify that we are within an ojet application when the user issues:
//   ojet create component my-component
// If not, flag an error message and exit.
function _checkAppExists(utils) {
  if (!utils.isCwdJetApp()) {
    utils.log.error('You must be in an application to create a component. Please create an application first, then create the component from within that app.'); // eslint-disable-line max-len
    process.exit(0);
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

  const pack = Object.prototype.hasOwnProperty.call(opt, 'pack');
  common.validateFlags(addComponent)
  .then(() => { _checkAppExists(utils); })
  .then(() => { _validateComponentName(addComponent, pack, utils); })
  .then(() => commonComponent.writeComponentTemplate(addComponent, utils))
  .then(() => commonHookRunner.runAfterComponentCreateHook())
  .then(() => {
    utils.log(commonMessages.appendJETPrefix(`Add component ${addComponent.options.componentName} finished.`));
    process.exit(0);
  })
  .catch((err) => {
    if (err) {
      utils.log(err);
      process.exit(1);
    }
  });
};
