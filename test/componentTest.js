/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const util = require('./util');
const path = require('path');
const _ = require('lodash');

const COMPONENT_NAME = 'comp-1';
const COPYING_TEST_COMPONENT_NAME = 'demo-card';
// Component with type:composite
const COMPONENT_NAME_COMPOSITE = 'comp-composite';
// Component with type:demo
const COMPONENT_NAME_DEMO = 'comp-demo';
const VCOMPONENT_NAME = 'vcomp-1';
const DEFAULT_COMPONENT_VERSION = '1.0.0';
const EXCHANGE_COMPONENT_PACK = 'oj-dynamic';
const EXCHANGE_COMPONENT_PACK_MEMBER = 'form';
const BUNDLE_TEST_EXCHANGE_COMPONENT = 'oj-sample-metric';
const EXCHANGE_COMPONENT_NAME = `${EXCHANGE_COMPONENT_PACK}-${EXCHANGE_COMPONENT_PACK_MEMBER}`;

const PACK_NAME = 'pack-1';
const DEFAULT_PACK_VERSION = '1.0.0';
const RESOURCE_COMPONENT_NAME = 'resources';
const EXCHANGE_PACK = 'oj-gbu-app';
const EXCHANGE_PACK_VERSION = '3.0.0';
const EXCHANGE_PACK_BUNDLE = 'shell-bundle';

const BUNDLE_PACK_NAME = 'packbundle-1';
const BUNDLE_NAME = 'component-bundle';

const BUNDLE_COMPONENT_NAME1 = 'bundlecomp-1';
const BUNDLE_COMPONENT_NAME2 = 'bundlecomp-2';

const BUNDLE_VCOMPONENT_NAME1 = 'bundlevcomp-1';
const BUNDLE_VCOMPONENT_NAME2 = 'bundlevcomp-2';

// This value is set initially but later updated
// the specific (and possibly more accurate) version
// that was downloaded in add component
const EXCHANGE_COMPONENT_VERSION = '9.0.0-alpha10';

// Use SLASH_STAR to avoid code editor malformatting
const SLASH_STAR = '/*';

const RESOURCE_COMPONENT_OPTIMIZED_FILE = 'index.js';
const COMPOSITE_COMPONENT_OPTIMIZED_FILE = 'loader.js';
const COMPOSITE_COMPONENT_OPTIMIZED_FOLDER = 'min';

const STRIP_TEST_PACK_NAME = 'pack-strip';
const STRIP_TEST_COMPONENT_NAME = 'comp-strip';
const STRIP_TEST_COMPONENT_JSON = {"displayName":"A user friendly, translatable name of an unfriendly component.","description":"A translatable high-level description for a low-level component.","properties":{"helpHints":{"displayName":"Help Hints","description":"Represents hints for oj-form-layout element to render help information on the label for this helpless component.","type":"object","properties":{"sub-property":{"type":"string","placeholder":"Start at the very beginning...","enumValues":["doe","ray","mee"],"propertyEditorValues":{"doe":{"description":"A deer, a female deer...","displayName":"Doe","icon":{"hoverIconPath":"./path/to/hover","iconPath":"./path/to/icon","selectedIconPath":"./path/to/selection"}},"ray":{"description":"A drop of golden sun...","displayName":"Ray"},"mee":{"description":"Me, a name to call myself...","displayName":"Me"}},"value":"string","writeback":false,"units":"notes","binding":{"consume":{"name":"my-binding"},"provide":[{"name":"provider","default":"valueBind","transform":{"transform-prop":false}}]}}}},"source":{"displayName":"Source","description":"Hint for help source URL associated with the label.","type":"string","readOnly":true,"translatable":true,"dynamicSlotDef":"emptyDynamicSlot"},"readOnly":{"displayName":"Readonly","description":"Defines if the calendar as a whole can be edited in any way, can be overridden by individual events","type":"boolean|null","propertyGroup":"common","extension":{"calendarOption":"editable","transform":"invert"}},"fishes":{"type":"Array<object>","displayName":"Fishes","description":"Ordered list of fishes managed by this component","extension":{"vbdt":{"itemProperties":{"name":{"type":"string","description":"Name of the fish (e.g., 'Harold')"},"species":{"type":"object","displayName":"Species","description":"The fish's species information","properties":{"latin":{"type":"string","description":"Latin name of the species"},"english":{"type":"string","description":"Informal (english) name of the species"}}}}}}}},"methods":{"focus":{"internalName":"setFocus","description":"A function to set focus on the field","return":"boolean","help":"Go to this link...","visible":false,"params":[{"name":"value","description":"Value to set focus to","type":"string|null","status":[{"description":"Use a string value instead.","since":"1.1.0","target":"parameterType","value":["null"],"type":"deprecated"}]}],"status":[{"description":"Use standard HTML 'focus' method instead.","since":"2.0.0","type":"deprecated"}],"displayName":"setFocus method","extension":{"webelement":{"exceptionStatus":[{"type":"unsupported","since":"3.0.0","description":"Knock it off!"}]}}},"methodWithExtensionMD":{"description":"Dummy method with extension metadata that gets wiped","displayName":"Dummy Method","help":"dummy.html","extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"},"visible":true,"return":"string"},"foo":{}},"events":{"onclick":{"bubbles":true,"description":"Demo event","status":[{"description":"Go listen to something else","since":"3.0.0","type":"deprecated"}],"cancelable":true,"help":"click.html","displayName":"onClick Handler","visible":true,"detail":{"sourceID":{"type":"string|number","eventGroup":"common","description":"Who sent you?","extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"},"status":[{"description":"Expect sourceIDs to only be of type 'number' as of version 4.0.0","since":"2.0.0","target":"parameterType","value":["string"],"type":"deprecated"}]}}},"onTestShouldBeEmpty":{"description":"For testing","bubbles":false,"displayName":"empty on stripping","help":"./running_on_empty.html"},"onAnythingJustEmpty":{}},"slots":{"":{"description":"This is the default slot, y'all","displayName":"Default"},"deposits":{"description":"Where money is deposited","visible":true,"extension":{"vbdt":{"description":"demo"}},"displayName":"Deposit Slot","help":"depository.html","status":[{"description":"Does this look like a bank?!??!","since":"3.0.0","type":"deprecated"}],"data":{"bankInfo":{"description":"Bank information","type":"object","properties":{"name":{"type":"string","placeholder":"First National...","description":"Name of the bank","readOnly":true,"writeback":false,"extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"}},"amount":{"type":"number","description":"Amount"},"routing":{"type":"number|null","displayName":"Routing Number","description":"Bank routing number if a check, or null if cash"}}}},"preferredContent":["MoneyElement","CheckElement"],"maxItems":1000,"minItems":1},"shouldEndUpEmpty":{"visible":false,"displayName":"should be empty","description":"to test the code","maxItems":100,"minItems":0},"emptySlot":{}},"dynamicSlots":{"dynamic-slot":{"visible":true,"preferredContent":["PreferredContent"],"status":[{"description":"my status","since":"2.0.0","target":"parameterType","value":["string"],"type":"deprecated"}],"description":"slot for Dynamic Slot","displayName":"Dynamic Slot","help":"dy/no/mite.html","data":{"data-dynamic":{"description":"This is data for dyanamic slot","status":[{"description":"my status","since":"2.0.0","target":"parameterType","value":["string"],"type":"deprecated"}],"type":"string"}}},"emptyDynamicSlot":{}},"help":"comp1.html","since":"0.0.7","license":"MIT","styleVariables":[{"name":"comp-background","description":"Specify the component background","formats":["color"],"help":"stylish.html","displayName":"Variable","status":[{"description":"No background for you!","since":"2.2.0","type":"deprecated"}],"keywords":["auto","transparent"],"extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"}}],"status":[{"description":"This whole component was a mistake...","since":"3.0.0","type":"deprecated"}],"extension":{"catalog":{"audits":"../audit/rules.zip","category":"Other","tags":["worthless","garbage","trash"],"extraInfo":{}},"oracle":{"businessApprovals":{"vitaMeetaVegamin":"123456"},"uxSpecs":["figma-imagination"]},"themes":{"unsupportedThemes":["Stable"]},"vbdt":{"audits":"../audit/vbcs/rules.zip","defaultColumns":12,"minColumns":6}},"type":"composite"};
const EXPECTED_STRIPPED_JSON = {"name":"comp-strip","version":"1.0.0","properties":{"helpHints":{"type":"object","properties":{"sub-property":{"type":"string","enumValues":["doe","ray","mee"],"value":"string","writeback":false,"binding":{"consume":{"name":"my-binding"},"provide":[{"name":"provider","default":"valueBind","transform":{"transform-prop":false}}]}}}},"source":{"type":"string","readOnly":true},"readOnly":{"type":"boolean|null","extension":{"calendarOption":"editable","transform":"invert"}},"fishes":{"type":"Array<object>"}},"methods":{"focus":{"internalName":"setFocus"},"methodWithExtensionMD":{"extension":{"audit":{"thisData":{"type":"string"}},"calendarOption":"now"}},"foo":{}},"events":{"onclick":{"detail":{"sourceID":{"type":"string|number","extension":{"audit":{"thisData":{"type":"string"}},"calendarOption":"now"}}}},"onTestShouldBeEmpty":{},"onAnythingJustEmpty":{}},"slots":{"":{},"deposits":{"data":{"bankInfo":{"type":"object","properties":{"name":{"type":"string","readOnly":true,"writeback":false,"extension":{"audit":{"thisData":{"type":"string"}},"calendarOption":"now"}},"amount":{"type":"number"},"routing":{"type":"number|null"}}}}},"shouldEndUpEmpty":{},"emptySlot":{}},"dynamicSlots":{"dynamic-slot":{"data":{"data-dynamic":{"type":"string"}}},"emptyDynamicSlot":{}}};
// Returns the variables to used to run the test checks:
function getStripTestVariables({
  pathToLocalComponentInWeb,
  pathToLocalComponentInSrc,
  componentMinLoader
}) {
  // Read and later on check that component.json in src and web are the same--meaning that the file is properly 
  // restored in web:
  const componentJSONInWeb = fs.readJSONSync(pathToLocalComponentInWeb);
  const componentJSONInSrc = fs.readJSONSync(pathToLocalComponentInSrc);
  const componentJSONInWebAttributes = Object.getOwnPropertyNames(componentJSONInWeb);
  const componentJSONInSrcAttributes = Object.getOwnPropertyNames(componentJSONInSrc);
  const webHasAllComponentJSONSrcAttributes = componentJSONInWebAttributes.every(
    (attribute) => componentJSONInSrcAttributes.includes(attribute));
  const errorMessageForWeb = 'The component.json in web is not properly restored.';
  // Retrieve the metadata in min/loader.js:
  const loaderJsContent = fs.readFileSync(componentMinLoader, {
    encoding: 'utf-8'
  });
  const regex = /component\.json",\s*\[\],\s*\(function\(\){return'(?<componentJSONInLoader>.*)'}\)\)/gm;
  const match = regex.exec(loaderJsContent);
  const modifiedComponentJSON = JSON.parse(match.groups.componentJSONInLoader.replace(/\\n/g, ''));
  let loaderHasStrippedAttributes;
  if (componentJSONInWeb.hasOwnProperty('pack')) {
    loaderHasStrippedAttributes = _.isEqual(modifiedComponentJSON, {
      ...EXPECTED_STRIPPED_JSON,
      ...{
        jetVersion: componentJSONInWeb['jetVersion'],
        pack: componentJSONInWeb['pack']
      }
    });
  } else {
    loaderHasStrippedAttributes = _.isEqual(modifiedComponentJSON, {
      ...EXPECTED_STRIPPED_JSON,
      ...{
        jetVersion: componentJSONInWeb['jetVersion'],
      }
    });
  }
  const errorMessageForLoader = 'The loader.js in min has no stripped metadata.';
  return {
    webHasAllComponentJSONSrcAttributes,
    errorMessageForWeb,
    loaderHasStrippedAttributes,
    errorMessageForLoader
  };
}

