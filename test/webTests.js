#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;
const utils = require('./utils');

const appName = 'webTestApp';
const testDir = path.resolve('test_result');
const appDir = `${testDir}/${appName}`;

const execOptions = { maxBuffer: 1024 * 20000 };
const execTestDir = Object.assign({}, execOptions, { cwd: testDir });
const execAppDir = Object.assign({}, execOptions, { cwd: appDir });

let filelist;
const platform = utils.getPlatform(process.env.OS);

describe('ojet: Web test', () => {
  before(function (done) {
    this.timeout(5000);
    fs.ensureDirSync(appDir);
    fs.emptyDirSync(appDir);
    done();
  });

  describe('Scaffold with norestore flag', () => {
    it('Generate web app', function (done) {
      this.timeout(120000);
      exec(`ojet create ${appName} --norestore=true`, execTestDir, function (error, stdout) {
        assert.equal(utils.norestoreSuccess(stdout), true, error);
        filelist = fs.readdirSync(appDir);
        done();
      });
    });

    it('Use \'create app\' syntax alias', function (done) {
      this.timeout(300000);
      exec(`ojet create app ${appName}`, execTestDir, (error, stdout) => {
        const errLogCorrect = /path already exists and is not empty/.test(stdout);
        assert.equal(errLogCorrect, true, error);
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
      this.timeout(2400000);
      exec(`ojet add hybrid --platform=${platform}`, execAppDir, (error, stdout) => {
        filelist = fs.readdirSync(appDir);
        const inlist = filelist.indexOf('hybrid') > -1;
        assert.equal(inlist, true, `${appDir}/hybrid missing`);
        done();
      });
    });
  });
});
