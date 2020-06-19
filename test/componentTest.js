/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const util = require('./util');
const path = require('path');

const TEST_DIR = path.resolve('test_result/test');
const COMPONENT_NAME = 'comp-1';
const COMPONENT_NAME_COMPOSITE = 'comp-composite';
const VCOMPONENT_NAME = 'vcomp-1';
const DEFAULT_COMPONENT_VERSION = '1.0.0';
const EXCHANGE_COMPONENT_PACK = 'oj-dynamic';
const EXCHANGE_COMPONENT_PACK_MEMBER = 'form';
const EXCHANGE_COMPONENT_NAME = `${EXCHANGE_COMPONENT_PACK}-${EXCHANGE_COMPONENT_PACK_MEMBER}`;

function execComponentCommand({ task, app, component, flags }) {
  return util.execCmd(`${util.OJET_APP_COMMAND} ${task} component ${component} ${flags}`, { cwd: util.getAppDir(app) }, true, false);
}

function beforeComponentTest({ task, app, component, flags = '' }) {
  before(async () => {
    let result = await execComponentCommand({ task, app, component, flags });
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
    it(`should have ${appName}/src/${scriptsFolder}/${component}/component.json`, () => {
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
    it(`should have the correct component name in component.json`, () => {
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
    it(`should not have a pack in component.json`, () => {
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
      it(`should have ${component}/* in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${component}/*`;
        const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
        assert.ok(hasEntryInTsconfigJson, `${tsconfigJsonEntry} not found in ${appName}/tsconfig.json`);
      });
    }
  });
}


//
// Creates a composite component.
// Approach: create a component, then edit the component.json to insert
// "type": "composite".
//
function createComponentTypeCompositeTest({ appName, scriptsFolder, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'create', app: appName, component });
  }
  describe('check created component', () => {
    it(`should have ${appName}/src/${scriptsFolder}/${component}/component.json`, () => {
      const pathToComponentJson = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        'component.json'
      ));

      // update component.json with "type": "composite"
      fs.readFile(pathToComponentJson, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace(/,/, ', \n "type": "composite",');
        fs.writeFile(pathToComponentJson, result, 'utf8', function (err) {
          if (err) return console.log(err);
          const exists = fs.pathExistsSync(pathToComponentJson);
          assert.ok(exists, pathToComponentJson);
        });
      });
    });
  });
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
    it(`should not have @ojmetadata pack "@pack-name@" jsdoc`, () => {
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
      assert.ok(util[`${task}ComponentFailure`]({ component, stderr: result.stderr }), result.error);
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
      it(`should have ${EXCHANGE_COMPONENT_PACK}/* in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${EXCHANGE_COMPONENT_PACK}/*`;
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
      it(`should not have ${EXCHANGE_COMPONENT_PACK}/* in tsconfig.compilerOptions.paths`, () => {
        const pathToTsconfig = util.getAppDir(path.join(
          util.getAppDir(appName),
          'tsconfig.json'
        ));
        const tsconfigJson = fs.readJsonSync(pathToTsconfig);
        const tsconfigJsonEntry = `${EXCHANGE_COMPONENT_PACK}/*`;
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
    const appDir = path.resolve(TEST_DIR, appName);
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

function packageComponentTest({ appName, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'package', app: appName, component });
  }
  describe('check packaged component', () => {
    it(`should be packaged in ${appName}/dist/${component}.zip`, () => {
      const packagedComponentPath = util.getAppDir(path.join(
        util.getAppDir(appName),
        'dist',
        `${component}.zip`,
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
        let result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, true, false);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
    // dont run for vcomponent if javascript application
    component.filter(_component => scriptsFolder === 'js' ? _component !== VCOMPONENT_NAME : true).forEach((individualComponent) => {
      const appDir = path.resolve(TEST_DIR, appName);
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
    const appDir = path.resolve(TEST_DIR, appName);
    if (!util.noBuild()) {
      it(`should build typescript component app with declaration = false`, async () => {
        // set tsconfig.compilerOptions.declaration = false
        const tsconfigJsonPath = path.join(appDir, 'tsconfig.json');
        const tsconfigJson = fs.readJsonSync(tsconfigJsonPath);
        tsconfigJson.compilerOptions.declaration = false;
        fs.writeJsonSync(tsconfigJsonPath, tsconfigJson, { spaces: 2 });
        // build typescript component app
        const command = `${util.OJET_APP_COMMAND} build`;
        const result = await util.execCmd(command, { cwd: util.getAppDir(appName) }, true, false);
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

describe('Component Tests', () => {
  describe('ojet create component', () => {
    describe('valid name', () => {
      util.runComponentTestInAllTestApps({ test: createComponentTest, component: COMPONENT_NAME });
      util.runComponentTestInAllTestApps({ test: createComponentTypeCompositeTest, component: COMPONENT_NAME_COMPOSITE });
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
      util.runComponentTestInAllTestApps({ test: createComponentFailureTest, component: 'Comp1' });
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
  describe('ojet remove component', () => {
    util.runComponentTestInAllTestApps({ test: removeComponentTest, component: EXCHANGE_COMPONENT_NAME });
  });
});

