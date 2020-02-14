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
const PACK_NAME = 'pack-1';
const DEFAULT_PACK_VERSION = '1.0.0';
const COMPONENT_NAME = 'comp-1';

const apps = [
  { appName: util.COMPONENT_APP_NAME, scriptsFolder: 'js' }, 
  { appName: util.COMPONENT_TS_APP_NAME, scriptsFolder: 'ts' }
];

function execPackCommand({ task, app, pack }) {
  return util.execCmd(`${util.OJET_APP_COMMAND} ${task} pack ${pack}`, { cwd: util.getAppDir(app) }, true, false);
}

function execComponentInPackCommand({ task, app, pack, component }) {
  const command = `${util.OJET_APP_COMMAND} ${task} component ${component} --pack=${pack}`;
  return util.execCmd(command, { cwd: util.getAppDir(app) }, true, false);
}

function beforePackTest({ task, app, pack }) {
  before(async () => {
    let result = await execPackCommand({ task, app, pack });
    it(`should ${task} a pack`, () => {
      assert.ok(util[`${task}PackSuccess`]({ pack, stdout: result.stdout }), result.error);
    });
  });
}

function beforeComponentInPackTest({ task, app, pack, component }) {
  before(async () => {
    let result = await execComponentInPackCommand({ task, app, pack, component });
    it(`should ${task} a component in a pack`, () => {
      assert.ok(util[`${task}ComponentInPackSuccess`]({ component, stdout: result.stdout }), result.error);
    });
  });
}

function addTest({ config, test, pack, component, release }) {
  describe(config.appName, () => {
    test({...config, pack, component, release });
  });
}

function addTests({ test, pack, component, release }) {
  apps.forEach(config => {
    addTest({ config, test, pack, component, release });
  })
}

function createPackTest({ appName, scriptsFolder, pack }) {
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
    })
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
    it(`should have the correct pack in component.json`, () => {
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
    })
  });
}

function createComponentInPackFailureTest({ appName, pack, component }) {
  describe('check create component in pack failure', () => {
    it ('should fail with "Invalid pack name:"', async () => {
      const task = 'create';
      const result = await execComponentInPackCommand({ task, app: appName, pack, component });
      assert.ok(util[`${task}ComponentInPackFailure`]({ stderr: result.stderr }), result.error);
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
    const packMinDir = path.join(componentsDir, PACK_NAME, DEFAULT_PACK_VERSION, 'min');
    if (release) {
      it('should have pack(s) with /min directory', () => {
        const exists = fs.pathExistsSync(packMinDir);
        assert.ok(exists, packMinDir);
      })
      it('should have pack(s) with component in /min directory', () => {
        const exists = fs.pathExistsSync(path.join(packMinDir, COMPONENT_NAME));
        assert.ok(exists, packMinDir);
      })
    } else {
      it('should not have pack(s) with /min directory', () => {
        const exists = fs.pathExistsSync(packMinDir);
        assert.ok(!exists, packMinDir);
      })
    }
  })
}

describe("JET Pack Tests", () => {
  describe('ojet create pack', () => {
    addTests({ test: createPackTest, pack: PACK_NAME });
  })
  describe('ojet create component --pack', () => {
    describe('valid pack name', () => {
      addTests({ test: createComponentInPackTest, pack: PACK_NAME, component: COMPONENT_NAME });
    })
    describe('invalid pack name', () => {
      addTests({ test: createComponentInPackFailureTest, pack: 'pack-2', component: COMPONENT_NAME });
    })
  });
  describe('ojet build', () => {
    addTests({ test: buildComponentAppTest, release: false });
  })
  describe('ojet build --release', () => {
    addTests({ test: buildComponentAppTest, release: true });
  })
})

