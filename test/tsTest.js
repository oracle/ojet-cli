/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const util = require('./util');

let filelist;
const appDir = util.getAppDir(util.TS_APP_NAME);

describe('Typescript Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.TS_APP_NAME);
  
      // Scaffold TS app from scratch
      const result = await util.execCmd(`${util.OJET_COMMAND} create ${util.TS_APP_NAME} --use-global-tooling --template=navbar --typescript`, { cwd: util.testDir });
      console.log(result.stdout);
      // Check output
      assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
    }
    if (!util.noScaffold()) {
      util.removeAppDir(util.TS_NAV_DRAWER_APP_NAME);
  
      // Scaffold TS app with a navdrawer template from scratch
      const result = await util.execCmd(`${util.OJET_COMMAND} create ${util.TS_NAV_DRAWER_APP_NAME} --use-global-tooling --template=navdrawer --typescript`, { cwd: util.testDir });
      console.log(result.stdout);
      // Check output
      assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
    }
  });

  describe('Scaffold with norestore flag', () => {
    it('should have tsconfig.json file', () => {
      const pathToTsconfigJson = path.resolve(appDir, 'tsconfig.json');
      assert.ok(fs.pathExistsSync(pathToTsconfigJson), pathToTsconfigJson);
    });
    it('should have .ts files', () => {
      filelist = fs.readdirSync(path.resolve(appDir, 'src', 'ts'));
      // Check for *.ts files
      let hasTs = false;
      if (filelist) {
        hasTs = filelist.some((elem) => {
          return elem.endsWith('.ts');
        });
      }
      assert.ok(hasTs, filelist);
    });
  });

  describe('Build', () => {
    if (!util.noBuild()) {
      it('should build ts app', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(util.TS_APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should have .map files', () => {
      filelist = fs.readdirSync(path.resolve(appDir, 'web', 'js'));
      // Check for *.map files
      let hasMap = false;
      if (filelist) {
        hasMap = filelist.some((elem) => {
          return elem.endsWith('.map');
        });
      }
      assert.ok(hasMap, filelist);
    });
  });

  describe('Build (Release)', () => {
    if (!util.noBuild()) {
      it('should build ts app', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: util.getAppDir(util.TS_APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should not have typescript *.map files', () => {
      filelist = fs.readdirSync(path.resolve(appDir, 'web', 'js'));
      // Check for *.map files
      let hasMap = false;
      if (filelist) {
        hasMap = filelist.some((elem) => {
          return elem.endsWith('.map');
        });
      }
      assert.ok(!hasMap, filelist);
    });
    it('should not have web/ts folder', () => {
      const pathToTSFolder = path.resolve(appDir, 'web', 'ts');
      assert.ok(!fs.pathExistsSync(pathToTSFolder), pathToTSFolder);
    });
  });
  describe('Tsconfig "extends" option and moving tsconfig.json to custom location', () => {
    if (!util.noBuild()) {
      it('should build ts app after adding "extends" to tsconfig.json', async () => {
        const BASE_TSCONFIG_JSON = 'base_tsconfig.json';
        const { pathToApp } = util.getAppPathData(util.TS_APP_NAME);
        // Create base_tsconfig.json and add "extends" option to tsconfig.json
        const baseTsconfigJsonPath = path.join(pathToApp, BASE_TSCONFIG_JSON);
        const baseTsconfigJson = {
          compilerOptions: {
            noEmit: true
          }
        };
        fs.writeJSONSync(baseTsconfigJsonPath, baseTsconfigJson, { spaces: 2 });
        // Clean up and create a myconfig dir
        fs.emptyDirSync(path.join(pathToApp, 'myconfig'));
        fs.moveSync(path.join(pathToApp, util.TSCONFIG_JSON), path.join(pathToApp, 'myconfig', util.TSCONFIG_JSON));
        const tsconfigJsonPath = path.join(pathToApp, 'myconfig', util.TSCONFIG_JSON);
        const tsconfigJson = fs.readJSONSync(tsconfigJsonPath);
        tsconfigJson.extends = `./${BASE_TSCONFIG_JSON}`;
        fs.writeJSONSync(tsconfigJsonPath, tsconfigJson, { spaces: 2 });

        // Add 'tsconfig' option to paths.source in oraclejetconfig.json
        util.setTsConfigPath(pathToApp, 'myconfig');
        
        // Run build and ensure that it was successful
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(util.TS_APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
        // Delete base_tsconfig.json and revert tsconfig.json change
        fs.removeSync(baseTsconfigJsonPath);
        delete tsconfigJson.extends;
        fs.writeJSONSync(tsconfigJsonPath, tsconfigJson, { spaces: 2 });
      });
    }
    it('should not have *.ts compiled to *.js because of noEmit in base_tsconfig.json', () => {
      const { pathToApp, sourceFolder, typescriptFolder, stagingFolder, javascriptFolder } = util.getAppPathData(util.TS_APP_NAME);
      const typescriptFilesPattern = path.join(pathToApp, sourceFolder, typescriptFolder, '**/*.ts');
      // glob now requires standard pattern
      const convertedPattern = typescriptFilesPattern.split(path.sep).join(path.posix.sep);
      const typescriptFiles = glob.sync(convertedPattern);
      typescriptFiles.forEach((file) => {
        const stagingPath = path.normalize(file)
          .replace(
            path.join(pathToApp, sourceFolder, typescriptFolder),
            path.join(pathToApp, stagingFolder, javascriptFolder)
          )
          .replace('.ts', '.js');
        assert.ok(!fs.existsSync(stagingPath), `${stagingPath} found`);
      });
    });
  });
  describe('Build (an app with navdrawer template)', () => {
    if (!util.noBuild()) {
      it('should build the ts app with navdrawer template', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(util.TS_NAV_DRAWER_APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should have .map files', () => {
      filelist = fs.readdirSync(path.resolve(util.getAppDir(util.TS_NAV_DRAWER_APP_NAME), 'web', 'js'));
      // Check for *.map files
      let hasMap = false;
      if (filelist) {
        hasMap = filelist.some((elem) => {
          return elem.endsWith('.map');
        });
      }
      assert.ok(hasMap, filelist);
    });
  });
});
