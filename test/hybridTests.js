#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

const env = process.env;

const assert = require('assert');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const config = require('../config');
const utils = require('./utils');

const appName = 'hybridTestApp';
const hybridDirName = 'hybrid';
const testDir = path.resolve('test_result');
const appDir = `${testDir}/${appName}`;
const appHybridDir = `${appDir}/${hybridDirName}`;

const platform = utils.getPlatform(env.OS);
const inversePlatform = platform === 'ios' ? 'android' : 'ios';

const execOptions = { maxBuffer: 1024 * 50000 };
const execTestDir = Object.assign({}, execOptions, { cwd: testDir });
const execAppDir = Object.assign({}, execOptions, { cwd: appDir });
const timeoutShort = 10000; // 10s
const timeout = 300000; // 5 mins
const timeoutLong = 1800000; // 0.5h

let filelist;
let hybridFileList;

process.env.NODE_ENV = config.env.test;

describe('ojet: Hybrid test', function () {
  before(function (done) {
    this.timeout(timeout);
    utils.deleteDir(appDir);
    utils.ensureDir(testDir);
    done();
  });

  describe('Scaffolding', function () {
    it('Generate android/ios app', function (done) {
      const timeOutLimit = utils.isNoRestoreTest() ? timeout : timeoutLong;
      this.timeout(timeOutLimit);
      let command = `ojet create ${appName} --hybrid --template=navbar --appid=my.id --appName=testcase --platform=${platform}`;
      command = utils.isNoRestoreTest() ? `${command} --norestore` : command;
      exec(command, execTestDir, (error, stdout) => {
        filelist = fs.readdirSync(appDir);
        hybridFileList = fs.readdirSync(appHybridDir);
        assert.equal(utils.norestoreSuccess(stdout), true, error);
        done();
      });
    });

    it('Use \'create app\' syntax alias', function (done) {
      this.timeout(timeout);
      exec(`ojet create app ${appName}`, execTestDir, (error, stdout) => {
        const stdLog = /path already exists and is not empty/.test(stdout);
        const errLog = /path already exists and is not empty/.test(error);
        assert.equal(stdLog || errLog, true, error);
        done();
      });
    });
  });

  describe('Invalid arguments & Check error messages', function () {
    it('Complain about generating app to non-empty appDir', function (done) {
      this.timeout(timeoutShort);
      exec(`ojet create ${appName} --hybrid --platforms=${platform}`, execTestDir, (error, stdout) => {
        const errLog = /path already exists and is not empty/.test(error);
        const stdLog = /path already exists and is not empty/.test(stdout);
        assert.equal(errLog || stdLog, true, error);
        done();
      });
    });

    it('Complain about unsupported platform', function (done) {
      this.timeout(timeoutShort);
      exec('ojet build android1', execAppDir, (error, stdout) => {
        const stdLog = /Invalid platform/i.test(stdout);
        const errLog = /Invalid platform/i.test(error);
        assert.equal(errLog || stdLog, true, stdout);
        done();
      });
    });

    it('Complain about deprecated server port name', function (done) {
      this.timeout(timeout);
      exec(`ojet serve ${platform} --serverPort=we12`, execAppDir, (error, stdout) => {
        const errLog= /serverPort not valid/.test(error);
        const stdLog= /serverPort not valid/.test(stdout);
        assert.equal(errLog || stdLog, true, stdout);
        done();
      });
    });

    it('Complain about invalid server port value', function (done) {
      this.timeout(timeout);
      exec(`ojet serve ${platform} --server-port=we12`, execAppDir, (error, stdout) => {
        const errLog= /value 'we12' is not valid/.test(error);
        const stdLog= /value 'we12' is not valid/.test(stdout);
        assert.equal(errLog || stdLog, true, stdout);
        done();
      });
    });

    it('Complain about unsupported build argument', function (done) {
      this.timeout(timeout);
      exec(`ojet build --xyz ${platform}`, execAppDir, (error, stdout) => {
        const errLog = /Option xyz not valid/.test(error);
        const stdLog = /Option xyz not valid/.test(stdout);
        assert.equal(errLog || stdLog, true, stdout);
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
        const isPresent = configRead.indexOf('id="my.id"') > -1 || configRead.indexOf('id=\'my.id\'') > -1;
        assert.equal(isPresent, true, 'config.xml missing correct id value');
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

  describe('Build', function () {
    it(`Build ${platform}`, function (done) {
      this.timeout(timeout);
      exec(`ojet build ${platform}`, execAppDir, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });

    it(`Build ${platform} for device`, function (done) {
      this.timeout(timeout);
      exec(`ojet build ${platform} --destination=device`, execAppDir, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });

    it('Use \'build app\' syntax alias', function (done) {
      this.timeout(timeout);
      exec(`ojet build app ${platform}`, execAppDir, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });
  });

  describe('Serve', function () {
    it('ojet serve using the default platform', function (done) {
      this.timeout(timeoutLong);
      utils.spawn('ojet', ['serve'], 'Watching files', false, execAppDir, function(childProcess) {
        childProcess.kill(); // Kill livereload watcher
        done();
      });
    });

    it('Use \'serve app\' syntax alias', function (done) {
      this.timeout(timeoutLong);
      utils.spawn('ojet', ['serve', 'app'], 'Watching files', false, execAppDir, function(childProcess) {
        childProcess.kill(); // Kill livereload watcher
        done();
      });
    });
  });

  describe('Adding sass', function () {
    it('Add sass generator', function (done) {
      this.timeout(timeout);
      exec('ojet add sass', execAppDir, (error, stdout) => {
        assert.equal(/add-sass finished/.test(stdout) || /add-sass finished/.test(error), true, error);
        done();
      });
    });
  });

  describe('Create theme', function () {
    it('Create theme generator', function (done) {
      this.timeout(timeout);
      exec('ojet create theme green', execAppDir, (error, stdout) => {
        assert.equal(utils.noError(stdout), true, error);
        done();
      });
    });
  });

  describe('Compile sass', function () {
    it('Compile sass', function (done) {
      this.timeout(timeout);
      exec('ojet build --theme=green', execAppDir, (error, stdout) => {
        assert.equal(utils.noError(stdout), true, stdout);
        done();
      });
    });
  });

  describe('Platform management', function () {
    it(`Add cordova ${inversePlatform} platform`, function (done) {
      this.timeout(timeout);
      exec(`ojet add platform ${inversePlatform}`, execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it('Adding of a platform was saved', function () {
      const configXML = `${appHybridDir}/config.xml`;
      const configRead = fs.readFileSync(`${configXML}`, 'utf-8');
      const isPresent = configRead.indexOf(`engine name="${inversePlatform}"`) > -1;
      assert.equal(isPresent, true, 'Adding of a platform was not saved to config.xml');
    });

    it(`Remove cordova ${inversePlatform} platform`, function (done) {
      this.timeout(timeout);
      exec(`ojet remove platform ${inversePlatform}`, execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it('Removing of a platform was saved', function () {
      const configXML = `${appHybridDir}/config.xml`;
      const configRead = fs.readFileSync(`${configXML}`, 'utf-8');
      const isPresent = configRead.indexOf(`engine name="${inversePlatform}"`) === -1;
      assert.equal(isPresent, true, 'Removing of a platform was not saved to config.xml');
    });
  });

  describe('Plugin management', function () {
    const devicePlugin = 'cordova-plugin-device';

    it('Add cordova plugin', function (done) {
      this.timeout(timeout);
      exec(`ojet add plugin ${devicePlugin} cordova-plugin-battery-status`, execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it('Adding of a plugin was saved', function () {
      const configXML = `${appHybridDir}/config.xml`;
      const configRead = fs.readFileSync(`${configXML}`, 'utf-8');
      const isPresent = configRead.indexOf(`plugin name="${devicePlugin}"`) > -1;
      assert.equal(isPresent, true, 'Adding of a plugin was not saved to config.xml');
    });

    it('Remove cordova plugin', function (done) {
      this.timeout(timeout);
      exec(`ojet remove plugin ${devicePlugin}`, execAppDir, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it('Removing of a plugin was saved', function () {
      const configXML = `${appHybridDir}/config.xml`;
      const configRead = fs.readFileSync(`${configXML}`, 'utf-8');
      const isPresent = configRead.indexOf(`plugin name="${devicePlugin}"`) === -1;
      assert.equal(isPresent, true, 'Removing of a plugin was not saved to config.xml');
    });
  });

  describe('Clean', function () {
    it(`Clean ${platform} platform`, function (done) {
      this.timeout(timeout);
      exec(`ojet clean ${platform}`, execAppDir, (error, stdout) => {
        const errLogCorrect = /CLEAN SUCCEEDED/.test(stdout);
        assert.equal(errLogCorrect, true, stdout);
        done();
      });
    });
  });
});
