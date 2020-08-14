/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

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

  describe('Build', () => {
    if (!util.noBuild()) {
      it(`should build default js app`, async () => {
        let result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    } 
    it(`should not have bundle.js and bundle_es5.js`, async () => {
      filelist = fs.readdirSync(path.resolve(appDir, 'web', 'js'));
      let hasBundleJs = false;
      let hasBundleEs5JS = false;
      if (filelist) {
        filelist.forEach((file) => {
          switch(file) {
            case 'bundle.js':
              hasBundleJs = true;
              break;
            case 'bundle_es5.js':
              hasBundleEs5JS = true;
              break;
            default:
              break;
          }
        })
      }
      assert.ok(!hasBundleJs && !hasBundleEs5JS, filelist);
    })
  });

  describe('Build (Release)', () => {
    if (!util.noBuild()) {
      it(`should build release js app`, async () => {
        let result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    } 
    it(`should have bundle.js and bundle_es5.js`, async () => {
      filelist = fs.readdirSync(path.resolve(appDir, 'web', 'js'));
      let hasBundleJs = false;
      let hasBundleEs5JS = false;
      if (filelist) {
        filelist.forEach((file) => {
          switch(file) {
            case 'bundle.js':
              hasBundleJs = true;
              break;
            case 'bundle_es5.js':
              hasBundleEs5JS = true;
              break;
            default:
              break;
          }
        })
      }
      assert.ok(hasBundleJs && hasBundleEs5JS, filelist);
    })
  });

    // 
  // BuildWithComponent verifies that proper path mapping is set for a component.
  // 
  // The test creates ${testComp} (ojet build component), then issues an ojet build.
  // We then verify that the paths in main.js are correct (e.g. it has the debug
  // version of the component).
  // 
  // paths: {
  // ...
  // "test-component":"jet-composites/test-component/1.0.0"
  // ...
  // }
  //
  // And for the release build, we verify that paths has the minified component:
  // 
  // "test-component":"jet-composites/test-component/1.0.0/min"
  //
  describe('BuildWithComponent', () => {
    if (!util.noBuild()) {
      let wd;
      const testComp = 'my-comp';

      before(() => {
        wd = process.cwd();
        process.chdir(util.getAppDir(util.APP_NAME));
        util.execCmd(`${util.OJET_APP_COMMAND} create component ${testComp}`, { cwd: util.getAppDir(util.APP_NAME) });
        process.chdir(wd);
      });
      it(`build: path mapping to debug component`, async () => {
        let result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
        const mainContent = fs.readFileSync(path.join(appDir, 'web', 'js', 'main.js'));

        assert.equal(mainContent.toString().match(`jet-composites/${testComp}/1.0.0`), `jet-composites/${testComp}/1.0.0`,
                     `main.js should contain the debug component ${testComp}`);

        assert.equal(mainContent.toString().match(`jet-composites/${testComp}/1.0.0/min`), null,
                     `main.js should not contain the minified component ${testComp}`);
      });
      it(`release build:  path mapping to minified component`, async () => {
        let result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) });
        const bundleContent = fs.readFileSync(path.join(appDir, 'web', 'js', 'bundle.js'));
        assert.equal(bundleContent.toString().match(`jet-composites/${testComp}/1.0.0/min`), `jet-composites/${testComp}/1.0.0/min`,
                     `bundle.js should contain the minified component ${testComp}`);

      });
    } 
  });
  
  if (!util.noHybrid()) {
    describe('Extend to hybrid', () => {
      it('should add hybrid', async () => {
        filelist = fs.readdirSync(appDir);
        const inlist = filelist.indexOf('hybrid') > -1;
        assert.equal(inlist, true, `${appDir}/hybrid missing`);
      });
    });
  }
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

  if (!util.noHybrid()) {
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
  }

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

if (!util.noServe()) {
  describe("serve", () => {
    it("should serve with nobuild", async () => {
      let result = await util.execCmd(`${util.OJET_APP_COMMAND} serve web --no-build`, { cwd: util.getAppDir(util.APP_NAME), maxBuffer: 1024 * 20000, timeout:30000, killSignal:'SIGTERM' }, true);
      assert.equal(/Watching files/i.test(result.stdout), true, result.stdout);
      result.process.kill();
    });
  });
}

describe("add theming", () => {
  it("should add pcss generator", async () => {
    let result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);

    // Recopy oraclejet-tooling
    util.copyOracleJetTooling(`${util.APP_NAME}`);
  });
});

describe("test CDN", () => {
  before(() => {
    // Change "use" to CDN in path_mapping.json
    const jsonFile = path.join(appDir, 'src', 'js', 'path_mapping.json');
    let pathmapping = fs.readJsonSync(jsonFile);
    pathmapping.use = "cdn";
    // write it back out
    fs.writeJsonSync(jsonFile, pathmapping);
  });

  if (!util.noBuild()) {
    it("should build to reference the CDN", async() => {
      let result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
      const indexFile = fs.readFileSync(path.join(appDir, 'web', 'index.html'));

      const cssString = 'default/css/redwood/oj-redwood.css';
      assert.equal(indexFile.toString().match(cssString), cssString, 'index.html should contain the CDN redwood css string');

      const bundleString = 'default/js/bundles-config.js';
      assert.equal(indexFile.toString().match(bundleString), bundleString, 'index.html should contain the CDN bundle JS reference');
  });
  } 
});
