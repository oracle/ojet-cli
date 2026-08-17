/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const commonTemplateHandler = require('./common');
const fs = require('fs-extra');
const path = require('path');

module.exports = {

  handle: function _handle(generator, templatePath, destination) {
    return new Promise((resolve, reject) => {
      _copyLocalTemplate(templatePath, destination)
        .then(() => {
          resolve(generator);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

function _copyLocalTemplate(templatePath, destination) {
  try {
    if (fs.statSync(templatePath).isDirectory()) {
      const newTemplateFormat = fs.existsSync(path.join(templatePath, 'src'));
      // JET-79009: Preserve symlinks in user-supplied local directory templates.
      // Dereferencing them can copy sensitive files from outside the template
      // into the generated app.
      fs.copySync(templatePath, newTemplateFormat ? path.join(destination, '..') : destination, { dereference: false });
    } else if (path.extname(templatePath) === '.zip') {
      commonTemplateHandler._handleZippedTemplateArchive(templatePath, destination);
    } else {
      throw new Error(`template path ${templatePath} is not valid`);
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
