/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const util = require('./util');
const path = require('path');

const TEST_DIR = path.resolve('../test_result');
const PACK_NAME = 'pack-1';
const DEFAULT_PACK_VERSION = '1.0.0';
const COMPONENT_NAME = 'comp-1';
const VCOMPONENT_NAME = 'vcomp-1';
const EXCHANGE_PACK = 'oj-gbu-app';
const EXCHANGE_PACK_VERSION = '3.0.0';
const EXCHANGE_PACK_BUNDLE = 'shell-bundle';

const BUNDLE_PACK_NAME = 'packbundle-1';
const BUNDLE_NAME = 'component-bundle';

const BUNDLE_COMPONENT_NAME1 = 'bundlecomp-1';
const BUNDLE_COMPONENT_NAME2 = 'bundlecomp-2';

const BUNDLE_VCOMPONENT_NAME1 = 'bundlevcomp-1';
const BUNDLE_VCOMPONENT_NAME2 = 'bundlevcomp-2';


const SLASH_STAR = '/*'

function execPackCommand({ task, app, pack, version }) {
  return util.execCmd(
    `${util.OJET_APP_COMMAND} ${task} pack ${pack}${version ? `@${version}` : ''}`,
    { cwd: util.getAppDir(app) },
    false,
    true
  );
}

function execComponentInPackCommand({ task, app, pack, component, flags = '', squelch = false }) {
  const command = `${util.OJET_APP_COMMAND} ${task} component ${component} ${flags} --pack=${pack}`;
  return util.execCmd(command, { cwd: util.getAppDir(app) }, squelch, true);
}

function beforePackTest({ task, app, pack, version }) {
  before(async () => {
    const result = await execPackCommand({ task, app, pack, version });
    it(`should ${task} a pack`, () => {
      assert.ok(util[`${task}PackSuccess`]({ pack, stdout: result.stdout }), result.error);
    });
  });
}

function beforeComponentInPackTest({ task, app, pack, component, flags = '' }) {
  before(async () => {
    const result = await execComponentInPackCommand({ task, app, pack, component, flags });
    it(`should ${task} a component in a pack`, () => {
      assert.ok(util[`${task}ComponentInPackSuccess`]({ component, stdout: result.stdout }), result.error);
    });
  });
}

function createPackTest({ appName, scriptsFolder, pack, bundle }) {
  if (!util.noScaffold()) {
    beforePackTest({ task: 'create', app: appName, pack });
  }
  describe('check created pack', () => {
    it(`should have ${appName}/src/${scriptsFolder}/${pack}/component.json`, () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        pack,
        'component.json'
      ));
      const exists = fs.pathExistsSync(pathToComponentJson);
      assert.ok(exists, pathToComponentJson);
      if (bundle) addBundle(pathToComponentJson);
    });
    it('should have the correct pack name in component.json', () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        pack,
        'component.json'
      ));
      const componentJson = fs.readJSONSync(pathToComponentJson);
      const nameMatches = componentJson.name === pack;
      assert(nameMatches, 'pack name does not match in component.json');
    });
    if (scriptsFolder === 'ts') {
      it(`should have ${pack}${SLASH_STAR} in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${pack}${SLASH_STAR}`;
        const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
        assert.ok(hasEntryInTsconfigJson, `${tsconfigJsonEntry} not found in ${appName}/tsconfig.json`);
      });
    }
  });
}
function createComponentInPackTest({ appName, scriptsFolder, pack, component }) {
  if (!util.noScaffold()) {
    beforeComponentInPackTest({ task: 'create', app: appName, pack, component });
  }
  describe('check created component in pack', () => {
    it(`should have ${appName}/src/${scriptsFolder}/${pack}/${component}/component.json`, () => {
      const pathToComponent = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        pack,
        component
      ));
      const exists = fs.pathExistsSync(pathToComponent);
      assert.ok(exists, pathToComponent);
    });
    it('should have the correct pack in component.json', () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        pack,
        component,
        'component.json'
      ));
      const componentJson = fs.readJSONSync(pathToComponentJson);
      const packMatches = componentJson.pack === pack;
      assert(packMatches, 'component does not have correct pack in component.json');
    });
    it('should add entry to dependencies object in pack', () => {
      const pathToPackComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        pack,
        'component.json'
      ));
      const componentJson = fs.readJSONSync(pathToPackComponentJson);
      const entryExists = !!componentJson.dependencies[`${pack}-${component}`];
      assert(entryExists, 'did not add component entry to dependencies in pack component.json');
    });
  });
}

