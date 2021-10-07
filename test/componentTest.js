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

const COMPONENT_NAME = 'comp-1';
// Component with type:composite
const COMPONENT_NAME_COMPOSITE = 'comp-composite';
// Component with type:demo
const COMPONENT_NAME_DEMO = 'comp-demo';
const VCOMPONENT_NAME = 'vcomp-1';
const DEFAULT_COMPONENT_VERSION = '1.0.0';
const EXCHANGE_COMPONENT_PACK = 'oj-dynamic';
const EXCHANGE_COMPONENT_PACK_MEMBER = 'form';
const EXCHANGE_COMPONENT_NAME = `${EXCHANGE_COMPONENT_PACK}-${EXCHANGE_COMPONENT_PACK_MEMBER}`;

// This value is set initially but later updated
// the specific (and possibly more accurate) version
// that was downloaded in add component
const EXCHANGE_COMPONENT_VERSION = '9.0.0-alpha10';

// Use SLASH_STAR to avoid code editor malformatting
const SLASH_STAR = '/*';

function execComponentCommand({ task, app, component, flags = '' }) {
  return util.execCmd(`${util.OJET_APP_COMMAND} ${task} component ${component} ${flags}`, { cwd: util.getAppDir(app) }, true, true);
}

function beforeComponentTest({ task, app, component, flags }) {
  before(async () => {
    const result = await execComponentCommand({ task, app, component, flags });
    it(`should ${task} a component`, () => {
      assert.ok(util[`${task}ComponentSuccess`]({ component, stdout: result.stdout }), result.error);
    });
  });
}

function createComponentTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'create', app: appName, component });
  }
  describe('check created component', () => {
    it(`should have ${appName}/src/${scriptsFolder}/jet-composites/${component}/component.json`, () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        'component.json'
      ));
      const exists = fs.pathExistsSync(pathToComponentJson);
      assert.ok(exists, pathToComponentJson);
    });
    it('should have the correct component name in component.json', () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        'component.json'
      ));
      const componentJson = fs.readJSONSync(pathToComponentJson);
      const nameMatches = component === componentJson.name;
      assert.ok(nameMatches, 'component name does not match name in component.json');
    })
    it('should not have a pack in component.json', () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        'component.json'
      ));
      const componentJson = fs.readJSONSync(pathToComponentJson);
      const noPack = !componentJson.pack;
      assert(noPack, 'component has a pack in component.json');
    });
    if (scriptsFolder === 'ts') {
      it(`should have ${component}${SLASH_STAR} in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${component}${SLASH_STAR}`;
        const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
        assert.ok(hasEntryInTsconfigJson, `${tsconfigJsonEntry} not found in ${appName}/tsconfig.json`);
      });
    }
  });
}


//
// Creates a composite component.
// Approach: create a component, then edit the component.json to insert
// 'type': 'composite'.
//
// Also we add a dependency on the exchange component.
// In a subsequent (release build) test, this will verify the dependency on a pack component.
//
function createComponentTypeCompositeTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'create', app: appName, component });
  }
  describe('check created component', () => {
    it(`should have ${appName}/src/${scriptsFolder}/${component}/jet-composites/component.json`, () => {
      const pathToComponentJson = path.join(
        util.getAppDir(appName), 'src', scriptsFolder,
        'jet-composites', component, 'component.json');
      addDependency(pathToComponentJson);
    });
  });
}

function addDependency(componentJsonPath) {
  // update component.json with 'type': 'composite'
  const componentJson = fs.readJSONSync(componentJsonPath);
  if (componentJson) {
    componentJson.type = 'composite';
    componentJson.dependencies = {};
    componentJson.dependencies[EXCHANGE_COMPONENT_NAME] = EXCHANGE_COMPONENT_VERSION;
    fs.writeJsonSync(componentJsonPath, componentJson, { spaces: 2 });
  }
}

