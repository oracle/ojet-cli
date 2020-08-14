/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

/*
 * Options and Arguments processing before Invoking tooling APIs
 */
const utils = require('../utils');

module.exports = function (platform, options) {
  utils.validateOptions(options, 'build');
  let buildOptions = options || {};
  if (!Object.prototype.hasOwnProperty.call(options, 'component')) {
    buildOptions = utils.getBuildCustomizedConfig(options);
    buildOptions.platform = utils.validatePlatform(platform);
    buildOptions.buildConfig = options['build-config'];
    buildOptions.theme = options.theme;
    buildOptions.themes = utils.validateThemes(options);
    buildOptions.nosass = options.nosass;
    buildOptions.sassCompile = (options.nosass) ? false : options.sass || true;
    buildOptions.pcssCompile = (options.nosass) ? false : options.pcss || true;
    buildOptions.svg = options.svg;
    buildOptions.destination = _getDestination(options);
    buildOptions.platformOptions = utils.validatePlatformOptions(options['platform-options'], buildOptions.platform);
    buildOptions.defaultCssvars = options.cssvars || false;
  }
  // Enable ---optimize for component builds.
  buildOptions.buildType = options.release ? 'release' : 'dev';
  buildOptions.optimize = options.optimize;

  // pass on any user-options
  buildOptions.userOptions = options['user-options'];

  // pass on notscompile flag
  buildOptions.notscompile = options.notscompile;

  // pass on dbg flsg
  buildOptions.dbg = options.dbg;

  const tooling = utils.loadTooling();
  tooling.build(buildOptions.platform, buildOptions)
    .then(() => {
      utils.log.success('Build finished.');
    })
    .catch(error => utils.log.error(error));
};

function _getDestination(opts) {
  let destination;
  if (opts.emulator) {
    destination = 'emulator';
  } else if (opts.device) {
    destination = 'device';
  } else {
    destination = opts.destination;
  }
  return destination;
}