describe('Component & Jet Pack Tests', () => {
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

  describe('Component Tests', () => {
    function execComponentCommand({
      task,
      app,
      component,
      flags = ''
    }) {
      return util.execCmd(`${util.OJET_APP_COMMAND} ${task} component ${component} ${flags}`, {
        cwd: util.getAppDir(app)
      }, true, true);
    }

    function beforeComponentTest({
      task,
      app,
      component,
      flags,
      componentJson,
      scriptsFolder
    }) {
      before(async () => {
        await execComponentCommand({
          task,
          app,
          component,
          flags
        });
        if (componentJson) {
          const {
            pathToSourceComponents
          } = util.getAppPathData(app, scriptsFolder);
          const pathToComponentComponentJson = path.join(
            pathToSourceComponents,
            component,
            util.COMPONENT_JSON
          );
          const componentComponentJson = fs.readJsonSync(pathToComponentComponentJson);
          fs.writeJsonSync(
            pathToComponentComponentJson, {
              ...componentComponentJson,
              ...componentJson
            }, {
              spaces: 2
            }
          );
        }
      });
    }

    // Creates a composite component.
    // Approach: create a component, then edit the component.json to insert
    // 'type': 'composite'.
    //
    // Also we add a dependency on the exchange component.
    // In a subsequent (release build) test, this will verify the dependency on a pack component.
    //
    function createComponentTypeCompositeTest({
      appName,
      scriptsFolder,
      component,
      componentJson
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'create',
          app: appName,
          component,
          componentJson,
          scriptsFolder
        });
      }
      describe('check created component', () => {
        it(`should have ${appName}/src/${scriptsFolder}/${component}/jet-composites/component.json`, () => {
          const {
            pathToSourceComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToComponentJson = path.join(
            pathToSourceComponents,
            component,
            util.COMPONENT_JSON
          );
          const hasComponentJson = fs.existsSync(pathToComponentJson);
          assert.ok(hasComponentJson, pathToComponentJson);
        });
      });
    }

    // 
    // Create a component with type:demo.
    // 
    function createComponentTypeDemoTest({
      appName,
      scriptsFolder,
      component,
      componentJson
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'create',
          app: appName,
          component,
          scriptsFolder,
          componentJson
        });
      }
      describe('check created demo component', () => {
        it(`should have ${appName}/src/${scriptsFolder}/${component}/jet-composites/component.json`, () => {
          const {
            pathToSourceComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToComponentJson = path.join(
            pathToSourceComponents,
            component,
            util.COMPONENT_JSON
          );
          const hasComponentJson = fs.existsSync(pathToComponentJson);
          assert.ok(hasComponentJson, pathToComponentJson);
        });
      });
    }

    function createVComponentTest({
      appName,
      scriptsFolder,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'create',
          app: appName,
          component,
          flags: '--vcomponent'
        });
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
          const componentContent = fs.readFileSync(pathToComponent, {
            encoding: 'utf-8'
          });
          const hasPack = !!packRegex.exec(componentContent);
          assert.ok(!hasPack, 'singleton vcomponent has @ojmetadata pack jsdoc');
        });
      });
    }

    function addComponentTest({
      appName,
      scriptsFolder,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'add',
          app: appName,
          component
        });
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

    /*
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
    }*/

    function buildComponentTest({
      appName,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'build',
          app: appName,
          component
        });
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
          it(`should have an apidoc json file in ${appName}/web/js/jet-composites/${component}/${DEFAULT_COMPONENT_VERSION}`, () => {
            const apiDocFile = path.join(appDir, 'web', 'js', 'jet-composites', component, DEFAULT_COMPONENT_VERSION, 'Vcomp1.json');
            const exists = fs.pathExistsSync(apiDocFile);
            assert.ok(exists, apiDocFile);
          });
          it(`should have a "properties" entry in ${appName}/web/js/jet-composites/${component}/${DEFAULT_COMPONENT_VERSION} indicating component.json generated by the compiler`, () => {
            const pathToComponentJSON = path.join(appDir, 'web', 'js', 'jet-composites', component, DEFAULT_COMPONENT_VERSION, 'component.json');
            const componentJson = fs.readJsonSync(pathToComponentJSON);
            assert.ok(componentJson.properties, "Properties not found in component.json");
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
    function releaseBuildComponentTypeDemoTest({
      appName,
      component
    }) {
      describe('check type:demo component', () => {
        if (!util.noBuild()) {
          const appDir = util.getAppDir(appName);

          it('should build release js app (type:demo) ', async () => {
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

            assert.equal(bundleContent.toString().match(`jet-composites/${component}/1.0.0`), `jet-composites/${component}/1.0.0`,
              `bundle.js should contain the debug component ${component}`);

            assert.equal(bundleContent.toString().match(`jet-composites/${component}/1.0.0/min`), null,
              `bundle.js should not contain the minified component ${component}`);
          });
        }
      });
    }

    function buildReleaseExchangeComponentTest({
      appName,
      pack
    }) {
      describe('check that build release command on exchange components with bundle definitions runs successfully', () => {
        it('should successfully build and release an app using exchange component with bundle definitions', async () => {
          const appDir = util.getAppDir(appName);
          await util.execCmd(`${util.OJET_APP_COMMAND} add component ${pack}`, {
            cwd: appDir
          }, true, true);
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {
            cwd: appDir
          }, true, true);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
        });
      });
    }

    function packageComponentTest({
      appName,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'package',
          app: appName,
          component
        });
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

    function packageComponentHookTest({
      appName,
      component,
      scriptsFolder
    }) {
      describe('check that components are packaged through the hooks successfully', () => {
        it('should package the component through the hooks', async () => {
          const appDir = util.getAppDir(appName);
          const {
            beforePackageHookPath,
            afterPackageHookPath,
            defaultBeforeHookContent,
            defaultAfterHookContent
          } = util.getHooksPathAndContent(appName);
          // write custom hooks file content for testing:
          util.writeCustomHookContents({
            hookName: 'before',
            filePath: beforePackageHookPath
          });
          util.writeCustomHookContents({
            hookName: 'after',
            filePath: afterPackageHookPath
          });
          // create the component and pack to package:
          await util.execCmd(`${util.OJET_APP_COMMAND} create component ${component}`, {
            cwd: appDir
          }, true, true);
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} package component ${component}`, {
            cwd: appDir
          }, true, true);
          // Delete created component
          const {
            pathToSourceComponents
          } = util.getAppPathData(appName, scriptsFolder);
          fs.removeSync(path.join(pathToSourceComponents, component));
          // Revert default hook content
          fs.writeFileSync(beforePackageHookPath, defaultBeforeHookContent);
          fs.writeFileSync(afterPackageHookPath, defaultAfterHookContent);
          // check the results
          assert.ok(/Running before_component_package for component: component being packaged is package-hooks-component/.test(result.stdout), result.stdout);
          assert.ok(/Running after_component_package for component: component being packaged is package-hooks-component/.test(result.stdout), result.stdout);
        });
      });
    }

    // Run the build, then verify that components have been properly built.
    // Note that we verify multiple components - component is an array of components.
    function buildComponentAppTest({
      appName,
      component,
      release,
      scriptsFolder
    }) {
      const testName = release ? 'Build (Release)' : 'Build';
      const buildType = release ? 'release' : 'default';
      describe(testName, () => {
        if (!util.noBuild()) {
          it(`should build ${buildType} component app`, async () => {
            let command = `${util.OJET_APP_COMMAND} build`;
            command = release ? command + ' --release' : command;
            let result = await util.execCmd(command, {
              cwd: util.getAppDir(appName)
            }, true, true);
            assert.equal(util.buildSuccess(result.stdout), true, result.error);
          });
        }
        // dont run for vcomponent if javascript application
        component.filter(_component => scriptsFolder === 'js' ? _component !== VCOMPONENT_NAME : true).forEach((individualComponent) => {
          const appDir = util.getAppDir(appName);
          const componentsDir = path.join(appDir, 'web', 'js', 'jet-composites');
          const componentLoader = path.join(componentsDir, individualComponent, DEFAULT_COMPONENT_VERSION, 'loader.js');
          const componentMinDir = path.join(componentsDir, individualComponent, DEFAULT_COMPONENT_VERSION, 'min');
          const componentMinLoader = path.join(componentMinDir, 'loader.js');
          const componentMinLoaderMapFile = componentMinLoader.replace('loader.js', 'loader.js.map');
          if (release) {
            it(`component ${individualComponent} should have component(s) with /min directory`, () => {
              const exists = fs.pathExistsSync(componentMinDir);
              assert.ok(exists, componentMinDir);
            })
            it(`component ${individualComponent} should have min/loader.js`, () => {
              const exists = fs.pathExistsSync(componentMinLoader);
              assert.ok(exists, componentMinLoader);
            })
            it(`component ${individualComponent} should have source field with file path in min/loader.js.map`, () => {
              const sourceMapFileContent = fs.readFileSync(componentMinLoaderMapFile, {encoding : 'utf-8'});
              const sourceMapJsonObject = JSON.parse(sourceMapFileContent);
              // If there is no file path, terser emits a string "0" in the array field sources:
              const sourceMapHasSourceField = sourceMapJsonObject.sources[0] !== "0";
              const errorMessage = `component ${individualComponent} has no sources field with a file path.`;
              assert.ok(sourceMapHasSourceField, errorMessage);
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

    function preferLocalOverExchangeComponentTest({
      appName,
      scriptsFolder,
      component
    }) {
      describe('check that only components in the src folder are copied to staging incase they are both in src and exchange', () => {
        it('should prioritize components in the source folder on executing ojet build command', async () => {
          const appDir = util.getAppDir(appName);
          const {
            pathToExchangeComponents,
            pathToSourceComponents,
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          // add a component from exchange:
          await util.execCmd(`${util.OJET_APP_COMMAND} add component ${component}`, {
            cwd: appDir
          }, true, true);
          // create a component with the same name as exchange's:
          await util.execCmd(`${util.OJET_APP_COMMAND} create component ${component}`, {
            cwd: appDir
          }, true, true);
          // run the ojet build command:
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, {
            cwd: appDir
          }, true, true);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          const pathToLocalComponentInWeb = path.join(pathToBuiltComponents, component, DEFAULT_COMPONENT_VERSION);
          const localComponentExistsInWeb = fs.pathExistsSync(pathToLocalComponentInWeb);
          // get exchange component version and needed paths:
          const exchangeComponentJSON = fs.readJSONSync(path.join(pathToExchangeComponents, component, util.COMPONENT_JSON));
          const exchangeComponentVersion = exchangeComponentJSON.version;
          // the path's structure might change depending on the added component, especially when it is a member of a pack:
          const pathToExhangeComponentInWeb = path.join(pathToBuiltComponents, component, exchangeComponentVersion);
          const exchangeComponentExistsInWeb = fs.pathExistsSync(pathToExhangeComponentInWeb);
          // Delete the created components in the src and exchange folders:
          fs.removeSync(path.join(pathToExchangeComponents, component));
          fs.removeSync(path.join(pathToSourceComponents, component));
          // check the results:
          assert.ok(localComponentExistsInWeb, pathToLocalComponentInWeb);
          assert.ok(!exchangeComponentExistsInWeb, pathToExhangeComponentInWeb);
        });
      });
    }

    function buildTsComponentAppWithDeclarationFalse({
      appName
    }) {
      describe('Build (declaration = false)', () => {
        const appDir = util.getAppDir(appName);
        if (!util.noBuild()) {
          it(`should build typescript component app with declaration = false`, async () => {
            // set tsconfig.compilerOptions.declaration = false
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
          it(`should not have /types folder in ${appName}/web/js/jet-composites/${VCOMPONENT_NAME}`, () => {
            const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', VCOMPONENT_NAME, DEFAULT_COMPONENT_VERSION, 'types');
            const exists = fs.pathExistsSync(typesDir);
            assert.ok(!exists, typesDir);
          });
        }
      });
    }

    function stripMetadatainMinLoaderComponentTest({
      appName,
      scriptsFolder,
      component
    }) {
      // The STRIP_TEST_COMPONENT_JSON will be merged with those in component.json in case it is not present.
      // We need it to ensure that all needed attributes at run-time are present. Here, we have
      // added some attributes that are not needed at RT to ensure that stripping is done correctly. 
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'create',
          app: appName,
          component,
          componentJson: STRIP_TEST_COMPONENT_JSON,
          scriptsFolder
        })
      }
      describe('check that stripped metadata is in min/loader.js but not in staging', () => {
        it('should have stripped metadata in min/loader.js', async () => {
          const appDir = util.getAppDir(appName);
          const {
            pathToSourceComponents,
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToLocalComponentInWeb = path.join(pathToBuiltComponents, component, DEFAULT_COMPONENT_VERSION, 'component.json');
          const pathToLocalComponentInSrc = path.join(pathToSourceComponents, component, 'component.json');
          const componentMinDir = pathToLocalComponentInWeb.replace('component.json', COMPOSITE_COMPONENT_OPTIMIZED_FOLDER);
          const componentMinLoader = path.join(componentMinDir, COMPOSITE_COMPONENT_OPTIMIZED_FILE);
          // The required list of required attributes at run-time is: 'properties', 'methods', 'events', 'slots', and 'dynamicSlots'.
          // Since other attributes are pre defined, then we will be adding only dynamicSlots which is not common:
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {
            cwd: appDir
          }, true, true);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          // Get the test variables to check:
          const {
            webHasAllComponentJSONSrcAttributes,
            errorMessageForWeb,
            loaderHasStrippedAttributes,
            errorMessageForLoader
          } = getStripTestVariables({
            pathToLocalComponentInWeb,
            pathToLocalComponentInSrc,
            componentMinLoader
          });
          // Delete the created components in the src and exchange folders:
          fs.removeSync(path.join(pathToSourceComponents, component));
          // Check the results:
          assert.equal(loaderHasStrippedAttributes, true, errorMessageForLoader);
          assert.equal(webHasAllComponentJSONSrcAttributes, true, errorMessageForWeb);
        });
      });
    }

    function omitComponentVerstionTest({
      appName
    }) {
      describe(`Build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, () => {
        const components = [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, COMPONENT_NAME_DEMO, VCOMPONENT_NAME, EXCHANGE_COMPONENT_PACK];
        if (!util.noBuild()) {
          it(`should build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, async () => {
            const command = `${util.OJET_APP_COMMAND} build --${util.OMIT_COMPONENT_VERSION_FLAG}`;
            const result = await util.execCmd(command, {
              cwd: util.getAppDir(appName)
            }, true, false);
            assert.ok(util.buildSuccess(result.stdout), result.error);
          });
        }
        it(`should build ${components} without a version folder`, () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName);
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
          const {
            pathToBuiltComponents,
            pathToMainJs,
            componentsFolder
          } = util.getAppPathData(appName);
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
        if (!util.noBuild()) {
          it(`should release build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, async () => {
            const command = `${util.OJET_APP_COMMAND} build --${util.OMIT_COMPONENT_VERSION_FLAG} --release=true`;
            const result = await util.execCmd(command, {
              cwd: util.getAppDir(appName)
            }, true, false);
            assert.ok(util.buildSuccess(result.stdout), result.error);
          });
        }
      });
    }

    function createComponentTest({
      appName,
      scriptsFolder,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'create',
          app: appName,
          component
        });
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

    function customComponentResourceBundleTest({
      appName,
      scriptsFolder,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentTest({
          task: 'create',
          app: appName,
          component
        });
      }
      describe('check created component', () => {
        it('should have the correct folder names under nls folder', () => {
          const {
            pathToSourceComponents,
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToNlsFolder = path.join(pathToSourceComponents, component, 'resources', 'nls');
          const pathToRootFolder = path.join(pathToNlsFolder, 'root');
          const pathToDeFolder = path.join(pathToNlsFolder, 'de');
          const pathToFrFolder = path.join(pathToNlsFolder, 'fr');
          // Copy the root folder's contents to the German and French folder for translation:
          fs.copySync(pathToRootFolder, pathToDeFolder);
          fs.copySync(pathToRootFolder, pathToFrFolder);
          // Check that the path for the de and fr folders exist:
          const deStringFileExists = fs.existsSync(path.join(pathToDeFolder, `${component}-strings.${scriptsFolder}`));
          const frStringFileExists = fs.existsSync(path.join(pathToFrFolder, `${component}-strings.${scriptsFolder}`));
          assert.ok(deStringFileExists, 'de directory not created successfully');
          assert.ok(frStringFileExists, 'fr directory not created successfully');
        })
        it('should build successfully and have appropriate asserts in the resources folder', async() => {
          const appDir = util.getAppDir(appName);
          const {
            pathToSourceComponents,
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          // Retrieve the nls, root, and string file paths:
          const pathToNlsFolder = path.join(pathToBuiltComponents, component, '1.0.0', 'resources', 'nls');
          const pathToRootFolder = path.join(pathToNlsFolder, 'root');
          const pathToStringFile = path.join(pathToNlsFolder, `${component}-strings.js`);
          // Ensure that the needed info exist in the appropriate files:
          const stringFileContent = fs.readFileSync(pathToStringFile, {encoding: "utf-8"});
          const hasRootAttribute = stringFileContent.includes(`"root":`);
          const hasRootFolderinStaging = fs.existsSync(pathToRootFolder);
          const hasDeAttribute = stringFileContent.includes(`"de": true`);
          const hasFrAttribute = stringFileContent.includes(`"fr": true`);
          // Delete the created component:
          fs.removeSync(path.join(pathToSourceComponents, component));
          const componentDeleted = !fs.existsSync(path.join(pathToSourceComponents, component));
          // Check the tests:
          assert.ok(hasRootAttribute, 'root attribute is not part of the string file');
          assert.ok(hasDeAttribute, 'de language not referenced in string file');
          assert.ok(hasFrAttribute, 'fr language not referenced in string file');
          assert.ok(!hasRootFolderinStaging, 'has root folder in staging');
          assert.ok(componentDeleted, `${component} is not deleted successfully`)
        });
      });
    }

    describe('ojet create component', () => {
      function createComponentFailureTest({
        appName,
        component
      }) {
        describe('check component create failure', () => {
          it('should fail with "Invalid component name:"', async () => {
            const task = 'create';
            const result = await execComponentCommand({
              task,
              app: appName,
              component
            });
            assert.ok(util[`${task}ComponentFailure`]({
              component,
              stdout: result.stdout
            }), result.error);
          })
        })
      }

      describe('valid name', () => {
        util.runComponentTestInAllTestApps({
          test: createComponentTest,
          component: COMPONENT_NAME
        });
        util.runComponentTestInAllTestApps({
          test: createComponentTypeCompositeTest,
          component: COMPONENT_NAME_COMPOSITE,
          componentJson: {
            type: 'composite',
            dependencies: {
              [EXCHANGE_COMPONENT_NAME]: EXCHANGE_COMPONENT_VERSION
            }
          }
        });
        util.runComponentTestInAllTestApps({
          test: createComponentTypeDemoTest,
          component: COMPONENT_NAME_DEMO,
          componentJson: {
            type: 'demo'
          }
        });
        util.runComponentTestInTestApp(
          util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
            test: createVComponentTest,
            component: VCOMPONENT_NAME
          }
        );
      });
      describe('no hyphen in name', () => {
        util.runComponentTestInAllTestApps({
          test: createComponentFailureTest,
          component: 'comp1'
        });
      });
      describe('capital letter in name', () => {
        util.runComponentTestInAllTestApps({
          test: createComponentFailureTest,
          component: 'Comp-1'
        });
      });
    });
    describe('ojet add component', () => {
      util.runComponentTestInAllTestApps({
        test: addComponentTest,
        component: EXCHANGE_COMPONENT_NAME
      });
    });
    describe('ojet build component', () => {
      util.runComponentTestInAllTestApps({
        test: buildComponentTest,
        component: COMPONENT_NAME
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: buildComponentTest,
          component: VCOMPONENT_NAME
        }
      );
      util.runComponentTestInTestApp(
        util.JAVASCRIPT_COMPONENT_APP_CONFIG, {
          test: releaseBuildComponentTypeDemoTest,
          component: COMPONENT_NAME_DEMO
        }
      );
    });
    describe('ojet package component', () => {
      util.runComponentTestInAllTestApps({
        test: packageComponentTest,
        component: COMPONENT_NAME
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: packageComponentTest,
          component: VCOMPONENT_NAME
        }
      );
    });
    describe('ojet package component (hook test)', () => {
      util.runComponentTestInAllTestApps({
        test: packageComponentHookTest,
        component: 'package-hooks-component'
      });
    });

    describe('ojet build', () => {
      util.runComponentTestInAllTestApps({
        test: buildComponentAppTest,
        component: [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, VCOMPONENT_NAME],
        release: false
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: buildTsComponentAppWithDeclarationFalse
        }
      );
    });
    describe('ojet build --release', () => {
      util.runComponentTestInAllTestApps({
        test: buildComponentAppTest,
        component: [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, VCOMPONENT_NAME],
        release: true
      });
    });
    describe('ojet build --release (bundle)', () => {
      util.runComponentTestInAllTestApps({
        test: buildReleaseExchangeComponentTest,
        pack: BUNDLE_TEST_EXCHANGE_COMPONENT
      });
    });
    describe(`ojet build --${util.OMIT_COMPONENT_VERSION_FLAG}`, () => {
      util.runComponentTestInAllTestApps({
        test: omitComponentVerstionTest
      });
    });
    describe('ojet build (component exists in both exchange and src folders)', () => {
      util.runComponentTestInAllTestApps({
        test: preferLocalOverExchangeComponentTest,
        component: COPYING_TEST_COMPONENT_NAME
      });
    });
    describe('ojet build --release, stripped metadata in min/loader.js component test', () => {
      util.runComponentTestInAllTestApps({
        test: stripMetadatainMinLoaderComponentTest,
        component: STRIP_TEST_COMPONENT_NAME
      });
    });
    describe('ojet build --release, custom component resource bundle test', () => {
      util.runComponentTestInAllTestApps({
        test: customComponentResourceBundleTest,
        component: 'comp-res-bundle'
      });
    });

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
    /*
      describe('ojet remove component', () => {
        util.runComponentTestInAllTestApps({ test: removeComponentTest, component: EXCHANGE_COMPONENT_NAME });
      });
    */
  });

  describe('JET Pack Tests', () => {
    function execPackCommand({
      task,
      app,
      pack,
      version
    }) {
      return util.execCmd(
        `${util.OJET_APP_COMMAND} ${task} pack ${pack}${version ? `@${version}` : ''}`, {
          cwd: util.getAppDir(app)
        },
        false,
        true
      );
    }

    function execComponentInPackCommand({
      task,
      app,
      pack,
      component,
      flags = '',
      squelch = false
    }) {
      const command = `${util.OJET_APP_COMMAND} ${task} component ${component} ${flags} --pack=${pack}`;
      return util.execCmd(command, {
        cwd: util.getAppDir(app)
      }, squelch, true);
    }

    function beforePackTest({
      task,
      app,
      pack,
      version,
      componentJson,
      scriptsFolder
    }) {
      before(async () => {
        await execPackCommand({
          task,
          app,
          pack,
          version
        });
        if (componentJson) {
          const {
            pathToSourceComponents
          } = util.getAppPathData(app, scriptsFolder);
          const pathToComponentComponentJson = path.join(
            pathToSourceComponents,
            pack,
            util.COMPONENT_JSON
          );
          const componentComponentJson = fs.readJsonSync(pathToComponentComponentJson);
          fs.writeJsonSync(
            pathToComponentComponentJson, {
              ...componentComponentJson,
              ...componentJson
            }, {
              spaces: 2
            }
          );
          assert.ok(true);
        }
      });
    }

    function beforeComponentInPackTest({
      task,
      app,
      pack,
      component,
      flags = '',
      componentJson,
      scriptsFolder
    }) {
      before(async () => {
        await execComponentInPackCommand({
          task,
          app,
          pack,
          component,
          flags
        });
        if (componentJson) {
          const {
            pathToSourceComponents
          } = util.getAppPathData(app, scriptsFolder);
          const pathToComponentComponentJson = path.join(
            pathToSourceComponents,
            pack,
            component,
            util.COMPONENT_JSON
          );
          const componentComponentJson = fs.readJsonSync(pathToComponentComponentJson);
          fs.writeJsonSync(
            pathToComponentComponentJson, {
              ...componentComponentJson,
              ...componentJson
            }, {
              spaces: 2
            }
          );
        }
      });
    }

    function createPackTest({
      appName,
      scriptsFolder,
      pack,
      componentJson
    }) {
      if (!util.noScaffold()) {
        beforePackTest({
          task: 'create',
          app: appName,
          pack,
          componentJson,
          scriptsFolder
        });
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

    function createComponentInPackTest({
      appName,
      scriptsFolder,
      pack,
      component,
      componentJson
    }) {
      if (!util.noScaffold()) {
        beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          componentJson,
          scriptsFolder
        });
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
    function createVComponentInPackTest({
      appName,
      scriptsFolder,
      pack,
      component
    }) {
      if (!util.noScaffold()) {
        beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          flags: '--vcomponent'
        });
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
          const componentContent = fs.readFileSync(pathToComponent, {
            encoding: 'utf-8'
          });
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
        });
      });
    }

    function createResourceComponentInPackTest({
      appName,
      pack,
      scriptsFolder,
      component,
      componentJson
    }) {
      if (!util.noScaffold()) {
        before(async () => {
          const {
            pathToSourceComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const packComponentPath = path.join(pathToSourceComponents, pack);
          const resourceComponentPath = path.join(packComponentPath, component);
          // Create resource component
          const resourceComponentCommand = `${util.OJET_APP_COMMAND} create component ${component} --pack=${pack} --type=resource`;
          await util.execCmd(resourceComponentCommand, {
            cwd: util.getAppDir(appName)
          }, true, true);
          // merge provided component.json object if available
          if (componentJson) {
            const resourceComponentComponentJsonPath = path.join(resourceComponentPath, util.COMPONENT_JSON);
            const resourceComponentComponentJson = fs.readJsonSync(resourceComponentComponentJsonPath);
            fs.writeJsonSync(
              resourceComponentComponentJsonPath, {
                ...resourceComponentComponentJson,
                ...componentJson
              }, {
                spaces: 2
              }
            );
          }
          // Resource component is last to be created so can now set pack dependencies
          // to token to test behavior during build.
          const pathToPackComponentJson = path.join(packComponentPath, util.COMPONENT_JSON)
          const packComponentJson = fs.readJSONSync(pathToPackComponentJson);
          packComponentJson.dependencies = util.COMPONENT_JSON_DEPENDENCIES_TOKEN;
          fs.writeJsonSync(pathToPackComponentJson, packComponentJson, {
            spaces: 2
          });
        });
      }
      it('should check that resource component is in pack', () => {
        const {
          pathToSourceComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const packComponentPath = path.join(pathToSourceComponents, pack);
        const resourceComponentPath = path.join(packComponentPath, component);
        assert.ok(fs.existsSync(resourceComponentPath), `${component} not found in ${pack}`);
      });
      it(`should check that resource component has correct component.json`, () => {
        const {
          pathToSourceComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const packComponentPath = path.join(pathToSourceComponents, pack);
        const resourceComponentPath = path.join(packComponentPath, component);
        if (fs.existsSync(resourceComponentPath)) {
          const componentJson = fs.readJsonSync(path.join(resourceComponentPath, 'component.json'));
          assert.strictEqual(componentJson.name, component, `${component}'s name is not ${component} in component.json`);
          assert.strictEqual(componentJson.pack, pack, `${component}'s pack is not ${pack} in component.json`);
          assert.strictEqual(componentJson.type, 'resource', `${component}'s type is not resource in component.json}`);
          assert.ok(componentJson.dependencies, `${component}'s component.json does not have dependencies`);
        }
      });
      it(`should check that resource component has correct version after running ojet build --release`, async () => {
        const {
          pathToSourceComponents,
          pathToBuiltComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const packComponentJsonInSrcPath = path.join(pathToSourceComponents, pack, 'component.json');
        const packComponentJson = fs.readJsonSync(packComponentJsonInSrcPath);
        const resourceComponentInSrcPath = path.join(pathToSourceComponents, pack, component);
        const resourceComponentInWebPath = path.join(pathToBuiltComponents, pack, packComponentJson.version, component);
        await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {
          cwd: util.getAppDir(appName)
        }, true);
        if (fs.existsSync(resourceComponentInSrcPath) && fs.existsSync(resourceComponentInWebPath)) {
          const errorMessage = `${component}'s version not the same in web's and src's component.json files`;
          const componentJsonInSrc = fs.readJsonSync(path.join(resourceComponentInSrcPath, 'component.json'));
          const componentJsonInWeb = fs.readJsonSync(path.join(resourceComponentInWebPath, 'component.json'));
          assert.strictEqual(componentJsonInSrc.version, componentJsonInWeb.version, errorMessage);
        }
      });
      it('should fail to create a resource component without a --pack flag', async () => {
        const resourceComponentCommand = `${util.OJET_APP_COMMAND} create component ${component} --type=resource`;
        const result = await util.execCmd(resourceComponentCommand, {
          cwd: util.getAppDir(appName)
        }, true);
        assert.ok(/Cannot create resource component: please re-run the command with --pack and provide an existing JET pack/.test(result.stdout), result.stdout);
      });
      it('should fail to create a resource component with an invalid pack name', async () => {
        const packNameTest = 'not-valid-pack-name';
        const resourceComponentCommand = `${util.OJET_APP_COMMAND} create component ${component} --type=resource --pack=${packNameTest}`;
        const result = await util.execCmd(resourceComponentCommand, {
          cwd: util.getAppDir(appName)
        }, true);
        assert.ok(/Invalid pack name: please provide an existing JET pack/.test(result.stdout), result.stdout);
      });
    }

    function createComponentInPackFailureTest({
      appName,
      pack,
      component
    }) {
      describe('check create component in pack failure', () => {
        it('should fail with "Invalid pack name:"', async () => {
          const task = 'create';
          const result = await execComponentInPackCommand({
            task,
            app: appName,
            pack,
            component,
            flags: '',
            squelch: true
          });
          assert.ok(util[`${task}ComponentInPackFailure`]({
            stdout: result.stdout
          }), result.error);
        });
      });
    }

    function addPackTest({
      appName,
      scriptsFolder,
      pack,
      version
    }) {
      if (!util.noScaffold()) {
        beforePackTest({
          task: 'add',
          app: appName,
          pack,
          version
        });
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

    function buildComponentAppTest({
      appName,
      pack,
      component,
      vcomponent,
      resourceComponent,
      release,
      scriptsFolder
    }) {
      const testName = release ? 'Build (Release)' : 'Build';
      const buildType = release ? 'release' : 'default';
      describe(testName, () => {
        const appDir = util.getAppDir(appName);
        if (!util.noBuild()) {
          it(`should build ${buildType} component app`, async () => {
            let command = `${util.OJET_APP_COMMAND} build`;
            command = release ? `${command} --release` : command;
            const result = await util.execCmd(command, {
              cwd: appDir
            }, false, true);
            assert.equal(util.buildSuccess(result.stdout), true, result.error);
          });
        }
        const componentsDir = path.join(appDir, 'web', 'js', 'jet-composites');
        const packDir = path.join(componentsDir, pack, DEFAULT_PACK_VERSION);
        const packMinDir = path.join(packDir, 'min');
        // Test for debug pack and pack components which should always be present
        it('should have pack(s) directory', () => {
          assert.ok(fs.existsSync(packDir));
        })
        packMemberExistenceTest({
          packDir,
          component
        });
        packMemberExistenceTest({
          packDir,
          component: resourceComponent,
          type: 'resource'
        });
        if (release) {
          // Test for minified pack and pack components for release build
          it('should have pack(s) with /min directory', () => {
            const exists = fs.pathExistsSync(packMinDir);
            assert.ok(exists, packMinDir);
          });
          packMemberExistenceTest({
            packDir: packMinDir,
            component,
            release: true
          });
          packMemberExistenceTest({
            packDir: packMinDir,
            component: resourceComponent,
            release: true,
            type: 'resource'
          });
        } else {
          // Test for missing min/ for debug build
          it('should not have pack(s) with /min directory', () => {
            const exists = fs.pathExistsSync(packMinDir);
            assert.ok(!exists, packMinDir);
          });
        }
        if (scriptsFolder === 'ts') {
          // Test for type definitions and vcomponent in ts app
          packMemberExistenceTest({
            packDir,
            component: vcomponent
          });
          if (release) {
            packMemberExistenceTest({
              packDir: packMinDir,
              component: vcomponent,
              release: true
            });
          }
          it('should have pack(s) with /types directory', () => {
            const {
              pathToBuiltComponents
            } = util.getAppPathData(appName)
            const typesDir = path.join(pathToBuiltComponents, pack, DEFAULT_PACK_VERSION, 'types', vcomponent);
            const exists = fs.pathExistsSync(typesDir);
            assert.ok(exists, typesDir);
          });
          it('should not have vcomponent(s) in pack with /types directory', () => {
            const {
              pathToBuiltComponents
            } = util.getAppPathData(appName)
            const typesDir = path.join(pathToBuiltComponents, pack, DEFAULT_PACK_VERSION, vcomponent, 'types');
            const exists = fs.pathExistsSync(typesDir);
            assert.ok(!exists, typesDir);
          });
        }
      });
    }

    function packMemberExistenceTest({
      packDir,
      component,
      type = 'composite'
    }) {
      it(`should have pack(s) with ${path.basename(packDir)}/${component}`, () => {
        assert.ok(fs.existsSync(path.join(packDir, component)), `Built pack does not have ${packDir}/${component}/${component}`);
      });
      if (type === 'resource') {
        it(`should have pack(s) with ${path.basename(packDir)}/${component}/${RESOURCE_COMPONENT_OPTIMIZED_FILE}`, () => {
          assert.ok(
            fs.existsSync(path.join(packDir, component, RESOURCE_COMPONENT_OPTIMIZED_FILE)),
            `Built pack does not have ${packDir}/${component}/${RESOURCE_COMPONENT_OPTIMIZED_FILE}`
          );
        });
      } else {
        it(`should have pack(s) with ${path.basename(packDir)}/${component}/${COMPOSITE_COMPONENT_OPTIMIZED_FILE}`, () => {
          assert.ok(
            fs.existsSync(path.join(packDir, component, COMPOSITE_COMPONENT_OPTIMIZED_FILE)),
            `Built pack does not have ${packDir}/${component}/${COMPOSITE_COMPONENT_OPTIMIZED_FILE}`
          );
        });
      }
    }

    function stripMetadatainMinLoaderPackTest({
      appName,
      scriptsFolder,
      component,
      pack
    }) {
      if (!util.noScaffold()) {
        beforePackTest({
          task: 'create',
          app: appName,
          pack,
          scriptsFolder
        });
        beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          componentJson: STRIP_TEST_COMPONENT_JSON,
          scriptsFolder
        });
      }
      describe('check that stripped metadata is in min/loader.js but not in staging', () => {
        it('should have stripped metadata in min/loader.js', async () => {
          const appDir = util.getAppDir(appName);
          const {
            pathToSourceComponents,
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToLocalComponentInWeb = path.join(pathToBuiltComponents, pack, DEFAULT_COMPONENT_VERSION, component, 'component.json');
          const pathToLocalComponentInSrc = path.join(pathToSourceComponents, pack, component, 'component.json');
          const componentMinDir = pathToLocalComponentInWeb.replace(`${component}${path.sep}component.json`, COMPOSITE_COMPONENT_OPTIMIZED_FOLDER);
          const componentMinLoader = path.join(componentMinDir, component, COMPOSITE_COMPONENT_OPTIMIZED_FILE);
          // The required list of required attributes at run-time is: 'properties', 'methods', 'events', 'slots', and 'dynamicSlots'.
          // Since other attributes are pre defined, then we will be adding only dynamicSlots which is not common:
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {
            cwd: appDir
          }, true, true);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
          // Get the test variables to check:
          const {
            webHasAllComponentJSONSrcAttributes,
            errorMessageForWeb,
            loaderHasStrippedAttributes,
            errorMessageForLoader
          } = getStripTestVariables({
            pathToLocalComponentInWeb,
            pathToLocalComponentInSrc,
            componentMinLoader
          });
          // Delete the created components in the src and exchange folders:
          fs.removeSync(path.join(pathToSourceComponents, pack));
          // Check the results:
          assert.equal(loaderHasStrippedAttributes, true, errorMessageForLoader);
          assert.equal(webHasAllComponentJSONSrcAttributes, true, errorMessageForWeb);
        });
      });
    }

    function buildReleaseCheckBundle({
      appName,
      pack
    }) {
      const testName = 'Build (Release)';
      const buildType = 'release';
      describe(testName, () => {
        if (!util.noBuild()) {
          it(`should build ${buildType} component app`, async () => {
            const appDir = util.getAppDir(appName);
            let command = `${util.OJET_APP_COMMAND} build --release`;
            const result = await util.execCmd(command, {
              cwd: appDir
            }, false, true);
            assert.equal(util.buildSuccess(result.stdout), true, result.error);
          });
        }
        it('should not have the bundle stub file', () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName)
          const pathToBundle = path.join(
            pathToBuiltComponents,
            pack,
            DEFAULT_PACK_VERSION,
            `${BUNDLE_NAME}.js`
          );
          const exists = fs.existsSync(pathToBundle);
          assert.ok(!exists, pathToBundle);
        });

        it('release build: path mapping to minified bundle', async () => {
          // The following entry should be in paths:
          // "packbundle-1":"jet-composites/packbundle-1/1.0.0/min"
          const bundleContent = getBundleJsContent({
            appName
          });
          assert.equal(bundleContent.toString().match(`jet-composites/${BUNDLE_PACK_NAME}/1.0.0/min`),
            `jet-composites/${BUNDLE_PACK_NAME}/1.0.0/min`,
            `bundle.js should contain the minified bundle ${BUNDLE_PACK_NAME}`);

        });

        it('release build: bundle content (local component)', async () => {
          // Check the bundle for the local pack bundle property
          const localPackBundle = `${BUNDLE_PACK_NAME}/${BUNDLE_NAME}`;
          var hasLocalPackBundle = false;
          const bundlesPropObj = getBundleJsBundlesObject({
            appName
          });
          if (bundlesPropObj.hasOwnProperty(localPackBundle)) {
            hasLocalPackBundle = true;
          }
          assert.ok(hasLocalPackBundle, `local pack bundle ${localPackBundle} injected into bundles.js`);
        });

        it('release build: bundle content (exchange component)', async () => {
          // Check the bundle for the exchange pack bundle property
          const exchangePackBundle = `${EXCHANGE_PACK}/${EXCHANGE_PACK_BUNDLE}`;
          var hasExchangePackBundle = false;
          const bundlesPropObj = getBundleJsBundlesObject({
            appName
          });
          if (bundlesPropObj.hasOwnProperty(exchangePackBundle)) {
            hasExchangePackBundle = true;
          }
          assert.ok(hasExchangePackBundle, `exchange pack bundle ${exchangePackBundle} injected into bundles.js`);
        });
        it(`should create pack bundle containing only ${BUNDLE_COMPONENT_NAME1} & ${RESOURCE_COMPONENT_NAME}`, () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName);
          const pathToPackRoot = path.join(
            pathToBuiltComponents,
            pack,
            DEFAULT_PACK_VERSION
          );
          const pathToPackBundle = path.join(
            pathToPackRoot,
            'min',
            `${BUNDLE_NAME}.js`
          );
          const pathToPackComponentJson = path.join(
            pathToPackRoot,
            util.COMPONENT_JSON
          );
          const packComponentJson = fs.readJSONSync(pathToPackComponentJson);
          // Convert [<pack>/<component1>/<file>, <pack>/<component2>/<file>] to
          // [<component1>, <component2>]
          const componentsInBundle = packComponentJson.bundles[`${pack}/${BUNDLE_NAME}`]
            .map((componentBundlePath) => {
              const [pack, component] = path.normalize(componentBundlePath).split(path.sep);
              return component;
            });
          const expectedComponentsInBundle = new Set(componentsInBundle);
          // the goal of this test is to read the bundle contents and ensure that the only components in
          // the bundle are the ones listed in the pack's bundle configuration
          const packBundleContent = fs.readFileSync(pathToPackBundle, {
            encoding: 'utf-8'
          });
          // this regex extracts <component> from define('<pack>/<component>/<file>',...) lines in the bundle
          const componentRegex = new RegExp(`${pack}\/(?<component>[\\w-]+)\/`, 'gi');
          let regexMatch;
          // loop through all components and verify that they should be in the bundle
          // (i.e. <component> in <pack>/<component>/<file> definitions)
          while ((regexMatch = componentRegex.exec(packBundleContent)) !== null) {
            const {
              groups: {
                component
              }
            } = regexMatch;
            assert.ok(
              expectedComponentsInBundle.has(component),
              `${pack}-${component} is in ${BUNDLE_NAME} but is not listed as a bundle member`
            );
          }
        });
      });
    }

    function packagePackTest({
      appName,
      pack
    }) {
      if (!util.noScaffold()) {
        beforePackTest({
          task: 'package',
          app: appName,
          pack
        });
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

    function packagePackHookTest({
      appName,
      component,
      pack,
      scriptsFolder
    }) {
      describe('check that packs are packaged through the hooks successfully', () => {
        it('should package the pack through the hooks', async () => {
          const appDir = util.getAppDir(appName);
          const {
            beforePackageHookPath,
            afterPackageHookPath,
            defaultBeforeHookContent,
            defaultAfterHookContent
          } = util.getHooksPathAndContent(appName);
          // write custom hooks file content for testing:
          util.writeCustomHookContents({
            hookName: 'before',
            filePath: beforePackageHookPath
          });
          util.writeCustomHookContents({
            hookName: 'after',
            filePath: afterPackageHookPath
          });
          // create the component and pack to package:
          await util.execCmd(`${util.OJET_APP_COMMAND} create pack ${pack}`, {
            cwd: appDir
          }, true, true);
          await util.execCmd(`${util.OJET_APP_COMMAND} create component ${component} --pack=${pack}`, {
            cwd: appDir
          }, true, true);
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} package pack ${pack}`, {
            cwd: appDir
          }, true, true);
          // Delete created component
          const {
            pathToSourceComponents
          } = util.getAppPathData(appName, scriptsFolder);
          fs.removeSync(path.join(pathToSourceComponents, component));
          // Revert default hook content
          fs.writeFileSync(beforePackageHookPath, defaultBeforeHookContent);
          fs.writeFileSync(afterPackageHookPath, defaultAfterHookContent);
          // check the results
          assert.ok(/Running before_component_package for component: component being packaged is package-hooks-pack/.test(result.stdout), result.stdout);
          assert.ok(/Running after_component_package for component: component being packaged is package-hooks-pack/.test(result.stdout), result.stdout);
        });
      });
    }

    function buildPackTest({
      appName,
      pack,
      vcomponent,
      scriptsFolder
    }) {
      if (!util.noScaffold()) {
        beforePackTest({
          task: 'build',
          app: appName,
          pack
        });
      }
      describe('check built pack', () => {
        const appDir = util.getAppDir(appName);
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

    function getBundleJsContent({
      appName
    }) {
      const {
        pathToBundleJs
      } = util.getAppPathData(appName);
      const bundleContent = fs.readFileSync(pathToBundleJs);
      return bundleContent;
    }

    //
    // Return a bundle property object.
    //
    function getBundleJsBundlesObject({
      appName
    }) {
      const bundleContent = getBundleJsContent({
        appName
      });
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

    describe('ojet create pack', () => {
      util.runComponentTestInAllTestApps({
        test: createPackTest,
        pack: PACK_NAME
      });
    });
    describe('ojet create component --pack', () => {
      describe('valid pack name', () => {
        util.runComponentTestInAllTestApps({
          test: createComponentInPackTest,
          pack: PACK_NAME,
          component: COMPONENT_NAME
        });
      })
      describe('invalid pack name', () => {
        util.runComponentTestInAllTestApps({
          test: createComponentInPackFailureTest,
          pack: 'pack-2',
          component: COMPONENT_NAME
        });
      })
    });
    //
    // Create  a 'stripped down vcomponent',
    // where the pack's vcomponent has a missing version etc.
    //
    describe('ojet create component --vcomponent --pack', () => {
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: createVComponentInPackTest,
          pack: PACK_NAME,
          component: VCOMPONENT_NAME
        }
      );
    });
    describe('create resource component', () => {
      util.runComponentTestInAllTestApps({
        test: createResourceComponentInPackTest,
        pack: PACK_NAME,
        component: RESOURCE_COMPONENT_NAME,
        componentJson: {
          dependencies: {
            [`${PACK_NAME}-${COMPONENT_NAME}`]: DEFAULT_COMPONENT_VERSION
          }
        }
      });
    });
    describe('ojet add pack', () => {
      util.runComponentTestInAllTestApps({
        test: addPackTest,
        pack: EXCHANGE_PACK,
        version: EXCHANGE_PACK_VERSION
      });
    })
    describe('ojet package pack', () => {
      util.runComponentTestInAllTestApps({
        test: packagePackTest,
        pack: PACK_NAME
      });
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: packagePackTest,
          pack: PACK_NAME,
          component: VCOMPONENT_NAME
        }
      );
    });

    describe('ojet package pack (hook test)', () => {
      util.runComponentTestInAllTestApps({
        test: packagePackHookTest,
        component: 'package-hooks-component',
        pack: 'package-hooks-pack'
      });
    });

    describe('ojet build', () => {
      util.runComponentTestInAllTestApps({
        test: buildComponentAppTest,
        pack: PACK_NAME,
        component: COMPONENT_NAME,
        vcomponent: VCOMPONENT_NAME,
        resourceComponent: RESOURCE_COMPONENT_NAME,
        release: false
      });
    });

    describe('ojet build --release', () => {
      util.runComponentTestInAllTestApps({
        test: buildComponentAppTest,
        pack: PACK_NAME,
        component: COMPONENT_NAME,
        vcomponent: VCOMPONENT_NAME,
        resourceComponent: RESOURCE_COMPONENT_NAME,
        release: true
      });
    });

    // Verify the 'stripped down vcomponent' created in createVComponentInPackTest.
    describe('ojet build pack <pack>', () => {
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: buildPackTest,
          pack: PACK_NAME,
          vcomponent: VCOMPONENT_NAME
        }
      );
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
    describe('ojet create pack (bundle) ', () => {
      util.runComponentTestInAllTestApps({
        test: createPackTest,
        pack: BUNDLE_PACK_NAME,
        componentJson: {
          bundles: {
            [`${BUNDLE_PACK_NAME}/${BUNDLE_NAME}`]: [
              `${BUNDLE_PACK_NAME}/${BUNDLE_COMPONENT_NAME1}/loader`,
              `${BUNDLE_PACK_NAME}/${RESOURCE_COMPONENT_NAME}/index`
            ]
          }
        }
      });
    });

    // create two pack components
    describe('ojet create component --pack (bundle)', () => {
      describe('valid pack name', () => {
        util.runComponentTestInAllTestApps({
          test: createComponentInPackTest,
          pack: BUNDLE_PACK_NAME,
          component: BUNDLE_COMPONENT_NAME1,
          componentJson: {
            dependencies: {
              [`${BUNDLE_PACK_NAME}-${BUNDLE_COMPONENT_NAME2}`]: DEFAULT_COMPONENT_VERSION
            }
          }
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
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: createVComponentInPackTest,
          pack: BUNDLE_PACK_NAME,
          component: BUNDLE_VCOMPONENT_NAME1
        }
      );
      util.runComponentTestInTestApp(
        util.TYPESCRIPT_COMPONENT_APP_CONFIG, {
          test: createVComponentInPackTest,
          pack: BUNDLE_PACK_NAME,
          component: BUNDLE_VCOMPONENT_NAME2
        }
      );
    });

    describe('create resource component (bundle)', () => {
      util.runComponentTestInAllTestApps({
        test: createResourceComponentInPackTest,
        pack: BUNDLE_PACK_NAME,
        component: RESOURCE_COMPONENT_NAME,
        componentJson: {
          dependencies: {
            [`${BUNDLE_PACK_NAME}-${BUNDLE_COMPONENT_NAME1}`]: DEFAULT_COMPONENT_VERSION
          }
        }
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
        resourceComponent: RESOURCE_COMPONENT_NAME,
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

    describe('ojet build --release, stripped metadata in min/loader.js pack test', () => {
      util.runComponentTestInAllTestApps({
        test: stripMetadatainMinLoaderPackTest,
        pack: STRIP_TEST_PACK_NAME,
        component: STRIP_TEST_COMPONENT_NAME
      });
    });
  });
});