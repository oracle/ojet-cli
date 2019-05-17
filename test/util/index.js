/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';
//common helpers for generator tests
var fs = require('fs-extra');
var path = require('path');
var	net = require('net');
module.exports = {

  isSuccess: function _isSuccess(std)
  { 
  	return (std.indexOf("without errors") > -1 ? true : false);
  },

  buildSuccess: function _isSuccess(std)
  { 
    return (std.indexOf("BUILD SUCCE") > -1 || std.indexOf('Code signing') > -1 || std.indexOf("Code Sign") > -1);
  },

  norestoreSuccess: function _yoSuccess(std)
  {
    return (std.indexOf("Oracle JET Error") > -1 ? false : true);
  },   
  noError: function _noError(std)
  {
    return !(/error/i.test(std));
  },  
  bowerCopySuccess: function _bowerCopySuccess(std)
  {
    return (std.indexOf("All modules accounted") > -1 ? true : false);
  },   

  isWindows:function _isWindows(OS)
  {
    return /^Windows/.test(OS);
  },

  getJetVersion: function _getJetVersion(filePath, file)
  {
    return fs.readdirSync(path.join(filePath,file));
  },

  getPlatform: function _getPlatform(OS)
  {
    var isWindows = /^Windows/.test(OS);
    return isWindows ? 'android' : 'ios';
  },

  isCheckedOut: function(std)
  {
    return (std.indexOf("Checked out revision") > -1 ? true : false);
  },

  matchInArray: function(string, arrayOfStrings)
  {
    for (var i=0; i < arrayOfStrings.length; i++)
    {
      if (arrayOfStrings[i].match(new RegExp(string)))
      {
        return true;
      }
    }
    return false;
  }, 

  isCordovaSuccess: function _isCordovaSuccess(std)
  {
    return (std.indexOf("BUILD SUCCESSFUL") > -1 ? true : false);
  },

  isNoRestoreTest: function _isNoRestoreTest()
  {
    return process.env["expressTest"]==='true';
  }

};
