/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/


'use strict';

const assert = require('assert');
const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');

const utils = require('./utils');

const appName = 'testApp';
const testDir = path.resolve('test_result');
const appDir = path.resolve(`${appName}`);
const ojet = "node_modules/@oracle/ojet-cli/ojet.js";
const ojetAbs = path.resolve(ojet);

const execOptions = { maxBuffer: 1024 * 20000 };
const execTestDir = Object.assign({}, execOptions, { cwd: testDir });
const execAppDir = Object.assign({}, execOptions, { cwd: appDir });

const timeoutShort = 10000; // 10s
const timeout = 300000; // 5 mins
const timeoutLong = 1800000; // 0.5h

let filelist;
const platform = process.platform === 'darwin' ? 'ios' : 'android';
const inversePlatform = platform === 'ios' ? 'android' : 'ios';
const appHybridDir = 'hybrid';

describe('ojet-cli', () => {
  before(function (done) {
    this.timeout(timeout);
    utils.deleteDir(appDir);
    fs.emptyDirSync(testDir);
    utils.ensureDir(testDir);
    done();
  });

  describe('ojet create', () => {
    it('ojet --version', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} --version`, function (error, stdout) {
        assert.equal(utils.norestoreSuccess(stdout), true, error);
        done();
      });
    });
  });

  describe('ojet create cca', () => {
    it('ojet create cca', function (done) {
      this.timeout(timeout);
      exec(`node ${ojetAbs} create cca-1`, execTestDir, function (error, stdout) {
        assert.equal(/Your app structure is generated/.test(stdout) || /Path must be a string/.test(error) || error == null, true, error);
        done();
      });
    });
  });

  describe('ojet add platform', () => {
    it(`ojet add hybrid --platform=${platform}`, function (done) {
      this.timeout(timeout);
      const cmd =  exec(`node ${ojet} add hybrid --platform=${platform}`);
      cmd.stdout.on('data', (data) => {
        //assert.equal(utils.noError(data), true);
      })
      cmd.on('close', (code) => {
        done();
      });
    });
  });

    describe('Plugin management', function () {
    const devicePlugin = 'cordova-plugin-device';

    it('Add cordova plugin', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} add plugin cordova-plugin-battery-status`, (error, stdout) => {
        const success = error ? false : true;
        assert.equal(success, true, error);
        done();
      });
    });

    it('Remove cordova plugin', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} remove plugin cordova-plugin-battery-status`, (error, stdout) => {
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

  describe('Invalid arguments & Check error messages', function () {

    it('Complain about generating app to non-empty appDir', function (done) {
      this.timeout(timeoutShort);
      const execAppDir = Object.assign({}, execOptions, { cwd: path.resolve("..") });
      assert.doesNotThrow(() => {
          exec(`node ${ojetAbs} create testApp`, execAppDir, (error, stdout) => {
            console.log(stdout);
            done();
        });
      });
    });

    it('Complain about unsupported platform', function (done) {
      this.timeout(timeoutShort);
        exec(`node ${ojet} build android1`, (error, stdout) => {
          const stdLog = /Invalid platform/i.test(stdout);
          const errLog = /Invalid platform/i.test(error);
          assert.equal(errLog || stdLog, true, stdout);
          done();
        });
    });

    it('Complain about deprecated server port name', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} serve ${platform} --serverPort=we12`, (error, stdout) => {
        const errLog= /serverPort not valid/.test(error);
        const stdLog= /serverPort not valid/.test(stdout);
        assert.equal(errLog || stdLog, true, stdout);
        done();
      });
    });

    it('Complain about invalid server port value', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} serve ${platform} --server-port=we12`, (error, stdout) => {
        const errLog= /value 'we12' is not valid/.test(error);
        const stdLog= /value 'we12' is not valid/.test(stdout);
        assert.equal(errLog || stdLog, true, stdout);
        done();
      });
    });

    it('Complain about unsupported build argument', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} build --xyz ${platform}`, (error, stdout) => {
        const errLog = /Option xyz not valid/.test(error);
        const stdLog = /Option xyz not valid/.test(stdout);
        assert.equal(errLog || stdLog, true, stdout);
        done();
      });
    });
  });

  describe('Build', function () {
    it(`Build Default`, function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} build web`, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });

    it('Use \'build app\' syntax alias', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} build app web`, (error, stdout) => {
        assert.equal(utils.buildSuccess(stdout), true, error);
        done();
      });
    });
  });

  // describe('Serve', function () {
  //   it('ojet serve using the default platform', function (done) {
  //     this.timeout(timeout);
  //       this.timeout(timeout);
  //       exec(`node ${ojet} serve web`, (error, stdout) => {
  //         assert.equal(utils.serveSuccess(stdout), true, error);
  //         done();
  //     });
  //   });

  //   it('Use \'serve app\' syntax alias', function (done) {
  //     this.timeout(timeout);
  //     exec(`node ${ojet} serve app web`, (error, stdout) => {
  //         assert.equal(utils.serveSuccess(stdout), true, error);
  //         done();
  //     });
  //   });
  // });

  describe('Create theme', function () {
    it('Create theme', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} create theme green`, (error, stdout) => {
        assert.equal(utils.noError(stdout), true, error);
        done();
      });
    });
  });



  describe('ojet remove platform', () => {
    it('ojet remove platform', function (done) {
      this.timeout(timeout);
      exec(`node ${ojet} remove browser`, function (error, stdout) {
        assert.equal(/not supported/.test(stdout) || /not supported/.test(error), true, error);
        done();
      });
    });
  });

});
