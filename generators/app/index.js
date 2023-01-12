/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
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
const utils = require('../../lib/util/utils');
const fs = require('fs');
const path = require('path');

function _writeTemplate(generator) {
  return new Promise((resolve, reject) => {
    const appDirectory = path.resolve(path.join(generator.appDir, 'src'));
    templateHandler.handleTemplate(generator, appDirectory)
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
 */
module.exports = function (parameters, opt) {
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
    .then(() => _writeTemplate(app))
    .then(() => common.switchToAppDirectory(app))
    .then(() => common.updatePackageJSON(app))
    .then(() => {
      utils.log(commonMessages.scaffoldComplete());
      if (!app.options.norestore) {
        return commonRestore.npmInstall(app, opt)
          .then(() => commonRestore.writeOracleJetConfigFile())
          .then(() => common.addTypescript(app, opt))
          .then(() => common.addpwa(app))
          .then(() => common.addwebpack(app, opt))
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
