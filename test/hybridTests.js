#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

const env = process.env;
const assert = require('assert');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;
const utils = require('./utils');

const appName = 'hybridTestApp';
const hybridDirName = 'hybrid';
const testDir = path.resolve('test_result');
const appDir = `${testDir}/${appName}`;
const appHybridDir = `${appDir}/${hybridDirName}`;

const platform = utils.getPlatform(env.OS);
const inversePlatform = platform === 'ios' ? 'android' : 'ios';

const execOptions = { maxBuffer: 1024 * 20000 };
const execTestDir = Object.assign({}, execOptions, { cwd: testDir });
const execAppDir = Object.assign({}, execOptions, { cwd: appDir });
const execAppDir2 = Object.assign({}, execOptions, { cwd: appDir, timeout: 100000, killSignal: 'SIGTERM' });

let filelist;
let hybridFileList;

process.env.NODE_ENV = config.env.test;

describe('ojet: Hybrid test', function () {
  before(function (done) {
    this.timeout(10000);
    fs.ensureDirSync(appDir);
    fs.emptyDirSync(appDir);
    done();
  });

  describe('Scaffolding', function () {
    it('Generate android/ios app', function (done) {
      const timeOutLimit = utils.isNoRestoreTest() ? 120000 : 520000;
      this.timeout(timeOutLimit);
      let command = `ojet create ${appName} --hybrid --template=navbar --appid=my.id --appName=testcase --platforms=${platform}`;
      command = utils.isNoRestoreTest() ? `${command} --norestore` : command;
      exec(command, execTestDir, (error, stdout) => {
        filelist = fs.readdirSync(appDir);
        hybridFileList = fs.readdirSync(appHybridDir);
        assert.equal(utils.norestoreSuccess(stdout), true, error);
        done();
      });
    });
  });

  describe('Invalid arguments & Check error messages', function () {
    it('Complain about generating app to non-empty appDir', function (done) {
      this.timeout(300000);
      exec(`ojet create ${appName} --hybrid --platforms=${platform}`, execTestDir, (error, stdout) => {
        const errLogCorrect = /path already exists and is not empty/.test(stdout);
        assert.equal(errLogCorrect, true, error);
        done();
      });
    });

    it('Complain about unsupported platform', function (done) {
      this.timeout(150000);
      exec('ojet build --platform=android1', execAppDir, (error, stdout) => {
        const errLogCorrect = /Invalid platform/i.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });

    it('Complain about deprecated server port name', function (done) {
      this.timeout(20000);
      exec(`ojet serve ${platform} --serverPort=we12`, execAppDir, (error, stdout) => {
        const errLogCorrect = /Flag 'serverPort' was deprecated/.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });

    it('Complain about unsupported server port value', function (done) {
      this.timeout(20000);
      exec(`ojet serve --platform=${platform} --serverPort=we12`, execAppDir, (error, stdout) => {
        const errLogCorrect = /is not valid/.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });

    it('Complain about unsupported build argument', function (done) {
      this.timeout(150000);
      exec(`ojet build --xyz ${platform}`, execAppDir, (error, stdout) => {
        const errLogCorrect = /'xyz' not supported/.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });
  });

  describe('Build', function () {
    it(`Build ${platform}`, function (done) {
      this.timeout(2400000);
      exec(`ojet build --platform=${platform}`, execAppDir, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });

    it(`Build ${platform} for device`, function (done) {
      this.timeout(2400000);
      exec(`ojet build --platform=${platform} --destination=device`, execAppDir, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });
  });

  describe('Check essential files', function () {
    it('config.xml exists and is correct', function () {
      const configXML = `${appHybridDir}/config.xml`;
      const inlist = hybridFileList.indexOf('config.xml') > -1;
      assert.equal(inlist, true, `${configXML} missing`);
      if (inlist) {
        // Check contents of config.xml
        const configRead = fs.readFileSync(`${configXML}`, 'utf-8');
        assert.equal(configRead.indexOf('<name>testcase</name>') > -1, true, 'config.xml missing <name>');
        const idPresent = configRead.indexOf('id="my.id"') > -1 || configRead.indexOf('id=\'my.id\'') > -1;
        assert.equal(idPresent, true, 'config.xml missing correct id value');
      }
    });

    it('package.json exists', function () {
      const inlist = filelist.indexOf('package.json') > -1;
      assert.equal(inlist, true, `${appDir}/package.json missing`);
    });

    it('.gitignore exists', function () {
      const inlist = filelist.indexOf('.gitignore') > -1;
      assert.equal(inlist, true, `${appDir}/.gitignore missing`);
    });

    if (platform === 'android') {
      it('.apk exists', function () {
        const apkDir = `${appHybridDir}/platforms/android/build/outputs/apk`;
        const apkList = fs.readdirSync(`${appHybridDir}${apkDir}`);
        let inlist = false;
        apkList.forEach(function(value) {
          inlist = inlist || /.apk/.test(value);
        });
        assert.equal(inlist, true, `${apkDir}/android.apk missing`);
      });
    }
  });

  describe('Serve default', function () {
    it(`ojet serve ${platform} without platform`, function (done) {
      this.timeout(2400000);
      exec('ojet serve', execAppDir2, (error, stdout) => {
        assert.equal((utils.noError(stdout) || /Watching files/.test(stdout)), true, error);
        done();
      });
    });
  });

  describe('Adding sass', function () {
    it('Add sass generator', function (done) {
      this.timeout(2400000);
      exec('ojet add sass', execAppDir2, (error, stdout) => {
        assert.equal(/add-sass finished/.test(stdout) || /add-sass finished/.test(error), true, error);
        done();
      });
    });
  });
  //
  describe('Adding theme', function () {
    it('Add theme generator', function (done) {
      this.timeout(2400000);
      exec('ojet theme add green', execAppDir2, (error, stdout) => {
        assert.equal(utils.noError(stdout), true, error);
        done();
      });
    });
  });

  describe('Compile sass', function () {
    it('Compile sass', function (done) {
      this.timeout(2400000);
      exec('ojet build --theme=green', execAppDir2, (error, stdout) => {
        assert.equal(utils.noError(stdout), true, stdout);
        done();
      });
    });
  });

  describe('Platform management', function () {
    it(`Add cordova ${inversePlatform} platform`, function (done) {
      this.timeout(100000);
      exec(`ojet platform add ${inversePlatform}`, execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it(`Remove cordova ${inversePlatform} platform`, function (done) {
      this.timeout(100000);
      exec(`ojet platform remove ${inversePlatform}`, execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });
  });

  describe('Plugin management', function () {
    it('Add cordova plugin', function (done) {
      this.timeout(100000);
      exec('ojet plugin add cordova-plugin-device cordova-plugin-battery-status', execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it('Remove cordova plugin', function (done) {
      this.timeout(100000);
      exec('ojet plugin remove cordova-plugin-device', execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });
  });

  describe('Cleanup', function () {
    it(`Clean ${platform} platform`, function (done) {
      this.timeout(100000);
      exec(`ojet clean ${platform}`, execAppDir, (error, stdout) => {
        const errLogCorrect = /CLEAN SUCCEEDED/.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });

    it('Clean all platforms', function (done) {
      this.timeout(100000);
      exec('ojet clean', execAppDir, (error, stdout) => {
        const errLogCorrect = /CLEAN SUCCEEDED/.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });
  });
});