// 
// Create a 'stripped down' vcomponent in a pack.
// The pack's vcomponent will have:
//   - missing ojmetadata from the vcomponent's .tsx file 
//     (including version, jetVersion, pack)
//     (e.g: webTsComponentTest/src/ts/pack-1/vcomp-1/vcomp-1.tsx
//   - missing dependencies from the pack's component.json.
// 
// function createVComponentInPackTestNew({ appName, scriptsFolder, pack, component }) {
function createVComponentInPackTest({ appName, scriptsFolder, pack, component }) {
  if (!util.noScaffold()) {
    beforeComponentInPackTest({ task: 'create', app: appName, pack, component, flags: '--vcomponent' });
  }
  describe('check created component in pack', () => {
    const pathToComponent = util.getAppDir(path.join(
      util.getAppDir(appName),
      'src',
      scriptsFolder,
      'jet-composites',
      pack,
      component,
      `${component}.tsx`
    ));
    it(`should have ${appName}/src/${scriptsFolder}/${pack}/${component}/${component}.tsx`, () => {
      const exists = fs.pathExistsSync(pathToComponent);
      assert.ok(exists, pathToComponent);
    });
    it('should have the correct pack in @ojmetadata pack jsdoc', () => {
      const packRegex = new RegExp('@ojmetadata pack "(?<pack>.+)"');
      const componentContent = fs.readFileSync(pathToComponent, { encoding: 'utf-8' });
      const matches = packRegex.exec(componentContent);
      const packMatches = matches && matches.groups.pack === pack;
      assert(packMatches, 'vcomponent does not have correct pack @ojmetadata pack jsdoc');
      // 
      // For the pack PACK_NAME, delete two lines from the .tsx file:
      //   - delete "ojmetadata version" 
      //   - delete "ojmetadata pack" 
      // So we test it by just validating the pack build 
      // and comparing the version etc. info from the component.json's under
      // webTsComponentTest/web/js/jet-composites/pack-1
      // (this verfication is done in buildPackTest())
      //
      if (pack === PACK_NAME) {
        let newData = componentContent.replace(/.*ojmetadata\s+version.*\n?/, '');
        newData = newData.replace(/.*ojmetadata\s+pack.*\n?/, '');
        fs.writeFileSync(pathToComponent, newData, 'utf-8');
      }
    });
    it('should add entry to dependencies object in pack', () => {
      const pathToPackComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        pack,
        'component.json'
      ));
      const packComponentJson = fs.readJSONSync(pathToPackComponentJson);
      const entryExists = !!packComponentJson.dependencies[`${pack}-${component}`];
      assert(entryExists, 'did not add vcomponent entry to dependencies in pack component.json');
      // 
      // delete the dependencies from the pack's component.json file.
      // As we do for the missing ojmetadata, 
      // we test it by just validating the pack build (when the pack contains a vcomponent)
      // 
      if (pack === PACK_NAME) {
        delete packComponentJson.dependencies;
        fs.writeJsonSync(pathToPackComponentJson, packComponentJson, { spaces: 2 });
      }
    });
  });
}

function createComponentInPackFailureTest({ appName, pack, component }) {
  describe('check create component in pack failure', () => {
    it('should fail with "Invalid pack name:"', async () => {
      const task = 'create';
      const result = await execComponentInPackCommand({ task, app: appName, pack, component, flags: '', squelch: true });
      assert.ok(util[`${task}ComponentInPackFailure`]({ stdout: result.stdout }), result.error);
    });
  });
}