// 
// Create a component with type:demo.
// 
function createComponentTypeDemoTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'create', app: appName, component });
  }
  describe('check created demo component', () => {
    it(`should have ${appName}/src/${scriptsFolder}/${component}/jet-composites/component.json`, () => {
      const pathToComponentJson = path.join(
        util.getAppDir(appName), 'src', scriptsFolder,
        'jet-composites', component, 'component.json');
      addDemoType(pathToComponentJson);
    });
  });
}

//
// Update component.json with 'type': 'demo'
//
function addDemoType(componentJsonPath) {
  const componentJson = fs.readJSONSync(componentJsonPath);
  if (componentJson) {
    componentJson.type = 'demo';
    fs.writeJsonSync(componentJsonPath, componentJson, { spaces: 2 });
  }
}

function createVComponentTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'create', app: appName, component, flags: '--vcomponent' });
  }
  describe('check created vcomponent', () => {
    const pathToComponent = util.getAppDir(path.join(
      util.getAppDir(appName),
      'src',
      scriptsFolder,
      'jet-composites',
      component,
      `${component}.tsx`
    ));
    it(`should have ${appName}/src/${scriptsFolder}/${component}/${component}.tsx`, () => {
      const exists = fs.pathExistsSync(pathToComponent);
      assert.ok(exists, pathToComponent);
    });
    it('should not have @ojmetadata pack "@pack-name@" jsdoc', () => {
      const packRegex = new RegExp('@ojmetadata pack', 'g');
      const componentContent = fs.readFileSync(pathToComponent, { encoding: 'utf-8' });
      const hasPack = !!packRegex.exec(componentContent);
      assert.ok(!hasPack, 'singleton vcomponent has @ojmetadata pack jsdoc');
    });
  });
}

function createComponentFailureTest({ appName, component }) {
  describe('check component create failure', () => {
    it ('should fail with "Invalid component name:"', async () => {
      const task = 'create';
      const result = await execComponentCommand({ task, app: appName, component });
      assert.ok(util[`${task}ComponentFailure`]({ component, stdout: result.stdout }), result.error);
    })
  })
}

function addComponentTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'add', app: appName, component });
  }
  describe('check added component', () => {
    it(`should have ${appName}/jet_components/${EXCHANGE_COMPONENT_PACK}/${EXCHANGE_COMPONENT_PACK_MEMBER}/component.json`, () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'jet_components',
        EXCHANGE_COMPONENT_PACK,
        EXCHANGE_COMPONENT_PACK_MEMBER,
        'component.json'
      ));
      const exists = fs.pathExistsSync(pathToComponentJson);
      assert.ok(exists, pathToComponentJson);
    });
    if (scriptsFolder === 'ts') {
      it(`should have ${EXCHANGE_COMPONENT_PACK}${SLASH_STAR} in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${EXCHANGE_COMPONENT_PACK}${SLASH_STAR}`;
        const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
        assert.ok(hasEntryInTsconfigJson, `${tsconfigJsonEntry} not found in ${appName}/tsconfig.json`);
      });
    }
  });
}

function removeComponentTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'remove', app: appName, component });
  }
  describe('check removed component', () => {
    it(`should not have ${appName}/jet_components/${EXCHANGE_COMPONENT_PACK}/${EXCHANGE_COMPONENT_PACK_MEMBER}/component.json`, () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'jet_components',
        EXCHANGE_COMPONENT_PACK,
        EXCHANGE_COMPONENT_PACK_MEMBER,
        'component.json'
      ));
      const exists = fs.pathExistsSync(pathToComponentJson);
      assert.ok(!exists, pathToComponentJson);
    });
    if (scriptsFolder === 'ts') {
      it(`should not have ${EXCHANGE_COMPONENT_PACK}${SLASH_STAR} in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${EXCHANGE_COMPONENT_PACK}${SLASH_STAR}`;
        const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
        assert.ok(!hasEntryInTsconfigJson, `${tsconfigJsonEntry} found in ${appName}/tsconfig.json`);
      });
    }
  });
}


