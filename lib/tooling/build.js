/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

/*
 * Options and Arguments processing before Invoking tooling APIs
 */
const utils = require('../util/utils');
const constants = require('../util/constants');

module.exports = function (platform, options) {
  utils.validateOptions(options, 'build');
  const buildOptions = options || {};

  // Need to skip for build pack
  if (platform !== 'pack') {
    buildOptions.platform = utils.validatePlatform(platform);
    buildOptions.buildConfig = options['build-config'];
    buildOptions.theme = options.theme;
    buildOptions.themes = utils.validateThemes(options);
    buildOptions.nosass = options.nosass;
    buildOptions.sassCompile = (options.nosass) ? false :
      options.sass || (options.sass === undefined);
    buildOptions.pcssCompile = (!buildOptions.sassCompile) ? false : options.pcss || true;
    buildOptions.svg = options.svg;
    buildOptions.destination = _getDestination(options);
    buildOptions.platformOptions = utils.validatePlatformOptions(options['platform-options'], buildOptions.platform);
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

  // pass on no-optimize-flag
  // eslint-disable-next-line max-len
  buildOptions[constants.OMIT_COMPONENT_VERSION_FLAG] = options[constants.OMIT_COMPONENT_VERSION_FLAG];

  // do not pass buildOptions.sass down because it will override
  // defaultconfig.build.sass during the options merge process
  delete buildOptions.sass;

  const tooling = utils.loadTooling();
  return tooling.build(buildOptions.platform, buildOptions)
    .then(() => {
      utils.log.success('Build finished.');
    })
    .catch((error) => {
      utils.log.error(error);
      return Promise.reject();
    });
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
