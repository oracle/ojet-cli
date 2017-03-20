/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');

module.exports = {
  isSuccess: function _isSuccess(std) {
    return std.indexOf('without errors') > -1;
  },

  buildSuccess: function _isSuccess(std) {
    return std.indexOf('BUILD SUCCE') > -1 || std.indexOf('Code Sign error');
  },

  norestoreSuccess: function _yoSuccess(std) {
    return std.indexOf('Oracle JET Error') <= -1;
  },
  noError: function _noError(std) {
    return !(/error/i.test(std));
  },
  bowerCopySuccess: function _bowerCopySuccess(std) {
    return std.indexOf('All modules accounted') > -1;
  },

  isWindows: function _isWindows(OS) {
    return /^Windows/.test(OS);
  },

  getJetVersion: function _getJetVersion(filePath, file) {
    return fs.readdirSync(path.join(filePath, file));
  },

  getPlatform: function _getPlatform(OS) {
    const isWindows = /^Windows/.test(OS);
    return isWindows ? 'android' : 'ios';
  },

  isCheckedOut: function (std) {
    return std.indexOf('Checked out revision') > -1;
  },

  matchInArray: function (string, arrayOfStrings) {
    for (let i = 0; i < arrayOfStrings.length; i += 1) {
      if (arrayOfStrings[i].match(new RegExp(string))) {
        return true;
      }
    }
    return false;
  },

  isCordovaSuccess: function _isCordovaSuccess(std) {
    return (std.indexOf('BUILD SUCCESSFUL') > -1);
  },

  isNoRestoreTest: function _isNoRestoreTest() {
    return process.env.expressTest === 'true';
  }
};
