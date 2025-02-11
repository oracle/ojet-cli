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


describe('JS Component & Jet Pack Tests', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.COMPONENT_APP_NAME);

      // Scaffold component js app from scratch
      let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.COMPONENT_APP_NAME} --use-global-tooling --template=navbar`, {
        cwd: util.testDir
      });
      console.log(result.stdout);
      // Check output
      // assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
      // Set exchange url for exchange-related tests
      result = await util.execCmd(`${util.OJET_APP_COMMAND} configure --exchange-url=${util.EXCHANGE_URL}`, {
        cwd: util.getAppDir(util.COMPONENT_APP_NAME)
      });
      console.log(result.stdout);
    }
  });

  describe('JS Component Tests', () => {
    /*
    function removeComponentTest({ appName, scriptsFolder, component }) {
      if (!util.noScaffold()) {
        cc.beforeComponentTest({ task: 'remove', app: appName, component });
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
          it(`should not have ${EXCHANGE_COMPONENT_PACK}${cc.SLASH_STAR} in tsconfig.compilerOptions.paths`, () => {
            const pathToTsconfig = util.getAppDir(path.join(
              util.getAppDir(appName),
              'tsconfig.json'
            ));
            const tsconfigJson = fs.readJsonSync(pathToTsconfig);
            const tsconfigJsonEntry = `${EXCHANGE_COMPONENT_PACK}${cc.SLASH_STAR}`;
            const hasEntryInTsconfigJson = !!tsconfigJson.compilerOptions.paths[tsconfigJsonEntry];
            assert.ok(!hasEntryInTsconfigJson, `${tsconfigJsonEntry} found in ${appName}/tsconfig.json`);
          });
        }
      });
    }*/

    //
    // Run a release build for a type:demo component
    // Ensure that the path mapping is to the *debug* area.
    // (note that type:demo components are not minified, thus the
    //  path mapping should't be to /min for type:demo components).
    // 
    function releaseBuildComponentTypeDemoTest({
      appName,
      component
    }) {
      describe('check type:demo component', () => {
        if (!util.noBuild()) {
          it('should build release js app (type:demo) ', async () => {
            const appDir = util.getAppDir(appName);
            const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {
              cwd: appDir
            });
            assert.equal(util.buildSuccess(result.stdout), true, result.error);
          });

          // Verify that the path mapping for the demo component in the bundle 
          // points to the debug area.
          it('release build:  path mapping to debug type:demo component', async () => {
            const {
              pathToBundleJs
            } = util.getAppPathData(appName);

            const bundleContent = fs.readFileSync(pathToBundleJs);

            assert.equal(bundleContent.toString().match(`jet-composites/${component}`), `jet-composites/${component}`,
              `bundle.js should contain the debug component ${component}`);

            assert.equal(bundleContent.toString().match(`jet-composites/${component}/min`), null,
              `bundle.js should not contain the minified component ${component}`);
          });
        }
      });
    };

    cc.setupOjetCreateComponent(util.JAVASCRIPT_COMPONENT_APP_CONFIG);

    describe('ojet build component', () => {
      util.runComponentTestInTestApp(util.JAVASCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.buildComponentTest,
        component: cc.COMPONENT_NAME
      });
      util.runComponentTestInTestApp(
        util.JAVASCRIPT_COMPONENT_APP_CONFIG, {
          test: releaseBuildComponentTypeDemoTest,
          component: cc.COMPONENT_NAME_DEMO
        }
      );
    });
    describe('ojet package component', () => {
      util.runComponentTestInTestApp(util.JAVASCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.packageComponentTest,
        component: cc.COMPONENT_NAME
      });
    });
    describe('ojet package component (hook test)', () => {
      util.runComponentTestInTestApp(util.JAVASCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.packageComponentHookTest,
        component: 'package-hooks-component'
      });
    });

    describe('ojet build', () => {
      util.runComponentTestInTestApp(util.JAVASCRIPT_COMPONENT_APP_CONFIG, {
        test: cc.buildComponentAppTest,
        component: [cc.COMPONENT_NAME, cc.COMPONENT_NAME_COMPOSITE, cc.VCOMPONENT_NAME],
        release: false
      });
    });

    cc.setupOjetBuildRelease(util.JAVASCRIPT_COMPONENT_APP_CONFIG);

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
      util.runComponentTestInAllTestApps(util.JAVASCRIPT_COMPONENT_APP_CONFIG, { test: removeComponentTest, component: EXCHANGE_COMPONENT_NAME });
    }); */

  });

  describe('JS JET Pack Tests', () => {
    cc.setupOjectCreatePackTests(util.JAVASCRIPT_COMPONENT_APP_CONFIG);
    
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
    cc.ojetCreatePackBundleTest(util.JAVASCRIPT_COMPONENT_APP_CONFIG);

    cc.ojetCreateResourceComponentBundle(util.JAVASCRIPT_COMPONENT_APP_CONFIG);
  });
});
