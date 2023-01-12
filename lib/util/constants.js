/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

/**
 * # Constants
 *
 */
const OMIT_COMPONENT_VERSION_FLAG = 'omit-component-version';

const SHARED_BUILD_AND_SERVE_OPTIONS = [
  'release',
  'sass',
  'nosass',
  'pcss',
  'device',
  'emulator',
  'destination',
  'build-config',
  'platform-options',
  'optimize',
  'theme',
  'themes',
  'svg',
  'user-options',
  'notscompile',
  'dbg',
  OMIT_COMPONENT_VERSION_FLAG
];

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
    'verbose',
    'installer'
  ],

  BUILD_OPTIONS: [
    'component',
    ...SHARED_BUILD_AND_SERVE_OPTIONS
  ],

  SERVE_OPTIONS: [
    'browser',
    'build',
    'livereload',
    'livereload-port',
    'server-only',
    'server-port',
    'watchInterval',
    ...SHARED_BUILD_AND_SERVE_OPTIONS
  ],

  SUPPORTED_PLATFORMS: ['web', 'ios', 'android', 'windows'],

  PATH_TO_HOOKS_CONFIG: 'scripts/hooks/hooks.json',

  APP_STAGED_THEMES_DIRECTORY: 'staged-themes',

  TOOLING_PATH: 'node_modules/@oracle/oraclejet-tooling',

  OJET_LOCAL_STORAGE_DIR: '.ojet',

  EXCHANGE_URL_FILE: 'exchange-url.json',

  EXCHANGE_GLOBAL_URL_KEY: 'global',

  BLANK_TEMPLATE: 'blank',

  NPM_TEMPLATES: ['blank', 'blank-ts', 'basic', 'basic-ts', 'basic-vdom', 'navbar', 'navbar-ts', 'navdrawer', 'navdrawer-ts'],

  ORACLEJET_PACKAGE_JSON_NAME: '@oracle/oraclejet',

  ORACLEJET_TOOLING_PACKAGE_JSON_NAME: '@oracle/oraclejet-tooling',

  OMIT_COMPONENT_VERSION_FLAG,

  APPLICATION_ARCHITECTURE: 'architecture',

  VDOM_ARCHITECTURE: 'vdom',

  MVVM_ARCHITECTURE: 'mvvm',

  SUPPORTED_HYBRID_PLATFORMS: ['android', 'ios', 'windows'],
  DEFAULT_INSTALLER: 'npm',
  DEFAULT_THEME: 'alta',
  DEFAULT_PCSS_THEME: 'web',
  DEFAULT_PCSS_NAME: 'redwood',
  PCSS_STABLE_FLAG: 'stable',
  PCSS_THEME_FLAG: 'basetheme',
  COMPONENT_JSON: 'component.json',
  JET_COMPOSITES: 'jet-composites',
  JET_COMPONENTS: 'jet_components',
  COMPONENT_FILES: ['component.json', 'loader.js', 'styles.css'],
  TSCONFIG_JSON: 'tsconfig.json',
  VCOMPONENT: 'vcomponent',
  MONO_PACK: 'mono-pack',
  RESOURCE_COMPONENT: 'resource',
  RESOURCE_COMPONENT_INDEX_FILE_CONTENT: '//Write your code here. In case you do not need this file, please remove it from the publicModules property list in your component.json file.\n',
  USE_GLOBAL_TOOLING: 'use-global-tooling',

  SUPPORTED_FLAGS: (namespace) => {
    const systemFlags = [
      'env',
      'resolved',
      'namespace',
      'help',
      'argv',
      'skip-cache',
      'skip-install',
      'app-name',
      'app-id',
      'insight',
      'hybrid',
      'platform',
      'platforms',
      'pack',
      'componentName',
      'basetheme'
    ];

    const hybridFlags = [
      'appid',
      'appId',
      'appname',
      'appName',
      'platform',
      'platforms'
    ];

    const appFlags = [
      'template',
      'norestore',
      'typescript',
      'pwa',
      'webpack',
      'vdom',
      'use-global-tooling',
      'installer'
    ];

    const restoreFlags = [
      'invokedByRestore'
    ];

    const addComponentFlags = [
      'type',
      'vcomponent',
      'withLoader'
    ];

    if (/hybrid/.test(namespace)) {
      // for hybrid and add-hybrid
      return systemFlags.concat(restoreFlags, hybridFlags, appFlags);
    } else if (/app/.test(namespace)) {
      // for app
      return systemFlags.concat(restoreFlags, appFlags);
    } else if (/restore/.test(namespace)) {
      // for restore
      return systemFlags.concat(restoreFlags, hybridFlags, appFlags);
    } else if (/add-component/.test(namespace)) {
      // for add component
      return systemFlags.concat(restoreFlags, addComponentFlags);
    }
    // add-theme, add-sass, no supported flag
    return systemFlags.concat(restoreFlags);
  }
};
