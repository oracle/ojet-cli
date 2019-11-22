/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

var util = require('./util');

var filelist;
const testDir = path.resolve('test_result/test');
const appDir = path.resolve(testDir, util.APP_NAME);

describe("Web Test", () => {
  describe("Scaffold with norestore flag", () => {
    it("should generate web app", () => {        
      filelist = fs.readdirSync(appDir);

      describe("Check essential files", () => {
        it("should have package.json", () => {
          var inlist = filelist.indexOf("package.json") > -1;
          assert.equal(inlist, true, path.resolve(appDir, 'package.json') + " missing");
        });
    
        it("should have .gitignore", () => {
          var inlist = filelist.indexOf(".gitignore") > -1;
          assert.equal(inlist, true, path.resolve(appDir, '.gitignore') + " missing");
        });
      });      
    });
  });

  if (!util.noBuild()) {
    describe('Build', () => {
      it(`should build Default`, async () => {
        let result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    });
  }
  
  describe('Extend to hybrid', () => {
    it('should add hybrid', async () => {
      filelist = fs.readdirSync(appDir);
      const inlist = filelist.indexOf('hybrid') > -1;
      assert.equal(inlist, true, `${appDir}/hybrid missing`);
    });
  });
});

describe("Config Test", () => {
  var config, ojetUtil, ojet, valid, toolingUtil;
  before(() => {
    config = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/config`);
    ojetUtil = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/util`);
    ojet = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/oraclejet-tooling`);
    valid = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/validations`);
    toolingUtil = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/util`);
  });

	it("should get all themes", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    config();
    config.loadOraclejetConfig('web');
    const themes = ojetUtil.getAllThemes();
    process.chdir(wd);
    assert(themes.length == 0);
  });
	  
  it("should read path mapping", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    config();
    config.loadOraclejetConfig('web');
    const map = ojetUtil.readPathMappingJson();
    process.chdir(wd);
    assert(map.hasOwnProperty('cdns'));
    assert(map.hasOwnProperty('libs'));
    assert(map.use === 'local');
  });

  it ('should validatePlatform - android', () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    assert.doesNotThrow(() => {
      ojet.config.loadOraclejetConfig("android");
      valid.platform('android');
      ojet.config.loadOraclejetConfig('ios');
      valid.platform('ios');
      ojet.config.loadOraclejetConfig('web');
      valid.platform('web');
    });
    process.chdir(wd);
  });

  it('should validateBuildType and types', () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    assert(valid.buildType({buildType: undefined}) == 'dev');
    assert(valid.buildType({buildType: 'dev'}) == 'dev');
    assert(valid.buildType({buildType: 'release'}) == 'release');
    assert.doesNotThrow(() => {
      toolingUtil.validateType('String', "test string", 'string');
    });
    assert.doesNotThrow(() => {
      toolingUtil.validateType('boolean', true, 'boolean');
    });
    assert.doesNotThrow(() => {
      toolingUtil.validateType('Number', 8801, 'number');
    });
    process.chdir(wd);
  });
});

describe("Paths Mapping Test", () => {
  var npmCopy;
  before(() => {
    npmCopy = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/npmCopy`);
  });

  it("should have single Path Mapping Not Empty -- Dev", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const mapping = npmCopy.getMappingLibsList('dev', 'web');
    process.chdir(wd);
    assert(_.isEmpty(mapping) === false);
  });

  it("should have Single Path Mapping Not Empty -- Release", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const mapping = npmCopy.getMappingLibsList('release', 'web');
    process.chdir(wd);
    assert(_.isEmpty(mapping) === false);
  });
});

describe("add theming", () => {
  it("should add pcss generator", async () => {
    let result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);

    // Recopy oraclejet-tooling
    util.copyOracleJetTooling(`${util.APP_NAME}`);
  });
});
