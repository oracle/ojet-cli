/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

// constants to be used for the generator

module.exports = {
  SUPPORTED_PLATFORMS: ['android', 'ios', 'windows', 'web'],
  SUPPORTED_HYBRID_PLATFORMS: ['android', 'ios', 'windows'],
  CORDOVA_CONFIG_XML: 'config.xml',
  DEFAULT_THEME: 'alta',
  DEFAULT_PCSS_THEME: 'web',
  DEFAULT_PCSS_NAME: 'redwood',
  APP_CONFIG_JSON: 'oraclejetconfig.json',
  COMPONENT_JSON: 'component.json',
  JET_COMPOSITES: 'jet-composites',
  COMPONENT_FILES: ['component.json', 'loader.js', 'styles.css'],
  PATH_TO_HOOKS_CONFIG: 'scripts/hooks/hooks.json',
  TSCONFIG_JSON: 'tsconfig.json',
  VCOMPONENT: 'vcomponent',
  APP_TYPE:
  {
    HYBRID: 'hybrid',
    WEB: 'web'
  },

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
      'componentName'
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
      'pwa'
    ];

    const restoreFlags = [
      'invokedByRestore',
    ];

    const addComponentFlags = [
      'type',
      'vcomponent'
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
