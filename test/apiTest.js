/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');
const Ojet = require('../ojet');

describe('CLI API Tests', () => {
  describe('ojet build', () => {
    describe('debug', () => {
      it('should run `ojet.execute({ task: "build" })`', async () => {
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await ojet.execute({ task: 'build' });
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
      it(`should have ${util.API_APP_NAME}/web`, () => {
        const pathToWeb = path.join(
          util.getAppDir(util.API_APP_NAME),
          'web'
        );
        const webExists = fs.existsSync(pathToWeb);
        assert.ok(webExists, pathToWeb);
      });
    });
    describe('release', () => {
      it('should run `ojet.execute({ task: "build", options: { release: true } })`', async () => {
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await ojet.execute({ task: 'build', options: { release: true } });
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
      it(`should have ${util.API_APP_NAME}/web`, () => {
        const pathToWeb = path.join(
          util.getAppDir(util.API_APP_NAME),
          'web'
        );
        const webExists = fs.existsSync(pathToWeb);
        assert.ok(webExists, pathToWeb);
      });
      it(`should have ${util.API_APP_NAME}/web/js/bundle.js`, () => {
        const{ pathToBundleJs } = util.getAppPathData({ appName: util.API_APP_NAME });
        const hasBundleJs = fs.existsSync(pathToBundleJs);
        assert.ok(hasBundleJs, pathToBundleJs);
      });
    });
  });
  describe('ojet package', () => {
    describe('component', () => {
      it(`should package my-component in  ${util.API_APP_NAME}/dist/my-component_1-0-0.zip`, async () => {
        const component = 'my-component';
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await ojet.execute({
            task: 'package',
            scope: 'component',
            parameters: [component]
          });
          const pathToZip = path.join(
            util.getAppDir(util.API_APP_NAME),
            'dist',
            `${component}_1-0-0.zip`
          );
          const exists = fs.existsSync(pathToZip);
          assert.ok(exists, pathToZip);
        } catch {
          assert.ok(false);
        }
      });
      it(`should package my-pack/component in  ${util.API_APP_NAME}/dist/my-pack-component_1-0.0.zip`, async () => {
        const component = 'component';
        const pack = 'my-pack';
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await ojet.execute({
            task: 'package',
            scope: 'component',
            parameters: [component],
            options: {
              pack
            }
          });
          const pathToZip = path.join(
            util.getAppDir(util.API_APP_NAME),
            'dist',
            `${pack}-${component}_1-0-0.zip`
          );
          const exists = fs.existsSync(pathToZip);
          assert.ok(exists, pathToZip);
        } catch {
          assert.ok(false);
        }
      });
    });
    describe('pack', () => {
      it(`should package my-pack in ${util.API_APP_NAME}/dist/my-pack.zip`, async () => {
        const pack = 'my-pack';
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await ojet.execute({
            task: 'package',
            scope: 'pack',
            parameters: [pack]
          });
          const pathToZip = path.join(
            util.getAppDir(util.API_APP_NAME),
            'dist',
            `${pack}_1-0-0.zip`
          );
          const exists = fs.existsSync(pathToZip);
          assert.ok(exists, pathToZip);
        } catch {
          assert.ok(false);
        }
      });
    });
  });
  describe('ojet strip', () => {
    it(`should have ${util.API_APP_NAME}/node_modules && ${util.API_APP_NAME}/jet_components`, () => {
      const pathToNodeModules = path.join(
        util.getAppDir(util.API_APP_NAME),
        'node_modules'
      );
      const pathToJetComponents =  path.join(
        util.getAppDir(util.API_APP_NAME),
        'jet_components'
      );
      assert.ok(fs.existsSync(pathToNodeModules), pathToNodeModules);
      assert.ok(fs.existsSync(pathToJetComponents), pathToJetComponents);
    });
    it('should run `ojet.execute({ task: "strip" })`', async () => {
      const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
      try {
        await ojet.execute({ task: 'strip' });
        assert.ok(true);
      } catch {
        assert.ok(false);
      }
    });
    it(`should not have ${util.API_APP_NAME}/node_modules && ${util.API_APP_NAME}/jet_components`, () => {
      const pathToNodeModules = path.join(
        util.getAppDir(util.API_APP_NAME),
        'node_modules'
      );
      const pathToJetComponents =  path.join(
        util.getAppDir(util.API_APP_NAME),
        'jet_components'
      );
      assert.ok(!fs.existsSync(pathToNodeModules), pathToNodeModules);
      assert.ok(!fs.existsSync(pathToJetComponents), pathToJetComponents);
    });
  });
  describe('ojet restore', () => {
    it(`should not have ${util.API_APP_NAME}/node_modules && ${util.API_APP_NAME}/jet_components`, () => {
      const pathToNodeModules = path.join(
        util.getAppDir(util.API_APP_NAME),
        'node_modules'
      );
      const pathToJetComponents =  path.join(
        util.getAppDir(util.API_APP_NAME),
        'jet_components'
      );
      assert.ok(!fs.existsSync(pathToNodeModules), pathToNodeModules);
      assert.ok(!fs.existsSync(pathToJetComponents), pathToJetComponents);
    });
    it('should run `ojet.execute({ task: "restore" })`', async () => {
      const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
      try {
        await ojet.execute({ task: 'restore' });
        assert.ok(true);
      } catch {
        assert.ok(false);
      }
    });
    it(`should have ${util.API_APP_NAME}/node_modules && ${util.API_APP_NAME}/jet_components`, () => {
      const pathToNodeModules = path.join(
        util.getAppDir(util.API_APP_NAME),
        'node_modules'
      );
      const pathToJetComponents =  path.join(
        util.getAppDir(util.API_APP_NAME),
        'jet_components'
      );
      assert.ok(fs.existsSync(pathToNodeModules), pathToNodeModules);
      assert.ok(fs.existsSync(pathToJetComponents), pathToJetComponents);
    });
  });
});