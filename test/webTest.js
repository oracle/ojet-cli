/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const _ = require('lodash');

const constants = require('../lib/util/constants');
const ojetUtil = require('../lib/util/utils');
const ojetPaths = require('../lib/util/paths');

const util = require('./util');

let filelist;
const appDir = util.getAppDir(util.APP_NAME);

describe('Web Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.APP_NAME);
      util.removeAppDir(util.TEST_DIR);
  
      // Scaffold a basic web app
      let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.APP_NAME} --norestore=true`, { cwd: util.testDir });
      console.log(result.stdout);
      // Check that it output the right text to the command line
      assert.strictEqual(util.norestoreSuccess(result.stdout), true, result.stderr);
      
      // Restore
      result = await util.execCmd(`${util.OJET_APP_COMMAND} restore`, { cwd: appDir });
      console.log(result.stdout);

      // Scaffold a basic app without a name
      result = await util.execCmd(`${util.OJET_COMMAND} create --norestore=true`, { cwd: util.testDir });
      // Check that it worked
      assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);  
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
    it('should not have bundle.js', async () => {
      const{ pathToBundleJs } = util.getAppPathData(util.APP_NAME)
      const hasBundleJs = fs.existsSync(pathToBundleJs);
      assert.ok(!hasBundleJs, pathToBundleJs);
    })
  });

  describe('Build (Release) without the bundle name attribute', () => {
    if (!util.noBuild()) {
      it('should build release js app', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: appDir });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should have bundle.js', async () => {
      const{ pathToBundleJs } = util.getAppPathData(util.APP_NAME)
      const hasBundleJs = fs.existsSync(pathToBundleJs);
      assert.ok(hasBundleJs, pathToBundleJs);
    })
    it('should not have main.js', async () => {
      const{ pathToMainJs } = util.getAppPathData(util.APP_NAME)
      const hasMainJs = fs.existsSync(pathToMainJs);
      assert.ok(!hasMainJs, pathToMainJs);
    })
  });

  describe('Build (Release) with any given bundle name other than main.js', () => {
    if (!util.noBuild()) {
      it('should build release js app', async () => {
        // get the oraclejetconfig.json file and add bundleName attribute value to <appName>.js:
        const oracleJetConfigJSON = util.getOracleJetConfigJson(util.APP_NAME);
        oracleJetConfigJSON.bundleName = `${util.API_APP_NAME}.js`;
        util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);
        const result = await (util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: appDir }));
        // Delete the bundleName attribute. Having it might cause the subsequent case(s) to fail:
        delete oracleJetConfigJSON.bundleName;
        util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it(`should have ${util.API_APP_NAME}.js`, async () => {
      // retrieve the path for the created js file and check its presence:
      const{ pathToApp, stagingFolder, javascriptFolder } = util.getAppPathData(util.APP_NAME)
      const pathToBundleNameJs = path.join(pathToApp, stagingFolder, javascriptFolder, `${util.API_APP_NAME}.js`);
      const hasBundleNameJs = fs.existsSync(pathToBundleNameJs);
      assert.ok(hasBundleNameJs, pathToBundleNameJs);
    })
    it('should not have main.js', async () => {
      const{ pathToMainJs } = util.getAppPathData(util.APP_NAME)
      const hasMainJs = fs.existsSync(pathToMainJs);
      assert.ok(!hasMainJs, pathToMainJs);
    })
  });

  describe('Build (Release) with main.js as the bundleName', () => {
    if (!util.noBuild()) {
      it('should build release js app', async () => {
        const oracleJetConfigJSON = util.getOracleJetConfigJson(util.APP_NAME);
        oracleJetConfigJSON.bundleName = 'main.js';
        util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: appDir });
        delete oracleJetConfigJSON.bundleName;
        util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    it('should have main.js', async () => {
      const{ pathToMainJs } = util.getAppPathData(util.APP_NAME)
      const hasMainJs = fs.existsSync(pathToMainJs);
      assert.ok(hasMainJs, pathToMainJs);
    })
  });

  describe('Build (Release) source maps generation', () => {
    describe('Generate source maps for default bundle name attribute', () => {
      if (!util.noBuild()) {
        it('should include source maps files for the generated bundles', async () => {
          const oraclejetConfig = util.getOracleJetConfigJson(util.APP_NAME);
          oraclejetConfig.generateSourceMaps = true;
          util.writeOracleJetConfigJson(util.APP_NAME, oraclejetConfig);
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) });
          
          // Restore the value:
          oraclejetConfig.generateSourceMaps = false;
          util.writeOracleJetConfigJson(util.APP_NAME, oraclejetConfig);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
        });
      }
      it('should have bundle.js.map', async () => {
        const{ pathToBundleJs } = util.getAppPathData(util.APP_NAME)
        const hasBundleJsMap = fs.existsSync(`${pathToBundleJs}.map`);
        assert.ok(hasBundleJsMap, `${pathToBundleJs}.map`);
      })
      it('should not have main.js.map', async () => {
        const{ pathToMainJs } = util.getAppPathData(util.APP_NAME)
        const hasMainJsMap = fs.existsSync(`${pathToMainJs}.map`);
        assert.ok(!hasMainJsMap, `${pathToMainJs}.map`);
      })
    });
    describe('Generate source maps for any given bundle name other than main.js', () => {
      if (!util.noBuild()) {
        it('should build release js app', async () => {
          // get the oraclejetconfig.json file and add bundleName attribute value to <appName>.js:
          const oracleJetConfigJSON = util.getOracleJetConfigJson(util.APP_NAME);
          oracleJetConfigJSON.bundleName = `${util.API_APP_NAME}.js`;
          oracleJetConfigJSON.generateSourceMaps = true;
          util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);
          const result = await (util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: util.getAppDir(util.APP_NAME) }));
          // Delete the bundleName attribute. Having it might cause the subsequent case(s) to fail:
          delete oracleJetConfigJSON.bundleName;
          oracleJetConfigJSON.generateSourceMaps = false;
          util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
        });
      }
      it(`should have ${util.API_APP_NAME}.js.map`, async () => {
        // retrieve the path for the created js file and check its presence:
        const{ pathToApp, stagingFolder, javascriptFolder } = util.getAppPathData(util.APP_NAME)
        const pathToBundleNameJsMapFile = path.join(pathToApp, stagingFolder, javascriptFolder, `${util.API_APP_NAME}.js.map`);
        const hasBundleNameJsMapFile = fs.existsSync(pathToBundleNameJsMapFile);
        assert.ok(hasBundleNameJsMapFile, pathToBundleNameJsMapFile);
      })
      it('should not have main.js.map', async () => {
        const{ pathToMainJs } = util.getAppPathData(util.APP_NAME)
        const hasMainJsMap = fs.existsSync(`${pathToMainJs}.map`);
        assert.ok(!hasMainJsMap, `${pathToMainJs}.map`);
      })
    });
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
  // "test-component":"jet-composites/test-component"
  // ...
  // }
  //
  // And for the release build, we verify that paths has the minified component:
  //
  // "test-component":"jet-composites/test-component/min"
  //
  describe('BuildWithComponent', () => {
    if (!util.noBuild()) {
      let wd;
      const testComp = 'my-comp';

      before(() => {
        wd = process.cwd();
        process.chdir(appDir);
        util.execCmd(`${util.OJET_APP_COMMAND} create component ${testComp}`, { cwd: appDir });
        process.chdir(wd);
      });
      it('build: path mapping to debug component', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: appDir });
        const mainContent = fs.readFileSync(path.join(appDir, 'web', 'js', 'main.js'));

        assert.equal(mainContent.toString().match(`jet-composites/${testComp}`), `jet-composites/${testComp}`,
          `main.js should contain the debug component ${testComp}`);

        assert.equal(mainContent.toString().match(`jet-composites/${testComp}/min`), null,
          `main.js should not contain the minified component ${testComp}`);
      });
      it('release build:  path mapping to minified component', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} build web --release`, { cwd: appDir });
        const{ pathToBundleJs } = util.getAppPathData(util.APP_NAME);
        const bundleContent = fs.readFileSync(pathToBundleJs);
        assert.equal(bundleContent.toString().match(`jet-composites/${testComp}/min`), `jet-composites/${testComp}/min`,
          `bundle.js should contain the minified component ${testComp}`);

      });
    }
  });
});

