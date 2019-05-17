/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const fetchZip = require('../../util/fetchZip');
const path = require('path');

module.exports = {

  handle: function _handle(generator, template, destination) {
    const temp = path.resolve(`${generator.appDir}/temp`);

    return new Promise((resolve, reject) => {
      fetchZip(template)
        .then((values) => {
          _processFetchedTemplateZip(values, temp, destination);
          return resolve(generator);
        })
        .catch(err => reject(err));
    });
  }
};

function _processFetchedTemplateZip(values, temp, destination) {
  fs.mkdirsSync(temp);
  values.extractAllTo(temp);
  fs.copySync(temp, destination);
  fs.removeSync(temp);
}
