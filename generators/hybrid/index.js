/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const exec = require('child_process').exec;
const paths = require('../../lib/util/paths');
const path = require('path');
const templateHandler = require('../../common/template/');
const common = require('../../common');
const commonHookRunner = require('../../common/hookRunner');
const commonHybrid = require('../../hybrid');
const commonMessages = require('../../common/messages');
const commonRestore = require('../../common/restore');
const cordovaHelper = require('../../hybrid/cordova');
const platformsHelper = require('../../hybrid/platforms');
const utils = require('../../lib/util/utils');
const fs = require('fs-extra');

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 * 2) perform cordova create
 * 3) perform cordova add
 */

function _invokeCordovaPrepare(generator) {
  const isIOS = generator.options.platform === 'ios' ||
    (generator.options.platforms && generator.options.platforms.indexOf('ios') !== -1);
  if (!isIOS && !generator.options.invokedByRestore) return Promise.resolve();

  const cwd = paths.getConfiguredPaths(path.resolve('.')).stagingHybrid;
  fs.ensureDirSync(path.join(cwd, 'www'));

  console.log('Restoring hybrid plugins and platforms....');
  return new Promise((resolve, reject) => {
    const cmd = 'cordova prepare';
    const cmdOpts = { cwd, stdio: [0, 'pipe', 'pipe'], maxBuffer: 1024 * 20000 };
    exec(cmd, cmdOpts, (error) => {
      // When www/index.html files are missing, cordova reports error
      if (error && !/index\.html/.test(error)) {
        reject(error);
      }
      resolve();
    });
  });
}

function _writeTemplate(generator) {
  return new Promise((resolve, reject) => {
    const appDir = generator.appDir;
    const appDirectory = path.resolve(appDir, 'src');
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
 * # Entry point for 'app hybrid' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 */
module.exports = function (parameters, opt) {
  const app = {
    options: Object.assign({ namespace: 'hybrid' }, opt),
    appDir: parameters
  };

  return common.validateFlags(app)
    .then(() => common.validateAppDirNotExistsOrIsEmpty(app))
    .then((validAppDir) => {
      app.appDir = path.basename(validAppDir);

      commonHybrid.setupHybridEnv(app);
      fs.mkdirSync(path.resolve(app.appDir));
    })
    .then(() => platformsHelper.getPlatforms(app))
    .then(() => common.switchToAppDirectory(app))
    .then(() => common.writeCommonTemplates(app))
    .then(() => common.writeGitIgnore())
    .then(() => cordovaHelper.create(app))
    .then(() => commonHybrid.copyResources())
    .then(() => commonHybrid.removeExtraCordovaFiles())
    .then(() => common.switchFromAppDirectory())
    .then(() => _writeTemplate(app))
    .then(() => common.switchToAppDirectory(app))
    .then(() => common.updatePackageJSON(app))
    .then(() => platformsHelper.addPlatforms(app))
    .then(() => commonHybrid.updateConfigXml(app))
    .then(() => {
      utils.log(commonMessages.scaffoldComplete());
      if (!app.options.norestore) {
        return commonRestore.npmInstall(app, opt)
          .then(() => commonHybrid.copyHooks())
          .then(() => commonRestore.writeOracleJetConfigFile())
          .then(() => _invokeCordovaPrepare(app))
          .then(() => common.addTypescript(app, opt))
          .then(() => commonHookRunner.runAfterAppCreateHook())
          .then(() => utils.log(commonMessages.restoreComplete(
            app.options.invokedByRestore,
            app.appDir
          )));
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