describe('Build with a sass file in component folder', () => {
  if (!util.noBuild()) {
    it('should not fail build if there is a sass file in component folder root', async  () => {
      const { pathToApp, sourceFolder, javascriptFolder, componentsFolder } = util.getAppPathData(util.APP_NAME);
      // add a sass file in there
      const pathToANonComponentFolder = path.join(pathToApp, sourceFolder, javascriptFolder, componentsFolder, 'not-a-component');
      fs.mkdirSync(pathToANonComponentFolder);
      const pathToSassFile = path.join(pathToANonComponentFolder, 'foo.scss');
      fs.writeFileSync(pathToSassFile, '// Here is the sample file.');
      await util.execCmd(`${util.OJET_APP_COMMAND} add sass`, { cwd: appDir });
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: appDir });
      fs.removeSync(pathToSassFile);
      assert.equal(util.buildSuccess(result.stdout), true, result.error);
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
    ojetUtil = require(`${appDir}/node_modules/@oracle/ojet-cli/node_modules/@oracle/oraclejet-tooling/lib/util`);
    config = require(`${appDir}/node_modules/@oracle/ojet-cli/node_modules/@oracle/oraclejet-tooling/lib/config`);
    ojet = require(`${appDir}/node_modules/@oracle/ojet-cli/node_modules/@oracle/oraclejet-tooling/oraclejet-tooling`);
    valid = require(`${appDir}/node_modules/@oracle/ojet-cli/node_modules/@oracle/oraclejet-tooling/lib/validations`);
    toolingUtil = require(`${appDir}/node_modules/@oracle/ojet-cli/node_modules/@oracle/oraclejet-tooling/lib/util`);
  });

  it('should get all themes', () => {
    const wd = process.cwd();
    process.chdir(appDir);
    config();
    config.loadOraclejetConfig('web');
    const themes = ojetUtil.getAllThemes();
    process.chdir(wd);
    assert(themes.length === 0);
  });

  it('should read path mapping', () => {
    const wd = process.cwd();
    process.chdir(appDir);
    config();
    config.loadOraclejetConfig('web');
    const map = ojetUtil.readPathMappingJson();
    process.chdir(wd);
    assert(Object.prototype.hasOwnProperty.call(map, 'cdns'));
    assert(Object.prototype.hasOwnProperty.call(map, 'libs'));
    assert(map.use === 'local');
  });

  it('should validateBuildType and types', () => {
    const wd = process.cwd();
    process.chdir(appDir);
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
    npmCopy = require(`${appDir}/node_modules/@oracle/ojet-cli/node_modules/@oracle/oraclejet-tooling/lib/npmCopy`);
  });

  it('should have single Path Mapping Not Empty -- Dev', () => {
    const wd = process.cwd();
    process.chdir(appDir);
    const mapping = npmCopy.getMappingLibsList('dev', 'web');
    process.chdir(wd);
    assert(_.isEmpty(mapping) === false);
  });

  it('should have Single Path Mapping Not Empty -- Release', () => {
    const wd = process.cwd();
    process.chdir(appDir);
    const mapping = npmCopy.getMappingLibsList('release', 'web');
    process.chdir(wd);
    assert(_.isEmpty(mapping) === false);
  });
});

