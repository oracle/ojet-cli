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
const runGrunt = require('./app.runGrunt');
const utils = require('./utils');

/**
 * # App
 *
 * @public
 * @param {string} task
 * @param {string} [parameter]
 * @param {Object} [options]
 */
module.exports = function (task, parameter, options) {
  env.on('error', (error) => {
    if (utils.isTestEnv()) {
      utils.log(error);
    }
    throw error;
  });

  const opts = options;
  const tasks = config.scope.app.tasks;

  const add = tasks.add.key;
  const clean = tasks.clean.key;
  const restore = tasks.restore.key;

  switch (task) {
    case tasks.create.key:
      env.lookup(() => {
        if (opts && utils.hasProperty(opts, 'hybrid')) {
          // Deleting hybrid flag as we do not support semicolon syntax
          // (ojet create app:hybrid appName)
          delete opts.hybrid;
          _envRun('hybrid', parameter, opts);
        } else {
          _envRun('app', parameter, opts);
        }
      });
      break;
    case add:
      switch (parameter) {
        case 'hybrid':
          _delegateToGenerator('add-hybrid', '', opts);
          break;
        case 'sass':
          _delegateToGenerator('add-sass');
          break;
        default:
          throw utils.toError(utils.toNotSupportedMessage(`${config.scope.app.key} ${task} ${parameter}`));
      }
      break;
    case clean:
      _clean(parameter);
      break;
    case restore:
      _delegateToGenerator(restore);
      break;
    case tasks.build.key:
    case tasks.serve.key:
      runGrunt(options);
      break;
    default:
      throw utils.toError(utils.toNotSupportedMessage(`${config.scope.app.name} ${task}`));
  }
};

/**
 * # _clean
 *
 * @private
 * @param {string} [parameter]
 */
function _clean(parameter) {
  utils.ensureHybrid();

  const execCommand = `cordova clean${parameter ? ` ${parameter}` : ''}`;

  /**
   * ## _execute
   * Can not exist out of current scope as it is executed from the Promise chain
   * we do not want to pollute with arguments or nasty bindings
   *
   * @private
   * @returns {Promise}
   */
  function _execute() {
    return utils.exec(execCommand);
  }

  utils.cdToCordovaDirectory()
    .then(_execute)
    .then(utils.cdFromCordovaDirectory)
    .catch((error) => {
      // Can not throw in promise catch handler
      // http://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler
      setTimeout(() => {
        throw utils.log.toError(error);
      }, 0);
    });
}

/**
 * # _delegateToGenerator
 *
 * @private
 * @param {string} generator
 * @param {string} [parameter]
 * @param {Object} [options]
 */
function _delegateToGenerator(generator, parameter, options) {
  env.lookup(() => {
    _envRun(generator, parameter, options);
  });
}

/**
 * # _envRun
 *
 * @private
 * @param {string} generator
 * @param {string} [parameter]
 * @param {Object} [options]
 */
function _envRun(generator, parameter, options) {
  const gen = `oraclejet:${generator}`;
  const cmdToRun = parameter ? `${gen} ${parameter}` : gen;

  env.run(cmdToRun, options, (error) => {
    if (error) {
      throw utils.toError(error);
    }
  });
}
