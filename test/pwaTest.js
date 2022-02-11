/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

const appDir = util.getAppDir(util.PWA_APP_NAME);

describe('PWA Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.PWA_APP_NAME);
  
      // Scaffold component pwa app from scratch
      let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.PWA_APP_NAME} --use-global-tooling`, { cwd: util.testDir });
      console.log(result.stdout);
      // Check output
      assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
  
      // convert app to pwa
      result = await util.execCmd(`${util.OJET_APP_COMMAND} add pwa`, { cwd: util.getAppDir(util.PWA_APP_NAME) });
      // check for correct output
      assert.ok(/add pwa complete/.test(result.stdout), result.error);
    }
  });
    
  describe('Scaffold with norestore flag', () => {
    const appDirSrc = path.join(appDir, 'src');
    it('should have a sw.js file', () => {
      const pathToSw = path.resolve(appDirSrc, 'sw.js');
      assert.ok(fs.pathExistsSync(pathToSw), pathToSw);
    });
    it('should have a swinit.js script', () => {
      const appIndexHtml = fs.readFileSync(
        path.join(appDirSrc, 'index.html'),
        { encoding: 'utf-8' }
      );
      assert.ok(/<script src="swinit\.js"><\/script>/.test(appIndexHtml), appIndexHtml);
    });
    it('should have a swinit.js file', () => {
      const pathToSwInit = path.resolve(appDirSrc, 'swinit.js');
      assert.ok(fs.pathExistsSync(pathToSwInit), pathToSwInit);
    });
    it('should have a manifest.json file', () => {
      const pathToManifest = path.resolve(appDirSrc, 'manifest.json');
      assert.ok(fs.pathExistsSync(pathToManifest), pathToManifest);
    });
    it('should have a link tag pointing to manifest.json', () => {
      const appIndexHtml = fs.readFileSync(
        path.join(appDirSrc, 'index.html'),
        { encoding: 'utf-8' }
      );
      assert.ok(/<link rel="manifest" href="manifest\.json">/.test(appIndexHtml), appIndexHtml);
    }); 
  });
});