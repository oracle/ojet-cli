/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const common = require('../../common');
const commonComponent = require('../../common/component');
const commonHookRunner = require('../../common/hookRunner');
const commonMessages = require('../../common/messages');
const commonRestore = require('../../common/restore');
const templateHandler = require('../../common/template');
const fs = require('fs');
const path = require('path');
const scopesApp = require('../../lib/scopes/app');

function _writeTemplate(generator, utils) {
  return new Promise((resolve, reject) => {
    const appDirectory = path.resolve(path.join(generator.appDir, 'src'));
    templateHandler.handleTemplate(generator, utils, appDirectory)
      .then(() => commonComponent.writeComponentTemplate(generator, utils))
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * # Entry point for 'app' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 * @param {utils} utility module
 */
module.exports = function (parameters, opt, utils) {
  const app = {
    options: Object.assign({ namespace: 'app' }, opt),
    appDir: opt.component ? opt.component : parameters
  };
  common.validateFlags(app)
  .then(() => common.validateAppDirNotExistsOrIsEmpty(app))
  .then((validAppDir) => {
    app.appDir = path.basename(validAppDir);
    app.options.appname = app.appDir;
    fs.mkdirSync(path.resolve(app.appDir));
  })
  .then(() => common.switchToAppDirectory(app))
  .then(() => common.writeCommonTemplates())
  .then(() => common.writeGitIgnore())
  .then(() => common.switchFromAppDirectory())
  .then(() => _writeTemplate(app, utils))
  .then(() => common.switchToAppDirectory(app))
  .then(() => common.updatePackageJSON(app))
  .then(() => {
    if (app.options.component) {
      utils.log(`Your component ${app.options.component} project is scaffolded. Performing npm install may take a bit.`);
    } else {
      utils.log(commonMessages.scaffoldComplete());
    }

    if (!app.options.norestore) {
      commonRestore.npmInstall(app)
      .then(() => commonRestore.writeOracleJetConfigFile(app, utils))
      .then(() => commonHookRunner.runAfterAppCreateHook())
      .then(() => {
        if (app.options.typescript) {
          return scopesApp.addTypescript();
        }
        return Promise.resolve();
      })
      .then(() => utils.log(commonMessages.restoreComplete(
        app.options.invokedByRestore, app.appDir)));
    }
  })
  .catch((err) => {
    if (err) {
      utils.log(err);
      process.exit(1);
    }
  });
};
