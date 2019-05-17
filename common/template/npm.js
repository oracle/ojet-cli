/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;

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

  fs.copySync(src, destination);
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
  return new Promise((resolve, reject) => {
    const cmd = `npm install ${npmUrl}`;
    const appDir = path.resolve(generator.appDir);
    fs.ensureDirSync(path.join(appDir, 'node_modules'));
    exec(cmd, { cwd: appDir }, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}
