/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const util = require('./util');

let filelist;
const testDir = path.resolve('../test_result');
const appDir = path.resolve(testDir, util.TS_APP_NAME);

describe('Typescript Test', () => {
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
});