function buildComponentTest({ appName, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'build', app: appName, component });
  }
  describe('check built component', () => {
    const appDir = util.getAppDir(appName);
    it(`should be built in ${appName}/web/js/jet-composites/${component}/${DEFAULT_COMPONENT_VERSION}`, () => {
      const builtComponentPath = path.join(appDir, 'web', 'js', 'jet-composites', component, DEFAULT_COMPONENT_VERSION);
      const exists = fs.pathExistsSync(builtComponentPath);
      assert.ok(exists, builtComponentPath);
    });
    if (component === VCOMPONENT_NAME) {
      it(`should have a types folder in ${appName}/web/js/jet-composites/${component}/${DEFAULT_COMPONENT_VERSION}/types`, () => {
        const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', component, DEFAULT_COMPONENT_VERSION, 'types');
        const exists = fs.pathExistsSync(typesDir);
        assert.ok(exists, typesDir);
      });
    }
  })
}

//
// Run a release build for a type:demo component
// Ensure that the path mapping is to the *debug* area.
// (note that type:demo components are not minified, thus the
//  path mapping should't be to /min for type:demo components).
// 
function releaseBuildComponentTypeDemoTest({ appName, component }) {

  describe('check type:demo component', () => {

    if (!util.noBuild()) {

      const appDir = util.getAppDir(appName);

      it('should build release js app (type:demo) ', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });

      // Verify that the path mapping for the demo component in the bundle 
      // points to the debug area.
      it('release build:  path mapping to debug type:demo component', async () => {
        const{ pathToBundleJs } = util.getAppPathData({ appName });

        const bundleContent = fs.readFileSync(pathToBundleJs);
        
        assert.equal(bundleContent.toString().match(`jet-composites/${component}/1.0.0`), `jet-composites/${component}/1.0.0`,
                     `bundle.js should contain the debug component ${component}`);
        
        assert.equal(bundleContent.toString().match(`jet-composites/${component}/1.0.0/min`), null,
                     `bundle.js should not contain the minified component ${component}`);

      });
    }
  });
}

function packageComponentTest({ appName, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'package', app: appName, component });
  }
  describe('check packaged component', () => {
    it(`should be packaged in ${appName}/dist/${component}.zip`, () => {
      const packagedComponentPath = util.getAppDir(path.join(
        util.getAppDir(appName),
        'dist',
        `${component}_1-0-0.zip`,
      ));
      const exists = fs.pathExistsSync(packagedComponentPath);
      assert.ok(exists, packagedComponentPath);
    })
  })
}

