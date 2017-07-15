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
const utils = require('../utils');

/**
 * # App
 *
 * @public
 */
const app = module.exports;

env.on('error', (error) => {
  if (utils.isTestEnv()) {
    utils.log(error);
  }
  throw utils.toError(error);
});

/**
 * ## create
 *
 * @public
 * @param {string} [parameter]
 * @param {Object} [options]
 */
app.create = function (parameter, options) {
  const opts = options;
  env.lookup(() => {
    if (opts && utils.hasProperty(opts, 'hybrid')) {
      // Deleting 'hybrid' flag
      delete opts.hybrid;
      _envRun('hybrid', parameter, opts);
    } else {
      // Deleting 'web' flag
      if (opts && utils.hasProperty(opts, 'web')) {
        delete opts.web;
      }
      _envRun('app', parameter, opts);
    }
  });
};

/**
 * ## delegateToGenerator
 *
 * @public
 * @param {string} generator
 * @param {string} [parameter]
 * @param {Object} [options]
 */
app.delegateToGenerator = function (generator, parameter, options) {
  env.lookup(() => {
    _envRun(generator, parameter, options);
  });
};

/**
 * ## runGrunt
 *
 * @public
 * @param {string} task
 * @param {string} parameter
 * @param {Object} [options]
 */
app.runGrunt = function (task, parameter, options) {
  // Refuse platform flag
  if (utils.hasProperty(options, 'platform')) {
    utils.log.error('Flag \'--platform\' is not supported. Use platform name as parameter e.g. \'ojet serve ios.\'');
  }

  // Regarding flags, Grunt supports only '--flag=value' syntax.
  // Ojet supports also '--flag value'.
  // We need to regenerate process.argv to have it in shape Grunt consumes.

  // 1. clear process.argv - remove the user input
  const args = process.argv;
  args.splice(2);

  // 2. add task
  args.push(task);

  // Add semicolon notation if release flag was used
  if (utils.hasProperty(options, 'release') && [true, 'true'].indexOf(options.release) > -1) {
    args[2] = process.argv[2] === 'build' ? 'build:release' : 'serve:release';
  }

  // 3. Use platform flag 'serve --platform=ios' instead of 'serve ios'
  if (parameter) {
    args.push(`--platform=${parameter}`);
  }

  // 4. add options
  Object.keys(options).forEach((key) => {
    if (utils.hasProperty(options, key) && key !== 'release') {
      args.push(`--${key}=${options[key]}`);
    }
  });

  if (utils.isCwdJetApp()) {
    try {
      const gruntpath = `${process.cwd()}/node_modules/grunt/lib/grunt.js`;
      // Requiring grunt must be dynamic because we need to remove --release parameter first.
      // If grunt is required at the beginning it uses 'old' process.argv
      // and throws error about unsupported flag
      const grunt = require(gruntpath); // eslint-disable-line
      grunt.cli();
    } catch (error) {
      utils.log.error('Grunt task runner not found. Please install by \'npm install grunt\'.');
    }
  } else {
    utils.log.error(utils.toNotJetAppMessage());
  }
};

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
