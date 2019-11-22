/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');

var util = require('./util');

var filelist;
const testDir = path.resolve('test_result/test');
const appDir = path.resolve(testDir, util.TS_APP_NAME);

describe("Typescript Test", () => {
  describe("Scaffold with norestore flag", () => {
    it("should have .ts files", () => {        
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
      it(`should build ts app`, async () => {
        let result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(util.TS_APP_NAME) });
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
});
