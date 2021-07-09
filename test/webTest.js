/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const util = require('./util');

let filelist;
const testDir = path.resolve('../test_result');
const appDir = path.resolve(testDir, util.APP_NAME);

describe('Web Test', () => {
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
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should not have bundle.js', async () => {
      const{ pathToBundleJs } = util.getAppPathData({ appName: util.APP_NAME })
      const hasBundleJs = fs.existsSync(pathToBundleJs);
      assert.ok(!hasBundleJs, pathToBundleJs);
    })
  });

  describe('Build (Release)', () => {
    if (!util.noBuild()) {
      it('should build release js app', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should have bundle.js', async () => {
      const{ pathToBundleJs } = util.getAppPathData({ appName: util.APP_NAME })
      const hasBundleJs = fs.existsSync(pathToBundleJs);
      assert.ok(hasBundleJs, pathToBundleJs);
    })
    it('should not have main.js', async () => {
      const{ pathToMainJs } = util.getAppPathData({ appName: util.APP_NAME })
      const hasMainJs = fs.existsSync(pathToMainJs);
      assert.ok(!hasMainJs, pathToMainJs);
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
      it('build: path mapping to debug component', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
        const mainContent = fs.readFileSync(path.join(appDir, 'web', 'js', 'main.js'));

        assert.equal(mainContent.toString().match(`jet-composites/${testComp}/1.0.0`), `jet-composites/${testComp}/1.0.0`,
          `main.js should contain the debug component ${testComp}`);

        assert.equal(mainContent.toString().match(`jet-composites/${testComp}/1.0.0/min`), null,
          `main.js should not contain the minified component ${testComp}`);
      });
      it('release build:  path mapping to minified component', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) });
        const{ pathToBundleJs } = util.getAppPathData({ appName: util.APP_NAME })
        const bundleContent = fs.readFileSync(pathToBundleJs);
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

describe('Config Test', () => {
  let config;
  let ojetUtil;
  let ojet;
  let valid;
  let toolingUtil;
  before(() => {
    config = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/config`);
    ojetUtil = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/util`);
    ojet = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/oraclejet-tooling`);
    valid = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/validations`);
    toolingUtil = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/util`);
  });

  it('should get all themes', () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    config();
    config.loadOraclejetConfig('web');
    const themes = ojetUtil.getAllThemes();
    process.chdir(wd);
    assert(themes.length === 0);
  });

  it('should read path mapping', () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    config();
    config.loadOraclejetConfig('web');
    const map = ojetUtil.readPathMappingJson();
    process.chdir(wd);
    assert(Object.prototype.hasOwnProperty.call(map, 'cdns'));
    assert(Object.prototype.hasOwnProperty.call(map, 'libs'));
    assert(map.use === 'local');
  });

  if (!util.noHybrid()) {
    it('should validatePlatform - android', () => {
      const wd = process.cwd();
      process.chdir(util.getAppDir(util.APP_NAME));
      assert.doesNotThrow(() => {
        ojet.config.loadOraclejetConfig('android');
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
    assert(valid.buildType({ buildType: undefined }) === 'dev');
    assert(valid.buildType({ buildType: 'dev' }) === 'dev');
    assert(valid.buildType({ buildType: 'release' }) === 'release');
    assert.doesNotThrow(() => {
      toolingUtil.validateType('String', 'test string', 'string');
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

describe('Paths Mapping Test', () => {
  let npmCopy;
  before(() => {
    npmCopy = require(`${appDir}/node_modules/@oracle/oraclejet-tooling/lib/npmCopy`);
  });

  it('should have single Path Mapping Not Empty -- Dev', () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const mapping = npmCopy.getMappingLibsList('dev', 'web');
    process.chdir(wd);
    assert(_.isEmpty(mapping) === false);
  });

  it('should have Single Path Mapping Not Empty -- Release', () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const mapping = npmCopy.getMappingLibsList('release', 'web');
    process.chdir(wd);
    assert(_.isEmpty(mapping) === false);
  });
});

if (!util.noServe()) {
  describe('serve', () => {
    it('should serve with nobuild', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve web --no-build`, { cwd: util.getAppDir(util.APP_NAME), maxBuffer: 1024 * 30000, timeout:40000, killSignal:'SIGTERM' }, true);
      assert.equal(/Watching files/i.test(result.stdout), true, result.stdout);
      result.process.kill();
    });
  });
}

describe('add theming', () => {
  it('should add pcss generator', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);

    // Recopy oraclejet-tooling
    util.copyOracleJetTooling(`${util.APP_NAME}`);
  });
});

describe('Build with cdn', () => {
  const pathToPathMappingJson = path.join(appDir, 'src', 'js', 'path_mapping.json');
  before(() => {
    // Change "use" to "cdn" in path_mapping.json
    const pathmappingJson = fs.readJsonSync(pathToPathMappingJson);
    pathmappingJson.use = 'cdn';
    // write it back out
    fs.writeJsonSync(pathToPathMappingJson, pathmappingJson);
  });
  after(() => {
    // Revert "use" to "local" in path_mapping.json
    const pathmappingJson = fs.readJsonSync(pathToPathMappingJson);
    pathmappingJson.use = 'local';
    // write it back out
    fs.writeJsonSync(pathToPathMappingJson, pathmappingJson);
  });
  function sharedTests({ debug }) {
    const pathToIndexHTML = path.join(appDir, 'web', 'index.html');
    it('should build index.html with a reference to oj-redwood.css on the cdn', () => {
      const indexHTML = fs.readFileSync(pathToIndexHTML, { encoding: 'utf-8' });
      const cssString = debug ? 'default/css/redwood/oj-redwood.css' : 'default/css/redwood/oj-redwood-min.css';
      assert.ok(new RegExp(cssString).test(indexHTML), 'index.html should contain a reference to oj-redwood.css on the cdn ');
    });
    it('should build index.html with a reference to bundle-config.js on the cdn', () => {
      const indexHTML = fs.readFileSync(pathToIndexHTML, { encoding: 'utf-8' });
      const bundleString = 'default/js/bundles-config.js'
      assert.ok(new RegExp(bundleString).test(indexHTML), 'index.html should contain a reference to bundle-config.js on the cdn');
    });
  }
  describe('debug build', () => {
    if (!util.noBuild()) {
      it('should build in debug mode to reference the CDN', async  () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.APP_NAME) });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    sharedTests({ debug: true });
  });
  describe('release build', () => {
    if (!util.noBuild()) {
      it('should build in release mode to reference the CDN', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) });
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
