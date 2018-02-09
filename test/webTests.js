#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

const assert = require('assert');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const utils = require('./utils');

const appName = 'webTestApp';
const testDir = path.resolve('test_result');
const appDir = `${testDir}/${appName}`;

const execOptions = { maxBuffer: 1024 * 20000 };
const execTestDir = Object.assign({}, execOptions, { cwd: testDir });
const execAppDir = Object.assign({}, execOptions, { cwd: appDir });

const timeoutShort = 10000; // 10s
const timeout = 300000; // 5 mins
const timeoutLong = 1800000; // 0.5h

let filelist;
const platform = utils.getPlatform(process.env.OS);

describe('ojet: Web test', () => {
  before(function (done) {
    this.timeout(timeoutShort);
    utils.deleteDir(appDir);
    utils.ensureDir(testDir);
    done();
  });

  describe('Scaffold with norestore flag', () => {
    it('Generate web app', function (done) {
      this.timeout(timeout);
      exec(`ojet create ${appName} --norestore=true`, execTestDir, function (error, stdout) {
        assert.equal(utils.norestoreSuccess(stdout), true, error);
        filelist = fs.readdirSync(appDir);
        done();
      });
    });

    it('Use \'create app\' syntax alias', function (done) {
      this.timeout(timeoutShort);
      utils.spawn('ojet', ['create', 'app', appName], 'path already exists and is not empty', false, execTestDir, function(childProcess) {
        childProcess.kill();
        done();
      });
    });
  });

  describe('Check essential files', function () {
    it('package.json exists', function () {
      const inlist = filelist.indexOf('package.json') > -1;
      assert.equal(inlist, true, `${appDir}/package.json missing`);
    });

    it('Gruntfile.js exists', function () {
      const inlist = filelist.indexOf('Gruntfile.js') > -1;
      assert.equal(inlist, true, `${appDir}/Gruntfile.js missing`);
    });

    it('.gitignore exists', function () {
      const inlist = filelist.indexOf('.gitignore') > -1;
      assert.equal(inlist, true, `${appDir}/.gitignore missing`);
    });
  });

  describe(`Extend to hybrid incl. ${platform} platform`, function () {
    it('Add hybrid', function (done) {
      this.timeout(timeoutLong);
      exec(`ojet add hybrid --platform=${platform}`, execAppDir, (error, stdout) => {
        filelist = fs.readdirSync(appDir);
        const inlist = filelist.indexOf('hybrid') > -1;
        assert.equal(inlist, true, `${appDir}/hybrid missing`);
        done();
      });
    });
  });
});