//
// Run the build, then verify that components have been properly built.
// Note that we verify multiple components - component is an array of components.
//
function buildComponentAppTest({ appName, component, release, scriptsFolder }) {

  const testName = release ? 'Build (Release)' : 'Build';
  const buildType = release ? 'release' : 'default';
  describe(testName, () => {
    if (!util.noBuild()) {
      it(`should build ${buildType} component app`, async () => {
        let command = `${util.OJET_APP_COMMAND} build`;
        command = release ? command + ' --release' : command;
        let result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, true, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    // dont run for vcomponent if javascript application
    component.filter(_component => scriptsFolder === 'js' ? _component !== VCOMPONENT_NAME : true).forEach((individualComponent) => {
      const appDir = util.getAppDir(appName);
      const componentsDir = path.join(appDir, 'web', 'js', 'jet-composites');
      const componentLoader = path.join(componentsDir, individualComponent, DEFAULT_COMPONENT_VERSION,'loader.js');
      const componentMinDir = path.join(componentsDir, individualComponent, DEFAULT_COMPONENT_VERSION, 'min');
      const componentMinLoader = path.join(componentMinDir, 'loader.js');
      if (release) {
        it(`component ${individualComponent} should have component(s) with /min directory`, () => {
          const exists = fs.pathExistsSync(componentMinDir);
          assert.ok(exists, componentMinDir);
        })
        it(`component ${individualComponent} should have min/loader.js`, () => {
          const exists = fs.pathExistsSync(componentMinLoader);
          assert.ok(exists, componentMinLoader);
        })
      } else {
        it(`component ${individualComponent} should not have component(s) with /min directory`, () => {
          const exists = fs.pathExistsSync(componentMinDir);
          assert.ok(!exists, componentMinDir);
        })
        it(`component ${individualComponent} should have loader.js`, () => {
          const exists = fs.pathExistsSync(componentLoader);
          assert.ok(exists, componentLoader);
        })
      }
      if (individualComponent === VCOMPONENT_NAME) {
        it(`component ${individualComponent} should have types directory`, () => {
          const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', individualComponent, DEFAULT_COMPONENT_VERSION, 'types');
          const exists = fs.pathExistsSync(typesDir);
          assert.ok(exists, typesDir);
        });
      }
    });
  })
}

function buildTsComponentAppWithDeclarationFalse({ appName   }) {
  describe('Build (declaration = false)', () => {
    const appDir = util.getAppDir(appName);
    if (!util.noBuild()) {
      it(`should build typescript component app with declaration = false`, async () => {
        // set tsconfig.compilerOptions.declaration = false
        const tsconfigJsonPath = path.join(appDir, 'tsconfig.json');
        const tsconfigJson = fs.readJsonSync(tsconfigJsonPath);
        tsconfigJson.compilerOptions.declaration = false;
        fs.writeJsonSync(tsconfigJsonPath, tsconfigJson, { spaces: 2 });
        // build typescript component app
        const command = `${util.OJET_APP_COMMAND} build`;
        const result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, true, true);
        // set declaration back to true for downstream tests
        tsconfigJson.compilerOptions.declaration = true;
        fs.writeJsonSync(tsconfigJsonPath, tsconfigJson, { spaces: 2 });
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
      it(`should not have /types folder in ${appName}/web/js/jet-composites/${VCOMPONENT_NAME}`, () => {
        const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', VCOMPONENT_NAME, DEFAULT_COMPONENT_VERSION, 'types');
        const exists = fs.pathExistsSync(typesDir);
        assert.ok(!exists, typesDir);
      });
    }
  });
}

function omitComponentVerstionTest({ appName }) {
  describe(`Build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, () => {
    const components = [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, COMPONENT_NAME_DEMO, VCOMPONENT_NAME, EXCHANGE_COMPONENT_PACK];
    if (!util.noBuild()) {
      it(`should build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, async () => {
        const command = `${util.OJET_APP_COMMAND} build --${util.OMIT_COMPONENT_VERSION_FLAG}`;
        const result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, true, false);
        assert.ok(util.buildSuccess(result.stdout), result.error);
      });
    }
    it(`should build ${components} without a version folder`, () => {
      const { pathToBuiltComponents } = util.getAppPathData({ appName });
      components.forEach(component => {
        const pathToBuiltComponent = path.join(pathToBuiltComponents, component);
        const componentExists = fs.existsSync(pathToBuiltComponent);
        if (componentExists) {
          const pathToBuiltComponentWithVersion = path.join(pathToBuiltComponent, DEFAULT_COMPONENT_VERSION);
          const componentVersionFolderExists = fs.existsSync(pathToBuiltComponentWithVersion);
          assert.ok(!componentVersionFolderExists, pathToBuiltComponentWithVersion);
        }
      });
    });
    it(`should build main.js without versioned path mappings for ${components}`, () => {
      const { pathToBuiltComponents, pathToMainJs, componentsFolder } = util.getAppPathData({ appName });
      const mainJs = fs.readFileSync(pathToMainJs);
      components.forEach(component => {
        const pathToBuiltComponent = path.join(pathToBuiltComponents, component);
        const componentExists = fs.existsSync(pathToBuiltComponent);
        if (componentExists) {
          const unversionedPathMapping = `"${component}":"${componentsFolder}/${component}"`;
          const versionedPathMapping = `"${component}":"${componentsFolder}/${component}/${DEFAULT_COMPONENT_VERSION}"`;
          const unversionedPathMappingExists = mainJs.includes(unversionedPathMapping);
          const versionedPathMappinExists = mainJs.includes(versionedPathMapping);
          assert.ok(unversionedPathMappingExists && !versionedPathMappinExists, versionedPathMapping);
        }
      });
    });
  });
}

