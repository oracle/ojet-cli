/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
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
      _copyLocalTemplate(generator, templatePath, destination)
        .then(() => {
          resolve(generator);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

function _copyLocalTemplate(generator, templatePath, destination) {
  return new Promise((resolve, reject) => {
    try {
      if (fs.statSync(templatePath).isDirectory()) {
        fs.copySync(templatePath, destination);
      } else if (path.extname(templatePath) === '.zip') {
        commonTemplateHandler._handleZippedTemplateArchive(templatePath, destination);
      } else {
        throw new Error(`template path ${templatePath} is not valid`);
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