function addPackTest({ appName, scriptsFolder, pack, version, bundle }) {
  if (!util.noScaffold()) {
    beforePackTest({ task: 'add', app: appName, pack, version });
  }
  describe('check added pack', () => {
    it(`should have ${appName}/jet_components/${pack}/component.json`, () => {
      const pathToPackComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'jet_components',
        pack,
        'component.json'
      ));
      const exists = fs.pathExistsSync(pathToPackComponentJson);
      assert.ok(exists, pathToPackComponentJson);
    });
    if (scriptsFolder === 'ts') {
      it(`should have ${pack}${SLASH_STAR} in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${pack}${SLASH_STAR}`;
        const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
        assert.ok(hasEntryInTsconfigJson, `${tsconfigJsonEntry} not found in ${appName}/tsconfig.json`);
      });
    }
    it(`should have all the pack members listed in component.json`, () => {
      const pathToPack = util.getAppDir(path.join(
        util.getAppDir(appName),
        'jet_components',
        pack
      ));
      const pathToPackComponentJson = path.join(
        pathToPack,
        'component.json'
      );
      const componentJson = fs.readJSONSync(pathToPackComponentJson);
      Object.keys(componentJson.dependencies).forEach(dependency => {
        if (dependency.startsWith(pack)) {
          const pathToPackComponent = path.join(pathToPack, dependency.slice(pack.length + 1));
          const exists = fs.pathExistsSync(pathToPackComponent);
          assert.ok(exists, pathToPackComponent);
        }
      });
    });
  });
}

