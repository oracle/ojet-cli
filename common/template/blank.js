/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');

module.exports =
{
  BLANK_TEMPLATE: 'blank',

  handle: function _handle(generator, destination, templateType) {
    let templatePath;

    if (templateType === 'web') {
      templatePath = '../../generators/app/templates/';
    } else {
      templatePath = '../../generators/hybrid/templates/';
    }

    templatePath += this.BLANK_TEMPLATE;
    const source = path.resolve(__dirname, templatePath);

    return new Promise((resolve, reject) => {
      try {
        fs.copySync(source, destination, { clobber: true });
        resolve(generator);
      } catch (err) {
        return reject(err);
      }
      return resolve();
    });
  }
};
