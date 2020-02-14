/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const util = require('./util');
const path = require('path');

const TEST_DIR = path.resolve('test_result/test');
const COMPONENT_NAME = 'comp-1';
const DEFAULT_COMPONENT_VERSION = '1.0.0';
const EXCHANGE_COMPONENT_PACK = 'oj-sample';
const EXCHANGE_COMPONENT_PACK_MEMBER = 'country-picker';
const EXCHANGE_COMPONENT_NAME = `${EXCHANGE_COMPONENT_PACK}-${EXCHANGE_COMPONENT_PACK_MEMBER}`;

const apps = [
  { appName: util.COMPONENT_APP_NAME, scriptsFolder: 'js' }, 
  { appName: util.COMPONENT_TS_APP_NAME, scriptsFolder: 'ts' }
];

function execComponentCommand({ task, app, component }) {
  return util.execCmd(`${util.OJET_APP_COMMAND} ${task} component ${component}`, { cwd: util.getAppDir(app) }, true, false);
}

function beforeComponentTest({ task, app, component }) {
  before(async () => {
    let result = await execComponentCommand({ task, app, component });
    it(`should ${task} a component`, () => {
      assert.ok(util[`${task}ComponentSuccess`]({ component, stdout: result.stdout }), result.error);
    });
  });
}

function addTest({ config, test, component, release }) {
  describe(config.appName, () => {
    test({...config, component, release});
  });
}

function addTests({ test, component, release }) {
  apps.forEach(config => {
    addTest({ config, test, component, release });
  })
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
    })
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

function addComponentTest({ appName, component }) {
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
  });
}


function buildComponentTest({ appName, component }) {
  if (!util.noScaffold()) {
    beforeComponentTest({ task: 'build', app: appName, component });
  }
  describe('check built component', () => {
    it(`should be built in ${appName}/web/js/jet-composites/${component}/${DEFAULT_COMPONENT_VERSION}`, () => {
      const builtComponentPath = util.getAppDir(path.join(
        util.getAppDir(appName),
        'web',
        'js',
        'jet-composites',
        component,
        DEFAULT_COMPONENT_VERSION
      ));
      const exists = fs.pathExistsSync(builtComponentPath);
      assert.ok(exists, builtComponentPath);
    })
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

function buildComponentAppTest({ appName, release }) {
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
    const appDir = path.resolve(TEST_DIR, appName);
    const componentsDir = path.join(appDir, 'web', 'js', 'jet-composites');
    const componentMinDir = path.join(componentsDir, COMPONENT_NAME, DEFAULT_COMPONENT_VERSION, 'min');
    if (release) {
      it('should have component(s) with /min directory', () => {
        const exists = fs.pathExistsSync(componentMinDir);
        assert.ok(exists, componentMinDir);
      })
    } else {
      it('should not have component(s) with /min directory', () => {
        const exists = fs.pathExistsSync(componentMinDir);
        assert.ok(!exists, componentMinDir);
      })
    }
  })
}

describe('Component Tests', () => {
  describe('ojet create component', () => {
    describe('valid name', () => {
      addTests({ test: createComponentTest, component: COMPONENT_NAME });
    });
    describe('no hyphen in name', () => {
      addTests({ test: createComponentFailureTest, component: 'comp1' });
    });
    describe('capital letter in name', () => {
      addTests({ test: createComponentFailureTest, component: 'Comp1' });
    });
  });
  describe('ojet add component', () => {
    addTests({ test: addComponentTest, component: EXCHANGE_COMPONENT_NAME });
  });
  describe('ojet build component', () => {
    addTests({ test: buildComponentTest, component: COMPONENT_NAME });
  });
  describe('ojet package component', () => {
    addTests({ test: packageComponentTest, component: COMPONENT_NAME });
  });
  describe('ojet build', () => {
    addTests({ test: buildComponentAppTest, release: false });
  })
  describe('ojet build --release', () => {
    addTests({ test: buildComponentAppTest, release: true });
  })
})

