/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const cc = require('./commonComponent');

const assert = require('assert');
const fs = require('fs-extra');
const util = require('./util');
const path = require('path');

describe('TS Component & Jet Pack Tests', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.COMPONENT_TS_APP_NAME);

      // Scaffold component ts app from scratch
      let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.COMPONENT_TS_APP_NAME} --use-global-tooling --template=navbar --typescript`, {
        cwd: util.testDir
      });
      console.log(result.stdout);
      // Check output
      // assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
      // Set exchange url for exchange-related tests
      result = await util.execCmd(`${util.OJET_APP_COMMAND} configure --exchange-url=${util.EXCHANGE_URL}`, {
        cwd: util.getAppDir(util.COMPONENT_TS_APP_NAME)
      });
      console.log(result.stdout);
    }
  });

  describe('TS Component Tests', () => {
    function buildTsComponentAppWithDeclarationFalse({
      appName
    }) {
      describe('Build (declaration = false)', () => {
        if (!util.noBuild()) {
          it(`should build typescript component app with declaration = false`, async () => {
            // set tsconfig.compilerOptions.declaration = false
            const appDir = util.getAppDir(appName);
            const tsconfigJsonPath = path.join(appDir, 'tsconfig.json');
            const tsconfigJson = fs.readJsonSync(tsconfigJsonPath);
            tsconfigJson.compilerOptions.declaration = false;
            fs.writeJsonSync(tsconfigJsonPath, tsconfigJson, {
              spaces: 2
            });
            // build typescript component app
            const command = `${util.OJET_APP_COMMAND} build`;
            const result = await util.execCmd(command, {
              cwd: util.getAppDir(appName)
            }, true, true);
            // set declaration back to true for downstream tests
            tsconfigJson.compilerOptions.declaration = true;
            fs.writeJsonSync(tsconfigJsonPath, tsconfigJson, {
              spaces: 2
            });
            assert.equal(util.buildSuccess(result.stdout), true, result.error);
          });
          it(`should not have /types folder in ${appName}/web/js/jet-composites/${cc.VCOMPONENT_NAME}`, () => {
            const appDir = util.getAppDir(appName);
            const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', cc.VCOMPONENT_NAME, 'types');
            const exists = fs.pathExistsSync(typesDir);
            assert.ok(!exists, typesDir);
          });
          it('should have demo-card in the list of components', async () => {
            const command = `${util.OJET_APP_COMMAND} list component`;
            const result = await util.execCmd(command, {
              cwd: util.getAppDir(appName)
            }, true, true);
            assert.equal(new RegExp('oj-dynamic-form').test(result.stdout), true, result.error);
          });
        }
      });
    }

    cc.setupOjetCreateComponent(util.TYPESCRIPT_COMPONENT_APP_CONFIG);

    describe('ojet build component', () => {
      util.runComponentTestInTestApp(util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.buildComponentTest,
        component: cc.COMPONENT_NAME
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: cc.buildComponentTest,
          component: cc.VCOMPONENT_NAME
        }
      );
    });
    describe('ojet package component', () => {
      util.runComponentTestInTestApp(util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.packageComponentTest,
        component: cc.COMPONENT_NAME
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: cc.packageComponentTest,
          component: cc.VCOMPONENT_NAME
        }
      );
    });
    describe('ojet package component (hook test)', () => {
      util.runComponentTestInTestApp(util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.packageComponentHookTest,
        component: 'package-hooks-component'
      });
    });

    describe('ojet build', () => {
      util.runComponentTestInTestApp(util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.buildComponentAppTest,
        component: [cc.COMPONENT_NAME, cc.COMPONENT_NAME_COMPOSITE, cc.VCOMPONENT_NAME],
        release: false
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: buildTsComponentAppWithDeclarationFalse
        }
      );
    });

    cc.setupOjetBuildRelease(util.TYPESCRIPT_COMPONENT_APP_CONFIG);

    // 
    // The remove component test is causing some errors in the pack tests.
    //
    //  1) JET Pack Tests
    //     ojet package pack
    //       componentTsTest
    //         check packaged pack
    //           should be packaged in componentTsTest/dist/pack-1.zip:
    //              AssertionError [ERR_ASSERTION]: componentTsTest/dist/pack-1.zip
    // 
    // Which is unexpected since the component parameters are comp-1 (and vcomp-1), (so the .zip should not be pack-1.zip).
    // This should be investigated further.
    // 
    /* describe('ojet remove component', () => {
      util.runComponentTestInTestApp(util.TYPESCRIPT_COMPONENT_APP_CONFIG, { test: removeComponentTest, component: EXCHANGE_COMPONENT_NAME });
    }); */

  });

  describe('TS JET Pack Tests', () => {
    cc.setupOjectCreatePackTests(util.TYPESCRIPT_COMPONENT_APP_CONFIG);

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
    // After pack is created, insert bundles into the pack (packbundle-1/component.json)
    // the dependency structure in the bundle will be: 
    // bundlecomp-1 depends on bundlecomp-2 (set when bundlecomp-1 is created) and resources
    // depends on bundlecomp-1 (set when resources is created). the created bundle should only contain
    // bundlecomp-1 and resources i.e 
    // 1. bundlecomp-2 should not be included even though it is a dependency of bundlecomp-1 because it
    // is not listed as a member of the bundle
    // 2. bundlecomp-1 should not be excluded even though it is a dependency of resources because it
    // is listed as a member of the bundle
    //
    //  % ojet build release
    //  % ojet build --release 
    //

    cc.ojetCreatePackBundleTest(util.TYPESCRIPT_COMPONENT_APP_CONFIG);

    // create two pack vcomponents
    describe('ojet create component --vcomponent --pack (bundle) ', () => {
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: cc.createVComponentInPackTest,
          pack: cc.BUNDLE_PACK_NAME,
          component: cc.BUNDLE_VCOMPONENT_NAME1
        }
      );
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: cc.createVComponentInPackTest,
          pack: cc.BUNDLE_PACK_NAME,
          component: cc.BUNDLE_VCOMPONENT_NAME2
        }
      );
    });

    cc.ojetCreateResourceComponentBundle(util.TYPESCRIPT_COMPONENT_APP_CONFIG);
  });
});