/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
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

  APP_PROTECTED_OBJECTS: [
    '.gitignore',
    'hybrid/', // Disable overwriting with an empty directory
    'hybrid/config.xml',
    'oraclejetconfig.json',
    'package.json'
  ],

  CORDOVA_CONFIG_XML: 'config.xml',

  SYSTEM_OPTIONS: [
    'verbose'
  ],

  BUILD_OPTIONS: [
    'build-config',
    'destination',
    'release',
    'device',
    'emulator',
    'platform-options',
    'optimize',
    'sass',
    'theme',
    'themes',
    'svg',
    'component',
    'theming',
    'user-options',
    'notscompile'
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
    'optimize',
    'platform-options',
    'release',
    'sass',
    'server-only',
    'server-port',
    'theme',
    'themes',
    'svg',
    'user-options',
    'notscompile'
  ],

  CONFIG_SCRIPT_PATH: 'scripts/config',

  BUILD_SCRIPT: 'oraclejet-build.js',

  SERVE_SCRIPT: 'oraclejet-serve.js',

  SUPPORTED_PLATFORMS: ['web', 'ios', 'android', 'windows'],

  PATH_TO_HOOKS_CONFIG: 'scripts/hooks/hooks.json',

  TSCONFIG_JSON: 'tsconfig.json',

  APP_STAGED_THEMES_DIRECTORY: 'staged-themes'
};
