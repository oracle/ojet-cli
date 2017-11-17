/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * # Constants
 *
 * @public
 */

module.exports = {
  APP_CONFIG_JSON: 'oraclejetconfig.json',

  APP_TYPE: {
    HYBRID: 'hybrid',
    WEB: 'web'
  },

  CORDOVA_CONFIG_XML: 'config.xml',

  BUILD_OPTIONS: [
    'build-config',
    'destination',
    'release',
    'device',
    'emulator',
    'platform-options',
    'sass',
    'theme',
    'themes'
  ],

  SERVE_OPTIONS: [
    'browser',
    'build',
    'build-config',
    'destination',
    'device',
    'emulator',
    'livereload',
    'livereload-port',
    'platform-options',
    'release',
    'sass',
    'server-only',
    'server-port',
    'theme',
    'themes'
  ],

  CONFIG_SCRIPT_PATH: 'scripts/config',

  CONFIG_SCRIPT_PATH_BACKUP: 'scripts/grunt/config',

  BUILD_SCRIPT: 'oraclejet-build.js',

  SERVE_SCRIPT: 'oraclejet-serve.js',

  SUPPORTED_PLATFORMS: ['web', 'ios', 'android', 'windows']
};
