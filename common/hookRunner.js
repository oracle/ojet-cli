/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const constants = require('../lib/util/constants');
const fs = require('fs');
const path = require('path');

module.exports = {
  runAfterAppCreateHook: function _runAfterAppCreateHook() {
    return new Promise((resolve, reject) => {
      // Get hooks config
      const hooksConfig = _getHooksConfigObj();
      // Get after_app_prepare hook's path
      const hookPath = hooksConfig.after_app_create;
      if (hookPath && fs.existsSync(path.resolve(hookPath))) {
        const hook = require(path.resolve(hookPath)); // eslint-disable-line
        // Execute hook
        hook()
          .then(() => resolve())
          .catch(err => reject(err));
      } else {
        console.warn('Hook \'after_app_create\' not defined.');
        resolve();
      }
    });
  },
  runAfterComponentCreateHook: function _runAfterComponentCreateHook(componentConfig) {
    return new Promise((resolve, reject) => {
      // Get hooks config
      const hooksConfig = _getHooksConfigObj();
      // Get after_app_prepare hook's path
      const hookPath = hooksConfig.after_component_create;
      if (hookPath && fs.existsSync(path.resolve(hookPath))) {
        const hook = require(path.resolve(hookPath)); // eslint-disable-line
        // Execute hook
        hook(componentConfig)
          .then(() => resolve())
          .catch(err => reject(err));
      } else {
        console.warn('Hook \'after_component_create\' not defined.');
        resolve();
      }
    });
  }
};

/**
 * ## _getHooksConfigObj
 * Reads the hooks.json file
 *
 * @private
 */
function _getHooksConfigObj() {
  const configFilePath = path.resolve(constants.PATH_TO_HOOKS_CONFIG);
  if (fs.existsSync(configFilePath)) {
    const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    let configFileContentAsJson = {};
    try {
      configFileContentAsJson = JSON.parse(configFileContent);
      // If came to here, then valid json
    } catch (e) {
      console.error(`Error: File '${configFilePath}' is not of type 'json'.`);
      process.exit(1);
    }
    return configFileContentAsJson.hooks || {};
  }
  return {};
}