function killServeWin() {
  if (process.platform === 'win32') {
    try {
      const execSync = require('child_process').execSync;
      execSync(`wmic process where "CommandLine like '%%ojet serve%%'" call terminate`);
    } catch (e) {
      console.log('trapped');
    }
  }  
}

describe('add theming', () => {
  it('should add pcss generator', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);
  });

  it('Should create theme with basetheme stable after add theming', async () => {
    const removetheme = path.resolve(appDir, 'src/themes');
    fs.removeSync(removetheme);
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme themestable --basetheme=stable`, {cwd: appDir});
    assert.equal(/with css variables support/.test(result.stdout), true, result.stdout);
  });  
});


if (!util.noServe()) {
  describe('serve', () => {
    it('should serve with nobuild', async () => {
      // Write out new after_serve.js hook
      const { pathToAppHooks } = util.getAppPathData(util.APP_NAME);
      const afterServeHookPath = path.join(pathToAppHooks, `after_serve.js`);
      const defaultAfterServeHookContent = fs.readFileSync(afterServeHookPath);

      const newAfterServeHookContent = "'use strict';\n" + 
            "const exec = require('child_process').exec;\n" + 
            "module.exports = function (configObj) {\n" + 
            "return new Promise( (resolve, reject) => {\n" + 
            "let result = exec('node ../../ojet-cli/test/util/modSource.mjs');\n" + 
  	        "resolve(configObj);\n"+
            "});};";
            
      fs.writeFileSync(afterServeHookPath, newAfterServeHookContent);
  
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve web --no-build`, { cwd: appDir, maxBuffer: 1024 * 20000, timeout:30000, killSignal:'SIGTERM' }, true);
      assert.equal(/Watching files/i.test(result.stdout), true, result.stdout);
      assert.equal(/Watching Interval: 1000./i.test(result.stdout), true, result.stdout);

      const pathToWebIndexHTML = path.join(appDir, 'web', 'index.html');
      const webIndexHTML = fs.readFileSync(pathToWebIndexHTML, { encoding: 'utf-8' });      
      assert.equal(/<!-- test -->/.test(webIndexHTML), true, webIndexHTML);
      result.process.kill();
      killServeWin();

      // Replace after_serve.js hook
      fs.writeFileSync(afterServeHookPath, defaultAfterServeHookContent);
    });

    it('should serve with the chosen watch interval value', async () => {
      //const ac = new AbortController();
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve web --watchInterval=2000`, { cwd: appDir, maxBuffer: 1024 * 20000, timeout:30000, killSignal:'SIGTERM' }, true);
      assert.equal(/Watching Interval: 2000./i.test(result.stdout), true, result.stdout);
      result.process.kill();
      killServeWin();
      //ac.abort();
    });

    it('should serve from a given server url if provided', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve web --server-url=http://localhost:8080`, { cwd: appDir, maxBuffer: 1024 * 20000, timeout:30000, killSignal:'SIGTERM' }, true);
      assert.equal(/Connecting to http:\/\/localhost:8080/i.test(result.stdout), true, result.stdout);
      assert.equal(/Success: Server ready: http:\/\/localhost:8080/i.test(result.stdout), true, result.stdout);
      result.process.kill();
      killServeWin();
    });

    it('should serve from http://localhost:8000 if an empty string or undefined values is provided as the server url', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve web --server-url=`, { cwd: appDir, maxBuffer: 1024 * 20000, timeout:30000, killSignal:'SIGTERM' }, true);
      assert.equal(/Connecting to http:\/\/localhost:8000/i.test(result.stdout), true, result.stdout);
      assert.equal(/Success: Server ready: http:\/\/localhost:8000/i.test(result.stdout), true, result.stdout);
      result.process.kill();
      killServeWin();
    });

    it('should set destination to server-only when serving with the --server-only flag', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve --server-only`, { cwd: appDir, maxBuffer: 1024 * 20000, timeout:30000, killSignal:'SIGTERM' }, true);
      assert.equal(/Destination: server-only/i.test(result.stdout), true, result.stdout);
      assert.equal(/Success: Server ready:/i.test(result.stdout), true, result.stdout);
      result.process.kill();
      killServeWin();
    });
  });
}

