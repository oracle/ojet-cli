/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * ## Dependencies
 */
const utils = require('./utils');

/**
 * # Serve app
 *
 * @public
 * @param {Object} options
 */
module.exports = function (options) {
  // Convert task abbreviations back to full name
  const args = process.argv;
  const nodeModulesDir = `${process.cwd()}/node_modules`;

  let supportedPlatforms = [];
  if (utils.isCwdJetApp()) {
    try {
      const constantsPath = `${nodeModulesDir}/oraclejet-tooling/lib/constants.js`;
      supportedPlatforms = require(constantsPath).SUPPORTED_PLATFORMS; // eslint-disable-line
    } catch (error) {
      utils.log.warning('Supported platforms could not be read from constants. Using defaults instead.');
      supportedPlatforms = ['android', 'ios', 'web', 'windows'];
    }
  } else {
    throw utils.toError(utils.toNotJetAppMessage());
  }

  // Remove '<platform>' from process.argv and transform to a 'platform' flag
  for (let i = 0; i < supportedPlatforms.length; i += 1) { // eslint-disable-line
    // Disabling eslint because forEach can not be break
    const j = args.indexOf(supportedPlatforms[i]);
    if (j !== -1) {
      // Validation of platform parameter vs. flag
      if (utils.hasProperty(options, 'platform')) {
        throw utils.toError('Platform parameter and platform flag can not be used simultaneously.');
      }
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

  const gruntpath = `${nodeModulesDir}/grunt/lib/grunt.js`;
  // Requiring grunt must be dynamic because we need to remove --release parameter first.
  // If grunt is required at the beginning it uses 'old' process.argv
  // and throws error about unsupported flag
  const grunt = require(gruntpath); // eslint-disable-line
  if (grunt) {
    grunt.cli();
  } else {
    throw utils.toError('Grunt task runner is not installed.');
  }
};
