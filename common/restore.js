/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');
const commonMessages = require('./messages');
const generatorJSON = require('../package.json');
const CONSTANTS = require('../lib/utils.constants');

module.exports =
{
  writeOracleJetConfigFile: function _writeOracleJetConfigFile(generator, utils) {
    const destinationRoot = path.resolve('.');
    const configPath = path.resolve(destinationRoot, CONSTANTS.APP_CONFIG_JSON);
    return new Promise((resolve) => {
      const generatorVersion = generatorJSON.version;
      let configJson;
      if (!fs.existsSync(configPath)) {
        utils.log(`${commonMessages.appendJETPrefix()}No ${CONSTANTS.APP_CONFIG_JSON}, writing default`);
        configJson = utils.readJsonAndReturnObject(path.join(
          __dirname,
          '../../template/common',
          CONSTANTS.APP_CONFIG_JSON
        ));
      } else {
        utils.log(`${commonMessages.appendJETPrefix() + CONSTANTS.APP_CONFIG_JSON} file exists, updating generatorVersion`);
        configJson = utils.readJsonAndReturnObject(configPath);
      }
      configJson.generatorVersion = generatorVersion;
      fs.writeFileSync(configPath, JSON.stringify(configJson, null, 2));
      resolve();
    });
  },

  npmInstall: function _npmInstall() {
    return new Promise((resolve) => {
      const cmd = 'npm install';
      fs.ensureDirSync(path.join('node_modules'));
      execSync(cmd, null);
      resolve();
    });
  }
};

