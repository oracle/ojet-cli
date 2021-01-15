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

const ORACLE_JET_CONFIG_FILE = 'oraclejetconfig.json';

module.exports =
{
  writeOracleJetConfigFile: function _writeOracleJetConfigFile(generator, utils) {
    const destinationRoot = path.resolve('.');
    const configPath = path.resolve(destinationRoot, ORACLE_JET_CONFIG_FILE);

    return new Promise((resolve) => {
      utils.log('Writing:', ORACLE_JET_CONFIG_FILE);

      // need to place the oracletjetconfig.json at origDestRoot

      fs.stat(configPath, (err) => {
        const generatorVersion = _getOracleJetGeneratorVersion();
        if (err) {
          utils.log(`${commonMessages.appendJETPrefix()}No config file. Writing the default config.`);
          fs.writeJSONSync(configPath, { generatorVersion }, { spaces: 2 });
        } else {
          const configJson = fs.readJSONSync(configPath);
          configJson.generatorVersion = generatorVersion;
          fs.writeJSONSync(configPath, configJson, { spaces: 2 });
          utils.log(`${commonMessages.appendJETPrefix() + ORACLE_JET_CONFIG_FILE} file exists. Checking config.`);
        }
        resolve();
      });
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

/*
 * Gets the generator version
 */
function _getOracleJetGeneratorVersion() {
  // We intend to read the top level package.json for the generator-oraclejet module.
  // Note this path to package.json depends on the location of this file within the
  // module (common/restore.js)
  return generatorJSON.version;
}

