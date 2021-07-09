/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const common = require('../../common');
const commonHookRunner = require('../../common/hookRunner');
const commonMessages = require('../../common/messages');
const commonRestore = require('../../common/restore');
const templateHandler = require('../../common/template');
const scopesApp = require('../../lib/scopes/app');
const fs = require('fs');
const path = require('path');

function _writeTemplate(generator, utils) {
  return new Promise((resolve, reject) => {
    const appDirectory = path.resolve(path.join(generator.appDir, 'src'));
    templateHandler.handleTemplate(generator, utils, appDirectory)
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
    appDir: parameters
  };
  return common.validateFlags(app)
    .then(() => common.validateAppDirNotExistsOrIsEmpty(app))
    .then((validAppDir) => {
      app.appDir = path.basename(validAppDir);
      app.options.appname = app.appDir;
      fs.mkdirSync(path.resolve(app.appDir));
    })
    .then(() => common.switchToAppDirectory(app))
    .then(() => common.writeCommonTemplates(app))
    .then(() => common.writeGitIgnore())
    .then(() => common.switchFromAppDirectory())
    .then(() => _writeTemplate(app, utils))
    .then(() => common.switchToAppDirectory(app))
    .then(() => common.updatePackageJSON(app))
    .then(() => {
      utils.log(commonMessages.scaffoldComplete());
      if (!app.options.norestore) {
        return commonRestore.npmInstall(app)
          .then(() => commonRestore.writeOracleJetConfigFile(app, utils))
          .then(() => common.addTypescript(app))
          .then(() => common.addpwa(app))
          .then(() => common.addwebpack(app))
          .then(scopesApp.addComponents)
          .then(commonHookRunner.runAfterAppCreateHook)
          .then(() => {
            utils.log(
              commonMessages.restoreComplete(
                app.options.invokedByRestore,
                app.appDir
              )
            );
          });
      }
      return Promise.resolve();
    })
    .catch((err) => {
      if (err) {
        utils.log.error(err);
      }
      return Promise.reject();
    });
};
