/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const CONST = require('../../lib/utils.constants');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const utils = require('../../lib/utils');

module.exports = {

  handle: function _handle(generator, npmUrl, destination, templateSpec) {
    return new Promise((resolve, reject) => {
      _installNpmTemplate(generator, npmUrl)
        .then(() => {
          _copyNpmTemplate(generator, templateSpec, destination);
          return resolve(generator);
        })
        .catch(err => reject(err));
    });
  }
};

/**
 * ## _copyNpmTemplate
 * Copies template files.
 *
 * The templates are found in the installed oraclejet-templates module.
 * The source template directory is determined as follows:
 * 1. check if the templateName/type directory exists in oraclejet-templates
 *    e.g. 'navbar/hybrid'.
 * 2. if not, use the content of the templateName directory (only common content
 *    exists for both 'web' and 'hybrid' templates).
 *
 * @param {Object} generator  - parent generator
 * @param {Object} templateSpec - template specification
 * @param {string} destination  - destination path
 */
function _copyNpmTemplate(generator, templateSpec, destination) {
  const templateRoot = path.join(path.resolve(generator.appDir),
    'node_modules', '@oracle/oraclejet-templates');
  const src = _getTemplateFromTypeSpecificDirectory(templateRoot, templateSpec) ||
              _getTemplateFromGenericDirectory(templateRoot, templateSpec);

  if (!src) {
    const msg = `${templateSpec.name}:${templateSpec.type}`;
    throw new Error(`Could not find source for template: ${msg}`);
  }

  // 1. Check if top level sources contain 'src/' directory
  const sourceTopLevelEntries = fs.readdirSync(src);
  let isTemplateInNewFormat = false;

  for (let i = 0; i < sourceTopLevelEntries.length; i += 1) {
    if (sourceTopLevelEntries[i] === 'src') {
      isTemplateInNewFormat = true;
      break;
    }
  }

  if (!isTemplateInNewFormat) {
    utils.log.warning('No "src" directory found. This might indicate you are using deprecated format of an app template.');
  }

  const entryFilter = (entryFullPath) => {
    const entryName = entryFullPath.split(`${templateSpec.name}/${templateSpec.type}/`).pop();

    if (isTemplateInNewFormat) {
      // Unpack the archive to the app root except of protected objects
      if (CONST.APP_PROTECTED_OBJECTS.indexOf(entryName) === -1) {
        fs.copySync(entryFullPath, path.join(destination, '..'));
      }
      return false;
    }
    // Unpack the archive content to 'src/' except of 'scripts/'
    if (entryName.startsWith('scripts/')) {
      // Exception, copy to app root
      fs.copySync(entryFullPath, path.join(destination, '..'));
      return false;
    }
    return true;
  };

  // 2. Process via copySync entryFilter. Apply logic similar to zipHandler
  // https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy-sync.md
  fs.copySync(src, destination, { filter: entryFilter });
}

function _getTemplateFromTypeSpecificDirectory(templateRoot, templateSpec) {
  const src = path.join(templateRoot, templateSpec.name, templateSpec.type);
  if (!_checkDirExists(src)) {
    return null;
  }
  return src;
}

function _getTemplateFromGenericDirectory(templateRoot, templateSpec) {
  const src = path.join(templateRoot, templateSpec.name);
  if (!_checkDirExists(src)) {
    return null;
  }
  return src;
}

function _checkDirExists(filePath) {
  try {
    // check if the directory exists
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

function _installNpmTemplate(generator, npmUrl) {
  return new Promise((resolve) => {
    const cmd = `npm install ${npmUrl}`;
    try {
      const appDir = path.resolve(generator.appDir);
      fs.ensureDirSync(path.join(appDir, 'node_modules'));
      execSync(cmd, { cwd: appDir, stdio: 'ignore' });
    } catch (err) {
      utils.log.error(err);
    }
    resolve();
  });
}
