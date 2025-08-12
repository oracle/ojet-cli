/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');
const Ojet = require('../ojet');
const _DUMMY = 'dummy_dir';

describe('CLI API Tests', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.API_APP_NAME);
  
      // Scaffold webTsApiTest application using ojet API
      const ojet = new Ojet({ cwd: util.testDir, logs: true });
      try {
        await ojet.execute({
          task: 'create',
          parameters: [util.API_APP_NAME],
          options: {
            template: path.join(util.getTemplatesDir(), util.API_APP_NAME),
          }
        });
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false, 'Error running ojet.execute({ task: "create" })');
      }
    }
  });

  describe('ojet build', () => {
    describe('debug', () => {
      it('should run `ojet.execute({ task: "build" })`', async () => {
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await ojet.execute({ task: 'build' });
          assert.ok(true);
        } catch (e) {
          console.log(e);
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
        } catch (e) {
          console.log(e);
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
        const{ pathToBundleJs } = util.getAppPathData(util.API_APP_NAME);
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
          await util.execCmd(`${util.OJET_APP_COMMAND} package component ${component}`, {
              cwd: util.getAppDir(util.API_APP_NAME)
            });
          const pathToZip = path.join(
            util.getAppDir(util.API_APP_NAME),
            'dist',
            `${component}_1-0-0.zip`
          );
          const exists = fs.existsSync(pathToZip);
          assert.ok(exists, pathToZip);
        } catch (e) {
          console.log(e);
          assert.ok(false);
        }
      });
      it(`should package my-pack/component in  ${util.API_APP_NAME}/dist/my-pack-component_1-0.0.zip`, async () => {
        const component = 'component';
        const pack = 'my-pack';
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await util.execCmd(`${util.OJET_APP_COMMAND} package component ${component} --pack=${pack}`, {
              cwd: util.getAppDir(util.API_APP_NAME)
            });
          const pathToZip = path.join(
            util.getAppDir(util.API_APP_NAME),
            'dist',
            `${pack}-${component}_1-0-0.zip`
          );
          const exists = fs.existsSync(pathToZip);
          assert.ok(exists, pathToZip);
        } catch (e) {
          console.log(e);
          assert.ok(false);
        }
      });
    });
    describe('pack', () => {
      it(`should package my-pack in ${util.API_APP_NAME}/dist/my-pack.zip`, async () => {
        const pack = 'my-pack';
        const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
        try {
          await util.execCmd(`${util.OJET_APP_COMMAND} package pack ${pack}`, {
              cwd: util.getAppDir(util.API_APP_NAME)
            });
          const pathToZip = path.join(
            util.getAppDir(util.API_APP_NAME),
            'dist',
            `${pack}_1-0-0.zip`
          );
          const exists = fs.existsSync(pathToZip);
          assert.ok(exists, pathToZip);
        } catch (e) {
          console.log(e);
          assert.ok(false);
        }
      });
    });

    describe('ojet publish and label', () => {
        // Do a mock server and then publish/label
        it('should publish and label component', async () => {
          const nock = require('nock');
          nock(`${util.EXCHANGE_URL}`)
                  .post('/components/?access=PUBLIC') // Specify the HTTP method and path
                  .reply(200, { message: 'Published' }); // Define the status code and response body

          const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
          try {
            await ojet.execute({ task: 'publish', parameters: ['component', 'my-component']});
            assert.ok(true);
          } catch (e) {
            console.log(e);
            assert.ok(false);
          }

          nock(`${util.EXCHANGE_URL}`)
                  .post('/components/my-component/versions/1.0.0/labels') // Specify the HTTP method and path
                  .reply(200, { message: 'Labeled' }); // Define the status code and response body          
          try {
            await ojet.execute({ task: 'label', parameters: ['component', 'my-component@1.0.0', 'thelabel'] });
            assert.ok(true);
          } catch (e) {
            console.log(e);
            assert.ok(false);
          }
          nock.cleanAll(); 
          nock.enableNetConnect();
          nock.restore();
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
      } catch (e) {
        console.log(e);
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
      } catch (e) {
        console.log(e);
        assert.ok(false);
      }
    });
    it('should use the flag --legacy-peer-deps when running ojet restore and if enableLegacyPeerDeps is enabled in oraclejetconfig.json file', async () => {
      const appDir = util.getAppDir(util.API_APP_NAME);
      const oracleJetConfigJSON = util.getOracleJetConfigJson(util.API_APP_NAME);
      oracleJetConfigJSON.enableLegacyPeerDeps = true;
      util.writeOracleJetConfigJson(util.API_APP_NAME, oracleJetConfigJSON);
  
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} restore`, { cwd: appDir }, false, true);
  
      assert.equal(/--legacy-peer-deps/.test(result.stdout), true, result.error);
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

  describe('ojet strip using oraclejetconfig.json property', () => {    
    it(`should have ${util.API_APP_NAME}/node_modules && ${util.API_APP_NAME}/jet_components`, () => {
      const appName = util.API_APP_NAME;
      const pathToApp = util.getAppPathData(appName);
      assert.ok(fs.existsSync(pathToApp.pathToNodeModules), pathToApp.pathToNodeModules);
      assert.ok(fs.existsSync(pathToApp.pathToExchangeComponents), pathToApp.pathToExchangeComponents);
    });
    it('should run `ojet.execute({ task: "strip" })` using stripFiles config property', async () => {
      // Empty "cache"
      const env = process.env;
      delete env.oraclejetConfigJson;

      // Inject 'stripList' into oraclejetconfig.json, and create fake directory we want to strip
      let json = util.getOracleJetConfigJson(util.API_APP_NAME);
      // Add a dummy dir, and create the dir
      json.stripList = [_DUMMY];
      util.writeOracleJetConfigJson(util.API_APP_NAME, json);
      fs.mkdirSync(path.join(util.getAppDir(util.API_APP_NAME), _DUMMY));
      const ojet = new Ojet({ cwd: util.getAppDir(util.API_APP_NAME), logs: false });
      try {
        await ojet.execute({ task: 'strip' });
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false);
      }
    });
    it ('should not have dummy_dir', () => {
      const pathToDummy = path.join(util.getAppDir(util.API_APP_NAME), _DUMMY);
      assert.ok(!fs.existsSync(pathToDummy), pathToDummy);
    });
    it(`should have ${util.API_APP_NAME}/node_modules && ${util.API_APP_NAME}/jet_components`, () => {
      const appName = util.API_APP_NAME;
      const pathToApp = util.getAppPathData(appName);

      const pathToNodeModules = pathToApp.pathToNodeModules;
      const pathToJetComponents =  pathToApp.pathToExchangeComponents;
      assert.ok(fs.existsSync(pathToNodeModules), pathToNodeModules);
      assert.ok(fs.existsSync(pathToJetComponents), pathToJetComponents);
    });
  });
});