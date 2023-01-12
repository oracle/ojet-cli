/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const paths = require('../lib/util/paths');
const utils = require('../lib/util/utils');
const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

module.exports =
{
  create: function _create(generator) {
    return new Promise((resolve, reject) => {
      const cordovaDir = paths.getConfiguredPaths(path.resolve('.')).stagingHybrid;
      fs.ensureDirSync(cordovaDir);
      let args = ['create', cordovaDir];

      const appid = generator.options.appid;
      const appname = generator.options.appname;

      if (appid && appname) {
        args = args.concat([appid, `"${appname}"`]);
      } else if (appname) {
        // will stop the generator since invalid option set
        reject(new Error('Error: appid option must be provided if appname is provided'));
      } else if (appid) {
        // will stop the generator since invalid option set
        reject(new Error('Error: appname option must be provided if appid is provided'));
      }

      // invoke cordova create for the skeleton
      childProcess.spawn('cordova', args, { shell: true })
        .on('exit', (err) => {
          if (err) {
            // stop the generator as cordova create failed
            utils.log('cordova create failed.  cordova may not be installed');
            reject(err);
          }
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
};