describe('add testing', () => {
  it('should add testing config files', async () => {
    await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, { cwd: appDir }, false, true);
    const { pathToApp } = util.getAppPathData(util.APP_NAME);
    const hasTestConfigFile = fs.existsSync(path.join(pathToApp, 'test-config', 'karma.conf.js'));
    const hasTestMainFile = fs.existsSync(path.join(pathToApp, 'test-config', 'test-main.js'));
    const hasTsConfigJson = fs.existsSync(path.join(pathToApp, 'test-config', 'tsconfig.json'));

    assert.equal(hasTestConfigFile, true, 'Has no karma.conf.js file.');
    assert.equal(hasTestMainFile, true, 'Has no test-main.js file.');
    assert.equal(hasTsConfigJson, true, 'Has no tsconfig.json file.');
    
  });
  
  it('should use the flag --legacy-peer-deps when running ojet add testing and if enableLegacyPeerDeps is enabled in oracljetconfig.json', async () => {
    const oracleJetConfigJSON = util.getOracleJetConfigJson(util.APP_NAME);
    oracleJetConfigJSON.enableLegacyPeerDeps = true;
    util.writeOracleJetConfigJson(util.APP_NAME, oracleJetConfigJSON);

    const result = await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, { cwd: appDir }, false, true);

    assert.equal(/--legacy-peer-deps/.test(result.stdout), true, result.error);
  });
});

