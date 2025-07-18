/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
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

  PATH_MAPPING_JSON: 'path_mapping.json',

  CUSTOM_JSDOC: {
    DIST: 'dist',
    FOLDER: 'jsdoc',
    API_TEMPLATES: 'apidoc_templates'
  },

  APP_TYPE: {
    WEB: 'web'
  },

  APP_PROTECTED_OBJECTS: [
    '.gitignore',
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
    'watch-files',
    'livereload',
    'livereload-port',
    'server-only',
    'server-port',
    'server-url',
    'watchInterval',
    ...SHARED_BUILD_AND_SERVE_OPTIONS
  ],

  SUPPORTED_PLATFORMS: ['web', 'ios', 'android', 'windows'],

  PATH_TO_HOOKS_CONFIG: 'scripts/hooks/hooks.json',

  APP_STAGED_THEMES_DIRECTORY: 'staged-themes',

  TOOLING_PATH: 'node_modules/@oracle/oraclejet-tooling',

  TEMPLATES_PATH: 'node_modules/@oracle/oraclejet-templates',

  OJET_LOCAL_STORAGE_DIR: '.ojet',

  EXCHANGE_URL_FILE: 'exchange-url.json',

  EXCHANGE_GLOBAL_URL_KEY: 'global',

  EXCHANGE_URL_PARAM: 'exchange-url',

  BLANK_TEMPLATE: 'blank',

  NPM_TEMPLATES: ['blank', 'blank-ts', 'basic', 'basic-ts', 'basic-vdom', 'navbar', 'navbar-ts', 'navdrawer', 'navdrawer-ts', 'webdriver-ts'],

  TEMPLATES_NO_COPY_PACKAGE: ['webdriver-ts'],

  ORACLEJET_PACKAGE_JSON_NAME: '@oracle/oraclejet',

  ORACLEJET_TOOLING_PACKAGE_JSON_NAME: '@oracle/oraclejet-tooling',

  OMIT_COMPONENT_VERSION_FLAG,

  APPLICATION_ARCHITECTURE: 'architecture',

  VDOM_ARCHITECTURE: 'vdom',

  MVVM_ARCHITECTURE: 'mvvm',

  DEFAULT_INSTALLER: 'npm',
  DEFAULT_PCSS_THEME: 'web',
  DEFAULT_PCSS_NAME: 'redwood',
  PCSS_STABLE_FLAG: 'stable',
  PCSS_THEME_FLAG: 'basetheme',
  COMPONENT_JSON: 'component.json',
  JET_COMPOSITES: 'jet-composites',
  JET_COMPONENTS: 'jet_components',
  EXCHANGE_COMPONENTS: 'exchange_components',
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
      'pack',
      'componentName',
      'basetheme',
      'verbose'
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
      'invokedByRestore',
      'exchange-only'
    ];

    const addComponentFlags = [
      'type',
      'vcomponent',
      'withLoader'
    ];

    if (/app/.test(namespace)) {
      // for app
      return systemFlags.concat(restoreFlags, appFlags);
    } else if (/restore/.test(namespace)) {
      // for restore
      return systemFlags.concat(restoreFlags, appFlags);
    } else if (/add-component/.test(namespace)) {
      // for add component
      return systemFlags.concat(restoreFlags, addComponentFlags);
    }
    // no supported flag
    return systemFlags.concat(restoreFlags);
  }
};
