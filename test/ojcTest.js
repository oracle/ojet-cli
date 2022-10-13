/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const util = require('./util');

let filelist;
const appDir = util.getAppDir(util.OJC_APP_NAME);

describe('oj-c App Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.OJC_APP_NAME);
  
      // Scaffold an oj-c app
      let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.OJC_APP_NAME} --use-global-tooling --typescript`, { cwd: util.testDir });
      console.log(result.stdout);
      // Check that it output the right text to the command line
      assert.strictEqual(util.norestoreSuccess(result.stdout), true, result.stderr);  
    }  
  });
  
  describe('Check essential files', () => {
    it('should have package.json', () => {
      filelist = fs.readdirSync(appDir);
      const inlist = filelist.indexOf('package.json') > -1;
      assert.equal(inlist, true, `${path.resolve(appDir, 'package.json')} missing`);
    });

    it('should have .gitignore', () => {
      filelist = fs.readdirSync(appDir);
      const inlist = filelist.indexOf('.gitignore') > -1;
      assert.equal(inlist, true, `${path.resolve(appDir, '.gitignore')} missing`);
    });
  });

  describe('Build', () => {
    if (!util.noBuild()) {
      it('should build default js app', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: appDir });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
  });


describe('Build with cdn', () => {
  const pathToPathMappingJson = path.join(appDir, 'src', 'js', 'path_mapping.json');
  before(() => {
    // Change "use" to "cdn" in path_mapping.json
    const pathmappingJson = fs.readJsonSync(pathToPathMappingJson);
    pathmappingJson.use = 'cdn';
    pathmappingJson.cdns.jet.config = 'bundles-config-esm-debug.js';
    // write it back out
    fs.writeJsonSync(pathToPathMappingJson, pathmappingJson);
  });
  after(() => {
    // Revert "use" to "local" and regular bundles in path_mapping.json
    const pathmappingJson = fs.readJsonSync(pathToPathMappingJson);
    pathmappingJson.use = 'local';
    pathmappingJson.cdns.jet.config = 'bundles-config.js';
    // write it back out
    fs.writeJsonSync(pathToPathMappingJson, pathmappingJson);
  });
  function sharedTests({ debug }) {
    const pathToMainjs = debug ? path.join(appDir, 'web', 'js', 'main.js') : path.join(appDir, 'web', 'js', 'bundle.js');
    it('should build main.js with a reference to oj-c on the cdn', () => {
      const mainJs = fs.readFileSync(pathToMainjs, { encoding: 'utf-8' });
      const pathString = '../../packs/oj-c';
      assert.ok(new RegExp(pathString).test(mainJs), 'main.js should contain a reference to packs/oj-c on the cdn ');
    });
    it('should build index.html with a module type on the bundles script', () => {
      const pathToIndexHTML = path.join(appDir, 'web', 'index.html');
      const indexHTML = fs.readFileSync(pathToIndexHTML, { encoding: 'utf-8' });
      const scriptString = "type='module'";
      assert.ok(new RegExp(scriptString).test(indexHTML), `index.html should contain a type='module' reference`);
    });
  }
  describe('debug build', () => {
    if (!util.noBuild()) {
      it('should build in debug mode to reference the CDN', async  () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: appDir });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    sharedTests({ debug: true });
  });
  describe('release build', () => {
    if (!util.noBuild()) {
      it('should build in release mode to reference the CDN', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: appDir });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    sharedTests({ debug: false });
    it('should delete libraries referenced from the cdn', () => {
      const libsWhitelist = ['oj', 'require', 'require-css'];
      let hasLibNotInWhitelist = false;
      fs.readdirSync(path.join(appDir, 'web', 'js', 'libs')).forEach((lib) => {
        if (!libsWhitelist.includes(lib)) {
          hasLibNotInWhitelist = true;
        }
      });
      assert.ok(!hasLibNotInWhitelist, 'libs should not contain libraries referenced from the cdn');
    });
  });
  });
});
