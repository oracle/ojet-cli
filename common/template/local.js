/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const Admzip = require('adm-zip');

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
        const zip = new Admzip(templatePath);
        zip.extractAllTo(destination, true);
      } else {
        throw new Error(`template path ${templatePath} is not valid`);
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