describe('Component Tests', () => {
  describe('ojet create component', () => {
    describe('valid name', () => {
      util.runComponentTestInAllTestApps({ test: createComponentTest, component: COMPONENT_NAME });
      util.runComponentTestInAllTestApps({ test: createComponentTypeCompositeTest, component: COMPONENT_NAME_COMPOSITE });
      util.runComponentTestInAllTestApps({ test: createComponentTypeDemoTest, component: COMPONENT_NAME_DEMO });
      util.runComponentTestInTestApp({ 
        config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
        test: createVComponentTest, 
        component: VCOMPONENT_NAME
      });
    });
    describe('no hyphen in name', () => {
      util.runComponentTestInAllTestApps({ test: createComponentFailureTest, component: 'comp1' });
    });
    describe('capital letter in name', () => {
      util.runComponentTestInAllTestApps({ test: createComponentFailureTest, component: 'Comp-1' });
    });
  });
  describe('ojet add component', () => {
    util.runComponentTestInAllTestApps({ test: addComponentTest, component: EXCHANGE_COMPONENT_NAME });
  });
  describe('ojet build component', () => {
    util.runComponentTestInAllTestApps({ test: buildComponentTest, component: COMPONENT_NAME });
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: buildComponentTest, 
      component: VCOMPONENT_NAME
    });
    util.runComponentTestInTestApp({ 
      config: util.JAVASCRIPT_COMPONENT_APP_CONFIG, 
      test: releaseBuildComponentTypeDemoTest,
      component: COMPONENT_NAME_DEMO 
    });
  });
  describe('ojet package component', () => {
    util.runComponentTestInAllTestApps({ test: packageComponentTest, component: COMPONENT_NAME });
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: packageComponentTest,
      component: VCOMPONENT_NAME
    });
  });
  describe('ojet build', () => {
    util.runComponentTestInAllTestApps({ test: buildComponentAppTest, component: [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, VCOMPONENT_NAME], release: false });
    util.runComponentTestInTestApp({ 
      config: util.TYPESCRIPT_COMPONENT_APP_CONFIG, 
      test: buildTsComponentAppWithDeclarationFalse
    });
  });
  describe('ojet build --release', () => {
    util.runComponentTestInAllTestApps({ test: buildComponentAppTest, component: [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, VCOMPONENT_NAME], release: true });
  });
  describe(`ojet build --${util.OMIT_COMPONENT_VERSION_FLAG}`, () => {
    util.runComponentTestInAllTestApps({ test: omitComponentVerstionTest });
  });

  // 
  // The remove component test is causing some errors in the pack tests.
  //
  //  1) JET Pack Tests
  //     ojet package pack
  //       componentTsTest
  //         check packaged pack
  //           should be packaged in componentTsTest/dist/pack-1.zip:
  //              AssertionError [ERR_ASSERTION]: /scratch/lmolesky/tool6/ojet-cli/test_result/componentTsTest/dist/pack-1.zip
  // 
  // Which is unexpected since the component parameters are comp-1 (and vcomp-1), (so the .zip should not be pack-1.zip).
  // This should be investigated further.
  // 
/*
  describe('ojet remove component', () => {
    util.runComponentTestInAllTestApps({ test: removeComponentTest, component: EXCHANGE_COMPONENT_NAME });
  });
*/

});

