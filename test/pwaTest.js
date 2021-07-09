/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

const testDir = path.resolve('../test_result');
const appDir = path.resolve(testDir, util.PWA_APP_NAME);

describe('PWA Test', () => {
  describe('Scaffold with norestore flag', () => {
    const appDirSrc = path.join(appDir, 'src');
    it('should have a sw.js file', () => {
      const pathToSw = path.resolve(appDirSrc, 'sw.js');
      assert.ok(fs.pathExistsSync(pathToSw), pathToSw);
    });
    it('should have a script tag registering the service worker', () => {
      const appIndexHtml = fs.readFileSync(
        path.join(appDirSrc, 'index.html'),
        { encoding: 'utf-8' }
      );
      assert.ok(/navigator\.serviceWorker\.register\('sw\.js'\)/.test(appIndexHtml), appIndexHtml);
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