function buildComponentAppTest({ appName, pack, component, vcomponent, release, scriptsFolder }) {
  const testName = release ? 'Build (Release)' : 'Build';
  const buildType = release ? 'release' : 'default';
  describe(testName, () => {
    if (!util.noBuild()) {
      it(`should build ${buildType} component app`, async () => {
        let command = `${util.OJET_APP_COMMAND} build`;
        command = release ? `${command} --release` : command;
        const result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, false, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    const appDir = path.resolve(TEST_DIR, appName);
    const componentsDir = path.join(appDir, 'web', 'js', 'jet-composites');
    const packMinDir = path.join(componentsDir, pack, DEFAULT_PACK_VERSION, 'min');
    if (release) {
      it('should have pack(s) with /min directory', () => {
        const exists = fs.pathExistsSync(packMinDir);
        assert.ok(exists, packMinDir);
      })
      it(`should have pack(s) with component in /min directory ${packMinDir}/${component}`, () => {
        const pathToComponent = path.join(packMinDir, component);
        const exists = fs.pathExistsSync(pathToComponent);
        assert.ok(exists, pathToComponent);
      });
    } else {
      it('should not have pack(s) with /min directory', () => {
        const exists = fs.pathExistsSync(packMinDir);
        assert.ok(!exists, packMinDir);
      })
    }
    if (scriptsFolder === 'ts') {
      it('should have pack(s) with /types directory', () => {
        const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', pack, DEFAULT_PACK_VERSION, 'types', vcomponent);
        const exists = fs.pathExistsSync(typesDir);
        assert.ok(exists, typesDir);
      });
      it('should not have vcomponent(s) in pack with /types directory', () => {
        const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', pack, DEFAULT_PACK_VERSION, vcomponent, 'types');
        const exists = fs.pathExistsSync(typesDir);
        assert.ok(!exists, typesDir);
      });
    }
  });
}

function buildReleaseCheckBundle({ appName, pack, component, vcomponent, scriptsFolder }) {
  const testName ='Build (Release)';
  const buildType = 'release';
  describe(testName, () => {
    if (!util.noBuild()) {
      it(`should build ${buildType} component app`, async () => {
        let command = `${util.OJET_APP_COMMAND} build --release`;
        const result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, false, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    const appDir = path.resolve(TEST_DIR, appName);
    it('should not have the bundle stub file', () => {
      const pathToBundle = path.join(
        appDir,
        'web/js/jet-composites',
        pack,
        DEFAULT_PACK_VERSION,
        'component-bundles.js'
      );
      const exists = fs.existsSync(pathToBundle);
      assert.ok(!exists, pathToBundle);
    });

    it('release build: path mapping to minified bundle', async () => {
      // The following entry should be in paths:
      // "packbundle-1":"jet-composites/packbundle-1/1.0.0/min"
      const bundleContent = getBundleContent({ appName });
      assert.equal(bundleContent.toString().match(`jet-composites/${BUNDLE_PACK_NAME}/1.0.0/min`), 
                   `jet-composites/${BUNDLE_PACK_NAME}/1.0.0/min`,
                   `bundle.js should contain the minified bundle ${BUNDLE_PACK_NAME}`);

    });

    it('release build: bundle content (local component)', async () => {
      // Check the bundle for the local pack bundle property
      const localPackBundle = `${BUNDLE_PACK_NAME}/${BUNDLE_NAME}`;
      var hasLocalPackBundle = false;
      const bundlesPropObj = getBundleObj({ appName });
      if (bundlesPropObj.hasOwnProperty(localPackBundle)) {
        hasLocalPackBundle = true;
      }
      assert.ok(hasLocalPackBundle, `local pack bundle ${localPackBundle} injected into bundles.js`);
    });

    it('release build: bundle content (exchange component)', async () => {
      // Check the bundle for the exchange pack bundle property
      const exchangePackBundle = `${EXCHANGE_PACK}/${EXCHANGE_PACK_BUNDLE}`;
      var hasExchangePackBundle = false;
      const bundlesPropObj = getBundleObj({ appName });
      if (bundlesPropObj.hasOwnProperty(exchangePackBundle)) {
        hasExchangePackBundle = true;
      }
      assert.ok(hasExchangePackBundle, `exchange pack bundle ${exchangePackBundle} injected into bundles.js`);
    });
  });
}

function packagePackTest({ appName, pack }) {
  if (!util.noScaffold()) {
    beforePackTest({ task: 'package', app: appName, pack });
  }
  describe('check packaged pack', () => {
    it(`should be packaged in ${appName}/dist/${pack}.zip`, () => {
      const packagedComponentPath = util.getAppDir(path.join(
        util.getAppDir(appName),
        'dist',
        `${pack}_1-0-0.zip`,
      ));
      const exists = fs.pathExistsSync(packagedComponentPath);
      assert.ok(exists, packagedComponentPath);
    });
  });
}


function buildPackTest({ appName, pack, vcomponent, scriptsFolder }) {
  if (!util.noScaffold()) {
    beforePackTest({ task: 'build', app: appName, pack });
  }
  describe('check built pack', () => {
    const appDir = path.resolve(TEST_DIR, appName);
    const packComponentJsonPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, DEFAULT_PACK_VERSION, 'component.json');
    const componentJsonPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, DEFAULT_PACK_VERSION, vcomponent, 'component.json');
    it(`should have ${appName}/web/js/jet-composites/${pack}/${DEFAULT_PACK_VERSION}/component.json`, () => {
      const exists = fs.pathExistsSync(packComponentJsonPath);
      assert.ok(exists, packComponentJsonPath);
    });
    if (scriptsFolder === 'ts') {
      it(`should have ${appName}/web/js/jet-composites/${pack}/${DEFAULT_PACK_VERSION}/${vcomponent}/component.json`, () => {
        const exists = fs.pathExistsSync(componentJsonPath);
        assert.ok(exists, componentJsonPath);
      });
      it(`should have ${appName}/web/js/jet-composites/${pack}/${DEFAULT_PACK_VERSION}/types/${vcomponent}`, () => {
        const typesDirPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, DEFAULT_PACK_VERSION, 'types', vcomponent);
        const exists = fs.pathExistsSync(typesDirPath);
        assert.ok(exists, typesDirPath);
      });
      if (pack === PACK_NAME) {
        it('should have matching pack and vComponent versions (in component.json)', () => {
          // Verifies the delete "ojmetadata version" from the .tsx file
          // (in createVComponentInPackTest).
          // Ensure that the version of the pack component matches
          // the version of the pack.
          const componentJson = fs.readJSONSync(componentJsonPath);
          const packComponentJson = fs.readJSONSync(packComponentJsonPath);
          assert.equal(packComponentJson.version, componentJson.version, `${componentJsonPath} should have a valid version (${componentJson.version} === ${packComponentJson.version})`);
          assert.equal(packComponentJson.name, componentJson.pack, `${componentJsonPath} should have a valid pack (${componentJson.name} === ${packComponentJson.pack})`);
        })
      }
    }
  })
}
//
// Insert a bundle directive into the pack's component.json.
// Example:
//
//  "bundles": {
//   "packbundle-1/component-bundle": [
//    "packbundle-1/bundlecomp-1/loader",
//    "packbundle-1/bundlecomp-2/loader"
//   ]
//
function addBundle(pathToComponent) {
  const componentJson = fs.readJSONSync(pathToComponent);
  if (componentJson) {
    componentJson.bundles = {};
    componentJson.bundles[`${BUNDLE_PACK_NAME}/${BUNDLE_NAME}`] = [`${BUNDLE_PACK_NAME}/${BUNDLE_COMPONENT_NAME1}/loader`, `${BUNDLE_PACK_NAME}/${BUNDLE_COMPONENT_NAME2}/loader`];
    fs.writeJsonSync(pathToComponent, componentJson, { spaces: 2 });
  }
}

function getBundleContent({ appName }) {
  const{ pathToBundleJs } = util.getAppPathData({ appName });
  const bundleContent = fs.readFileSync(pathToBundleJs);
  return bundleContent;
}

//
// Return a bundle property object.
//
function getBundleObj({ appName }) {
  const bundleContent = getBundleContent({ appName });
  // 
  // Read the bundle properties from bundleContent, 
  // then convert these bundle property/value arrays to an object.
  // 
  // Then test the object properties for the following:
  //   - local pack bundle
  //     (`${BUNDLE_PACK_NAME}/${BUNDLE_NAME}`)
  //   - exchange pack bundle
  //     For the exchange pack bundle, we just check the prefix
  //

  // Regular expression to extract all bundle properties.
  // Used to parse bundles.js
  let bundlesRegEx = /bundles:\{([^{}]*)\}/;

  // extract bundles properties
  const bundlesProps = bundleContent.toString().match(bundlesRegEx).pop();

  // Add brackets to form object
  var bundlesPropsPlusBrackets = `\{${bundlesProps}\}`;
  // convert to object
  var bundlesPropObj = JSON.parse(bundlesPropsPlusBrackets);

  return bundlesPropObj;
}

describe('JET Pack Tests', () => {
  describe('ojet create pack', () => {
    util.runComponentTestInAllTestApps({ test: createPackTest, pack: PACK_NAME });
  });
  describe('ojet create component --pack', () => {
    describe('valid pack name', () => {
      util.runComponentTestInAllTestApps({ test: createComponentInPackTest, pack: PACK_NAME, component: COMPONENT_NAME });
    })
    describe('invalid pack name', () => {
      util.runComponentTestInAllTestApps({ test: createComponentInPackFailureTest, pack: 'pack-2', component: COMPONENT_NAME });
    })
  });
  //
  // Create  a 'stripped down vcomponent',
  // where the pack's vcomponent has a missing version etc.
  //
  describe('ojet create component --vcomponent --pack', () => {
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: createVComponentInPackTest,
      pack: PACK_NAME,
      component: VCOMPONENT_NAME
    });
  });
  describe('ojet add pack', () => {
    util.runComponentTestInAllTestApps({ test: addPackTest, pack: EXCHANGE_PACK, version: EXCHANGE_PACK_VERSION });
  })
  describe('ojet package pack', () => {
    util.runComponentTestInAllTestApps({
      test: packagePackTest, 
      pack: PACK_NAME
    });
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: packagePackTest, 
      pack: PACK_NAME,
      component: VCOMPONENT_NAME
    });
  });

  describe('ojet build', () => {
    util.runComponentTestInAllTestApps({ test: buildComponentAppTest, pack: PACK_NAME, component: COMPONENT_NAME, vcomponent: VCOMPONENT_NAME, release: false });
  });
  describe('ojet build --release', () => {
    util.runComponentTestInAllTestApps({ test: buildComponentAppTest, pack: PACK_NAME, component: COMPONENT_NAME, vcomponent: VCOMPONENT_NAME, release: true });
  });

  // Verify the 'stripped down vcomponent' created in createVComponentInPackTest.
  describe('ojet build pack <pack>', () => {
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: buildPackTest, 
      pack: PACK_NAME,
      vcomponent: VCOMPONENT_NAME
    });
  });

  //
  // Pack Bundle Test.
  //

  // Create a pack with two components.
  // Verify that ojet build and ojet build --release build properly.
  //
  // Command-line steps to recreate test conditions:
  //
  //  % ojet create myapp
  //  % cd myapp;
  //  % ojet create pack packbundle-1
  //  % ojet create component bundlecomp-1 --pack=packbundle-1
  //  % ojet create component bundlecomp-2 --pack=packbundle-1
  //
  // Then insert bundles into the pack (packbundle-1/component.json)
  //
  //    "bundles":{
  //    "packbundle-1/component-bundle":["packbundle-1/bundlecomp-1/loader","packbundle-1/bundlecomp-2/loader"]
  //  }
  //
  //  % ojet build release
  //  % ojet build --release 
  //
  describe('ojet create pack (bundle) ', () => {
    util.runComponentTestInAllTestApps({
      test: createPackTest, 
      pack: BUNDLE_PACK_NAME,
      bundle: true
    });
  });

  // create two pack components
  describe('ojet create component --pack (bundle)', () => {
    describe('valid pack name', () => {
      util.runComponentTestInAllTestApps({
        test: createComponentInPackTest,
        pack: BUNDLE_PACK_NAME,
        component: BUNDLE_COMPONENT_NAME1
      });
      util.runComponentTestInAllTestApps({
        test: createComponentInPackTest,
        pack: BUNDLE_PACK_NAME,
        component: BUNDLE_COMPONENT_NAME2
      });
    });
  });

  // create two pack vcomponents
  describe('ojet create component --vcomponent --pack (bundle) ', () => {
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: createVComponentInPackTest,
      pack: BUNDLE_PACK_NAME,
      component: BUNDLE_VCOMPONENT_NAME1
    });
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: createVComponentInPackTest,
      pack: BUNDLE_PACK_NAME,
      component: BUNDLE_VCOMPONENT_NAME2
    });
  });

  describe('ojet build pack <pack>', () => {
    util.runComponentTestInAllTestApps({
      test: buildPackTest, 
      pack: BUNDLE_PACK_NAME,
      vcomponent: BUNDLE_VCOMPONENT_NAME1
    });
  });

  describe('ojet build (bundle) ', () => {
    util.runComponentTestInAllTestApps({
      test: buildComponentAppTest,
      pack: BUNDLE_PACK_NAME,
      component: BUNDLE_COMPONENT_NAME1,
      vcomponent: BUNDLE_VCOMPONENT_NAME1,
      release: false
    });
  });

  describe('ojet build --release (bundle)', () => {
    util.runComponentTestInAllTestApps({
      test: buildReleaseCheckBundle,
      pack: BUNDLE_PACK_NAME,
      component: BUNDLE_COMPONENT_NAME1,
      vcomponent: BUNDLE_VCOMPONENT_NAME1
    });
  });
});
