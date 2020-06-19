/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const path = require('path');
const fs = require('fs-extra');

module.exports =
{
  getDirectories(source) {
    // util function to get directories listing
    return fs.readdirSync(source).filter(file =>
      fs.statSync(path.join(source, file)).isDirectory());
  },
  fsExistsSync(filePath) {
    try {
      fs.statSync(filePath);
      return true;
    } catch (err) {
      // file/directory does not exist
      return false;
    }
  }
};

