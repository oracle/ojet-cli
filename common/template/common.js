/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const Admzip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const graphics = require('../../hybrid/graphics');
const utils = require('../../lib/util/utils');
const constants = require('../../lib/util/constants');

/**
 * Inject template files into scaffolded application depending
 * on what type of template was used
 *
 * @param {string} options.generator context
 * @param {string} options.namespace app | hybrid
 */
function _injectTemplateFiles({ generator, namespace }) {
  const pathToTemplates = path.resolve(__dirname, `../../generators/${namespace}/templates/common`);
  const pathToApp = path.resolve(generator.appDir);
  const template = generator.options.template || constants.BLANK_TEMPLATE;
  function _templateFileFilter(file) {
    const screenPath = path.join(graphics.PATH, 'screen');
    const iconPath = path.join(graphics.PATH, 'icon');
    return !file.includes(screenPath) && !file.includes(iconPath);
  }
  function _getPathToFileDest(file) {
    return path.join(
      pathToApp,
      path.relative(pathToTemplates, file)
    );
  }
  function _copyFile(file) {
    fs.copySync(
      file,
      _getPathToFileDest(file)
    );
  }
  const filesToCopy = utils
    .readdirSync({ dir: pathToTemplates, recursive: true })
    .filter(_templateFileFilter);
  if (utils.isNPMTemplate(template)) {
    // is NPM template, filter out /src/* files since NPM templates
    // have all the required files and then inject remaining files from
    // templates folder into the app
    filesToCopy
      .filter((file) => {
        const filePathInApp = path.relative(pathToTemplates, file);
        return !filePathInApp.startsWith('src');
      })
      .forEach(_copyFile);
  } else {
    // not NPM template, selectively inject files from templates folder
    const pathToAppPackageJson = path.join(pathToApp, 'package.json');
    // check if template has package.json to determine whether we need to
    // inspect its dependencies. if it doesn't have one, we'll inject the
    // default package.json which has all the dependencies needed
    const appHasPackageJson = fs.existsSync(pathToAppPackageJson);
    filesToCopy
      .filter(file => !fs.existsSync(_getPathToFileDest(file)))
      .forEach(_copyFile);
    if (appHasPackageJson) {
      // didn't copy over default package.json, check if app's package.json has
      // oraclejet & oraclejet-tooling entries
      const {
        dependencies: templateDependencies,
        devDependencies: templateDevDependencies
      } = fs.readJSONSync(path.join(pathToTemplates, 'package.json'));
      const appPackageJson = fs.readJSONSync(pathToAppPackageJson);
      // eslint-disable-next-line no-multi-assign
      const appDependencies = appPackageJson.dependencies = appPackageJson.dependencies || {};
      // eslint-disable-next-line no-multi-assign, max-len
      const appDevDependencies = appPackageJson.devDependencies = appPackageJson.devDependencies || {};
      const {
        ORACLEJET_PACKAGE_JSON_NAME: oraclejet,
        ORACLEJET_TOOLING_PACKAGE_JSON_NAME: oraclejetTooling
      } = constants;
      let updatedAppPackageJson = false;
      if (!appDependencies[oraclejet]) {
        // app's package.json does not have an entry for @oracle/oraclejet in depedencies.
        // set it to the value in the template package.json
        appDependencies[oraclejet] = templateDependencies[oraclejet];
        updatedAppPackageJson = true;
      }
      if (!appDevDependencies[oraclejetTooling]) {
        // app's package.json does not have an entry for @oracle/oraclejet-tooling in
        // devDependencies set it to the value in the template package.json
        appDevDependencies[oraclejetTooling] = templateDevDependencies[oraclejetTooling];
        updatedAppPackageJson = true;
      }
      if (updatedAppPackageJson) {
        fs.writeJSONSync(pathToAppPackageJson, appPackageJson, { spaces: 2 });
      }
    }
  }
}

module.exports =
{
  handle: function _handle(baseTemplateHandler, namespace) {
    return new Promise((resolve, reject) => {
      baseTemplateHandler
        .then((generator) => {
          _injectTemplateFiles({
            generator,
            namespace
          });
          resolve(generator);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  /**
   * ## handleZippedTemplateArchive
   * Unarchives provided zip (zip on given path) and merges with the default app template
   *
   * @private
   * @param {string || binary data buffer} template
   * @param {string} destination - output path
   */
  _handleZippedTemplateArchive: ((template, destination) => {
    const zip = new Admzip(template);
    const zipEntries = zip.getEntries();

    let isTemplateInNewFormat = false;

    for (let i = 0; i < zipEntries.length; i += 1) {
      if (zipEntries[i].entryName.startsWith('src/')) {
        isTemplateInNewFormat = true;
        break;
      }
    }

    if (isTemplateInNewFormat) {
      // Unpack the archive to the app root
      zipEntries.forEach((zipEntry) => {
        const entryName = zipEntry.entryName;
        zip.extractEntryTo(entryName, path.join(destination, '..'), true, true);
      });
    } else {
      // Unpack the archive content to 'src/' except of 'scripts'
      utils.log.warning('No "src" directory found. This might indicate you are using deprecated format of an app template.');

      zipEntries.forEach((zipEntry) => {
        const entryName = zipEntry.entryName;
        if (entryName.startsWith('scripts/')) {
          zip.extractEntryTo(entryName, path.join(destination, '..'), true, true);
        } else {
          zip.extractEntryTo(entryName, destination, true, true);
        }
      });
    }
  })
};
