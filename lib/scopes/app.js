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
 * @param {Object} [options]
 */
app.runGrunt = function (options) {
  const args = process.argv;
  const supportedPlatforms = utils.getSupportedPlatforms();

  // Refuse platform flag
  if (utils.hasProperty(options, 'platform')) {
    utils.log.error('Flag \'--platform\' is not supported. Use platform name as parameter e.g. \'ojet serve ios.\'');
  }

  // Remove '<platform>' from process.argv and transform to a 'platform' flag
  for (let i = 0; i < supportedPlatforms.length; i += 1) { // eslint-disable-line
    // Disabling eslint because forEach can not be break
    const j = args.indexOf(supportedPlatforms[i]);
    if (j !== -1) {
      args.splice(j, 1, `--platform=${supportedPlatforms[i]}`);
      break;
    }
  }

  // Remove 'release flag' as we are using semicolon notation 'grunt serve:release'
  const i = args.indexOf('--release');
  if (i !== -1) {
    args.splice(i, 1);
  }

  // Add semicolon notation if release flag was used
  if (utils.hasProperty(options, 'release')) {
    args[2] = process.argv[2] === 'build' ? 'build:release' : 'serve:release';
  }

  // Remove 'app' scope from process.argv
  const j = args.indexOf('app');
  if (j !== -1) {
    args.splice(j, 1);
  }

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
