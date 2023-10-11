/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

/**
 * # Dependencies
 */

const utils = require('../util/utils');
const constants = require('../util/constants');

/**
 * # ojet serve command
 * 'ojet serve ...'
 *
 * @public
 */

module.exports = (platform, options) => {
  utils.validateOptions(options, 'serve');
  let serveOptions = options;
  serveOptions = _validateDestination(serveOptions);
  serveOptions = _validateLivereload(serveOptions);
  serveOptions.platform = utils.validatePlatform(platform);
  serveOptions.buildOptions = {};

  const serveConfig = {};
  serveConfig.options = {};

  // Set watch interval value:
  const toolingUtil = utils.loadToolingUtil();
  const oraclejetConfigJson = toolingUtil.getOraclejetConfigJson() || {};
  const defaultIntervalValue = 1000;
  const selectedIntervalValue = serveOptions.watchInterval || oraclejetConfigJson.watchInterval;
  oraclejetConfigJson.watchInterval = _getNonNull(selectedIntervalValue, defaultIntervalValue);
  toolingUtil.writeObjectAsJsonFile(utils.getOracleJetConfigPath(), oraclejetConfigJson);

  serveOptions.buildType = _getNonNull(serveConfig.options.release, options.release) ? 'release' : 'dev';
  serveOptions.build = _getNonNull(serveConfig.options.build, options.build);
  serveOptions.destination = _getNonNull(serveConfig.options.destination, options.destination);
  serveOptions.optimize = _getNonNull(serveConfig.options.optimize, options.optimize);

  serveOptions.livereload = _getNonNull(serveConfig.options.livereload, options.livereload);
  serveOptions.watchFiles = _getNonNull(serveConfig.options.watchFiles, options['watch-files']);
  serveOptions.livereloadPort = _getNonNull(serveConfig.options.livereloadPort, options['livereload-port']);
  serveOptions.port = _getNonNull(serveConfig.options.port, options['server-port']);
  serveOptions.theme = options.theme;
  serveOptions.themes = utils.validateThemes(options);
  serveOptions.nosass = options.nosass;
  serveOptions.sassCompile = (options.nosass) ? false :
    options.sass || (options.sass === undefined);
  serveOptions.pcssCompile = (!serveOptions.sassCompile) ? false : (options.pcss || true);
  serveOptions.svg = options.svg;
  serveOptions.connect = utils.validateServeOptions(serveConfig, 'connect', serveOptions.platform);
  serveOptions.watch = utils.validateServeOptions(serveConfig, 'watch', serveOptions.platform);

  // pass on any serve options
  serveOptions.userOptions = options['user-options'];

  if (serveOptions.buildType === 'release') {
    serveOptions.livereload = false;
  }

  if (serveOptions.sass) delete serveOptions.sass;

  // pass on notscompile flag
  serveOptions.notscompile = options.notscompile;

  // pass on dbg flag
  serveOptions.dbg = options.dbg;

  // pass on no-optimize-flag
  // eslint-disable-next-line max-len
  serveOptions[constants.OMIT_COMPONENT_VERSION_FLAG] = options[constants.OMIT_COMPONENT_VERSION_FLAG];

  const tooling = utils.loadTooling();
  return tooling.serve(serveOptions.platform, serveOptions)
    .then(() => {
      utils.log.success('Serve finished.');
    })
    .catch((error) => {
      utils.log(error);
      return Promise.reject();
    });
};


/**
 * ## _getNonNull
 *
 * @private
 */
function _getNonNull(value, alternate) {
  if (value === null || value === undefined) {
    return alternate;
  }
  return value;
}


/**
 * ## _validateLivereload
 * Temporary fix since we still support 'disableLiveReload' flag.
 * Such a value needs to be negated due to 'negative' name
 *
 * @private
 */
function _validateLivereload(options) {
  const newOptions = options;
  if (options.disableLiveReload) {
    newOptions.livereload = false;
  }
  return newOptions;
}

/**
 * ## _validateDestination
 * Validates server destination, which can be declared
 * by a shortcut --server-only flag.
 *
 * @private
 * @param {Object} options
 * @returns {Object} newOptions
 */
function _validateDestination(options) {
  const newOptions = options;
  const destinationShortCut = newOptions['server-only'];
  if (destinationShortCut) {
    newOptions.destination = 'server-only';
    // property flag 'server-only' is no longer needed in options
    // as we have promoted its presence to destination property
    delete newOptions['server-only'];
  }
  return newOptions;
}
