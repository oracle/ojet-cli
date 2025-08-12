/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');
const commonMessages = require('./messages');
const constants = require('../lib/util/constants');
const utils = require('../lib/util/utils');

module.exports =
{
  writeOracleJetConfigFile: function _writeOracleJetConfigFile() {
    const destinationRoot = path.resolve('.');
    const configPath = path.resolve(destinationRoot, constants.APP_CONFIG_JSON);
    let configJson;
    if (!fs.existsSync(configPath)) {
      utils.log(`${commonMessages.appendJETPrefix()}No ${constants.APP_CONFIG_JSON}, writing default`);
      configJson = utils.readJsonAndReturnObject(path.join(
        __dirname,
        '../../template/common',
        constants.APP_CONFIG_JSON
      ));
    } else {
      utils.log(`${commonMessages.appendJETPrefix() + constants.APP_CONFIG_JSON} file exists`);
      configJson = utils.readJsonAndReturnObject(configPath);
    }
    fs.writeFileSync(configPath, JSON.stringify(configJson, null, 2));
    return Promise.resolve();
  },

  npmInstall: function _npmInstall(app, opt) {
    const installer = utils.getInstallerCommand(opt);
    const configPath = path.join(process.cwd(), constants.APP_CONFIG_JSON);
    let configJson;

    if (fs.existsSync(configPath)) {
      configJson = utils.readJsonAndReturnObject(configPath);
    }

    const { enableLegacyPeerDeps } = configJson || {};

    let command = `${installer.installer} ${installer.verbs.install}`;

    if (enableLegacyPeerDeps && installer.installer === 'npm') {
      command += ` ${installer.flags.legacy}`; // putting extra space to ensure the flag is properly appended
    }

    fs.ensureDirSync(path.join('node_modules'));
    execSync(command, null);
    return Promise.resolve();
  }
};

