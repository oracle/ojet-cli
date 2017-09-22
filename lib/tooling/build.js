/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/*
 * Options and Arguments processing before Invoking tooling APIs
 */
const utils = require('../utils');

module.exports = function (platform, options) {
  utils.validateOptions(options, 'build');
  const buildOptions = utils.getBuildCustomizedConfig(options) || {};
  buildOptions.platform = utils.validatePlatform(platform);
  buildOptions.buildType = options.release ? 'release' : 'dev';
  buildOptions.buildConfig = options['build-config'];
  buildOptions.theme = options.theme;
  buildOptions.themes = utils.validateThemes(options.themes);
  buildOptions.sassCompile = options.sass;
  buildOptions.destination = _getDestination(options);
  buildOptions.platformOptions = utils.validatePlatformOptions(options['platform-options'], buildOptions.platform);

  const tooling = utils.loadTooling();
  tooling.build(buildOptions.platform, buildOptions)
  .then(() => {
    console.log('Build finished!');
  })
  .catch(error => console.log(error));
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
