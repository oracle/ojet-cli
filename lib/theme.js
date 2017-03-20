/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * ## Dependencies
 */
// 3rd party
const env = require('yeoman-environment').createEnv();

// Oracle
const config = require('../config');
const utils = require('./utils');

/**
 * # Theme
 *
 * @public
 * @param {string} task
 * @param {string} [parameter]
 */
module.exports = function (task, parameter) {
  env.on('error', (error) => {
    throw utils.toError(error);
  });
  switch (task) {
    case config.scope.theme.tasks.add.key:
      env.lookup(() => {
        let cmd = 'oraclejet:add-theme';
        if (parameter) {
          cmd = `${cmd} ${parameter}`;
        }
        env.run(cmd, () => {});
      });
      break;
    default:
      throw utils.toError(utils.toNotSupportedMessage(`${config.scope.theme.key} ${task} ${parameter}`));
  }
};