describe('mapping for react preact in JET templates', () => {
  it('should check that an entry is added in the main.js on having requireMap in path_mapping.json', async () => {
    const { pathToApp, javascriptFolder, sourceFolder, stagingFolder } = util.getAppPathData(util.APP_NAME);
    const pathToMainJsInSrc = path.join(pathToApp, sourceFolder, javascriptFolder, 'main.js');
    const pathToPathMappingInSrc = path.join(pathToApp, sourceFolder, javascriptFolder, 'path_mapping.json');
    const pathToMainJsInStaging = path.join(pathToApp, stagingFolder, javascriptFolder, 'main.js');

    if (fs.existsSync(pathToMainJsInSrc) && fs.existsSync(pathToPathMappingInSrc)) {
      // Modify the path mapping entry for preact/compat to introduce the requireMap
      // property:
      const pathMappingObj = fs.readJSONSync(pathToPathMappingInSrc);
      pathMappingObj.libs['preact/compat'].requireMap = ['react'];
      fs.writeJSONSync(pathToPathMappingInSrc, pathMappingObj);

      // Modify the main.js file to include the property map in the requireJs config
      // object:
      let mainJsContent = fs.readFileSync(pathToMainJsInSrc, { encoding: 'utf-8' });
      mainJsContent = mainJsContent.replace(
        'baseUrl: \'js\',', 
        `
        baseUrl: 'js',
        map: 
          // injector:requireMap
          {
          },
          // endinjector`
      );
      fs.writeFileSync(pathToMainJsInSrc, mainJsContent, { encoding: 'utf-8' });
    }

    await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: appDir });
    
    const mainJsContentInWeb = fs.readFileSync(pathToMainJsInStaging, { encoding: 'utf-8' });
    const regex = /\"\*\"\s*:\s*{\s*"react":\s*"preact\/compat"\s*}/gm;
    const hasTheRequireMapping = fs.existsSync(pathToMainJsInStaging) && regex.test(mainJsContentInWeb);
    assert.equal(hasTheRequireMapping, true, 'Has no map property in the main.js require config object.');
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

  describe('Customization Test', () => {  
    it('should get default paths', () => {
      const defaultPaths = ojetPaths.getDefaultPaths();
      assert(!_.isEmpty(defaultPaths));
    });
  
    it('should validate configured paths', () => {
      const defaultPaths = ojetPaths.getDefaultPaths();
      assert(defaultPaths.source == 'src');
      assert(defaultPaths.sourceWeb == 'src-web');
      assert(defaultPaths.sourceJavascript == 'js');
      assert(defaultPaths.sourceThemes == 'themes');
      assert(defaultPaths.stagingWeb == 'web');
      assert(defaultPaths.stagingThemes == constants.APP_STAGED_THEMES_DIRECTORY);
    });
  
  
    it('should get configured paths', () => {
      const confPaths = ojetPaths.getConfiguredPaths(appDir);
      assert(!_.isEmpty(confPaths));
    });
  
    it('should validate configured paths', () => {
      const defaultPaths = ojetPaths.getDefaultPaths();
      const confPaths = ojetPaths.getConfiguredPaths(appDir);
      assert(_.isEqual(confPaths, defaultPaths));
    });
  
    it('should validate is cwd is JET App', () => {
      const wd = process.cwd();
      process.chdir(appDir);
      const isJetApp = ojetUtil.ensureJetApp();
      process.chdir(wd);
      assert(isJetApp);
    });
  
    it('should validate util ensure parameters', () => {
      assert.doesNotThrow(() => {
        ojetUtil.ensureParameters('component');
      });
    });
  });

  describe('Webpack with components test', () => {
    it('should prompt user when adding webpack with local components', async () => {
//      util.execCmd(`${util.OJET_APP_COMMAND} add webpack`, { cwd: appDir }, false, true).then((result) => {
      const child = require('child_process').exec(`${util.OJET_APP_COMMAND} add webpack`, { cwd: appDir }, (error, stdout, stderr) => {
        const result = { error, stdout, stderr, process: child };
        if (error) {
          console.log(result);        
        } else {
          assert.equal(new RegExp('Aborting the command "ojet add webpack"').test(result.stdout), true, result.error);
        }
      });
      child.stdin.write('no\n');
    });
  });

  describe('Clean up test', () => {  
    if (!util.noBuild()) {
      it('should clean successfully', async  () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} clean`, { cwd: appDir });
        assert.equal(new RegExp('Finished clean path').test(result.stdout), true, result.error);
      });
    }
  });
});
