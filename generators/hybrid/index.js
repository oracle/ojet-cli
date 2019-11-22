/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const exec = require('child_process').exec;
const paths = require('../../util/paths');
const path = require('path');
const templateHandler = require('../../common/template/');
const common = require('../../common');
const commonComponent = require('../../common/component');
const commonHookRunner = require('../../common/hookRunner');
const commonHybrid = require('../../hybrid');
const commonMessages = require('../../common/messages');
const commonRestore = require('../../common/restore');
const cordovaHelper = require('../../hybrid/cordova');
const platformsHelper = require('../../hybrid/platforms');
const fs = require('fs-extra');
const scopesApp = require('../../lib/scopes/app');

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

function _writeTemplate(generator, utils) {
  return new Promise((resolve, reject) => {
    const appDir = generator.appDir;
    const appDirectory = path.resolve(appDir, 'src');

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
 * # Entry point for 'app hybrid' task
 *
 * @public
 * @param {Array} parameters
 * @param {Object} options
 * @param {utils} utility module
 */
module.exports = function (parameters, opt, utils) {
  const app = {
    options: Object.assign({ namespace: 'hybrid' }, opt),
    appDir: opt.component ? opt.component : parameters
  };

  common.validateFlags(app)
  .then(() => common.validateAppDirNotExistsOrIsEmpty(app))
  .then((validAppDir) => {
    app.appDir = path.basename(validAppDir);

    commonHybrid.setupHybridEnv(app);
    fs.mkdirSync(path.resolve(app.appDir));
  })
  .then(() => platformsHelper.getPlatforms(app, utils))
  .then(() => common.switchToAppDirectory(app))
  .then(() => common.writeCommonTemplates())
  .then(() => common.writeGitIgnore())
  .then(() => cordovaHelper.create(app))
  .then(() => commonHybrid.copyResources())
  .then(() => commonHybrid.removeExtraCordovaFiles())
  .then(() => common.switchFromAppDirectory())
  .then(() => _writeTemplate(app, utils))
  .then(() => common.switchToAppDirectory(app))
  .then(() => common.updatePackageJSON(app))
  .then(() => platformsHelper.addPlatforms(app, utils))
  .then(() => commonHybrid.updateConfigXml(app))
  .then(() => {
    if (app.options.component) {
      utils.log(`Your component ${app.options.component} project is scaffolded. Performing npm install may take a bit.`);
    } else {
      utils.log(commonMessages.scaffoldComplete());
    }

    if (!app.options.norestore) {
      commonRestore.npmInstall(app)
      .then(() => commonRestore.writeOracleJetConfigFile(app, utils))
      .then(() => commonHybrid.copyHooks())
      .then(() => _invokeCordovaPrepare(app))
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
