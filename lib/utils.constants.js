/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

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
    'nosass',
    'sass',
    'theme',
    'themes',
    'svg',
    'component',
    'pcss',
    'user-options',
    'notscompile',
    'dbg'
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
    'nosass',
    'sass',
    'pcss',
    'server-only',
    'server-port',
    'theme',
    'themes',
    'svg',
    'user-options',
    'notscompile',
    'dbg'
  ],

  CONFIG_SCRIPT_PATH: 'scripts/config',

  BUILD_SCRIPT: 'oraclejet-build.js',

  SERVE_SCRIPT: 'oraclejet-serve.js',

  SUPPORTED_PLATFORMS: ['web', 'ios', 'android', 'windows'],

  PATH_TO_HOOKS_CONFIG: 'scripts/hooks/hooks.json',

  TSCONFIG_JSON: 'tsconfig.json',

  APP_STAGED_THEMES_DIRECTORY: 'staged-themes',

  TOOLING_PATH: 'node_modules/@oracle/oraclejet-tooling',

  OJET_LOCAL_STORAGE_DIR: '.ojet',

  EXCHANGE_URL_FILE: 'exchange-url.json',

  EXCHANGE_GLOBAL_URL_KEY: 'global',

  BLANK_TEMPLATE: 'blank',

  NPM_TEMPLATES: ['blank', 'blank-ts', 'basic', 'basic-ts', 'navbar', 'navbar-ts', 'navdrawer', 'navdrawer-ts'],

  ORACLEJET_PACKAGE_JSON_NAME: '@oracle/oraclejet',

  ORACLEJET_TOOLING_PACKAGE_JSON_NAME: '@oracle/oraclejet-tooling'
};
