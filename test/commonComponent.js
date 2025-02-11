/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const extract = require('extract-zip');
const _ = require('lodash');

const util = require('./util');

const EXCHANGE_COMPONENT_PACK = 'oj-dynamic';
const EXCHANGE_COMPONENT_PACK_MEMBER = 'form';
const COMPONENT_NAME = 'comp-one';
const INVALID_COMPONENT_NAME = 'comp-1';
const DEFAULT_COMPONENT_VERSION = '1.0.0';
const LOADERLESS_COMPONENT_NAME = 'loaderless-component';
// Component with type:demo
const COMPONENT_NAME_DEMO = 'comp-demo';
const VCOMPONENT_NAME = 'vcomp-one';
const VBCS_PATTERN_COMPONENT_NAME = 'pat-one';

const BUNDLE_COMPONENT_NAME1 = 'bundlecomp-one';
const BUNDLE_COMPONENT_NAME2 = 'bundlecomp-two';

const BUNDLE_VCOMPONENT_NAME1 = 'bundlevcomp-one';
const BUNDLE_VCOMPONENT_NAME2 = 'bundlevcomp-two';

const RESOURCE_COMPONENT_NAME = 'resources';

const DEFAULT_PACK_VERSION ='1.0.0';
const BUNDLE_PACK_NAME = 'packbundle-one';

// Component with type:composite
const COMPONENT_NAME_COMPOSITE = 'comp-composite';

const COMPOSITE_COMPONENT_OPTIMIZED_FOLDER = 'min';
const COMPOSITE_COMPONENT_OPTIMIZED_FILE = 'loader.js';

// This value is set initially but later updated
// the specific (and possibly more accurate) version
// that was downloaded in add component:
const EXCHANGE_COMPONENT_VERSION = '9.0.0-alpha10';
const EXCHANGE_PACK_BUNDLE = 'shell-bundle';

const COPYING_TEST_COMPONENT_NAME = 'demo-card';
const BUNDLE_TEST_EXCHANGE_COMPONENT = 'oj-sample-metric';
const RESOURCE_COMPONENT_OPTIMIZED_FILE = 'index.js';

const BUNDLE_NAME = 'component-bundle';

const PACK_NAME = 'pack-one';
const INVALID_PACK_NAME = 'pack-1';
const MONO_PACK_NAME = 'mono-pack';
const EXCHANGE_PACK = 'oj-gbu-app';
const EXCHANGE_PACK_VERSION = '3.0.0';

// Use SLASH_STAR to avoid code editor malformatting
const SLASH_STAR = '/*';

const EXCHANGE_COMPONENT_NAME = `${EXCHANGE_COMPONENT_PACK}-${EXCHANGE_COMPONENT_PACK_MEMBER}`;
const STRIP_TEST_COMPONENT_JSON = {"displayName":"A user friendly, translatable name of an unfriendly component.","description":"A translatable high-level description for a low-level component.","properties":{"helpHints":{"displayName":"Help Hints","description":"Represents hints for oj-form-layout element to render help information on the label for this helpless component.","type":"object","properties":{"sub-property":{"type":"string","placeholder":"Start at the very beginning...","enumValues":["doe","ray","mee"],"propertyEditorValues":{"doe":{"description":"A deer, a female deer...","displayName":"Doe","icon":{"hoverIconPath":"./path/to/hover","iconPath":"./path/to/icon","selectedIconPath":"./path/to/selection"}},"ray":{"description":"A drop of golden sun...","displayName":"Ray"},"mee":{"description":"Me, a name to call myself...","displayName":"Me"}},"value":"string","writeback":false,"units":"notes","binding":{"consume":{"name":"my-binding"},"provide":[{"name":"provider","default":"valueBind","transform":{"transform-prop":false}}]}}}},"source":{"displayName":"Source","description":"Hint for help source URL associated with the label.","type":"string","readOnly":true,"translatable":true,"dynamicSlotDef":"emptyDynamicSlot"},"readOnly":{"displayName":"Readonly","description":"Defines if the calendar as a whole can be edited in any way, can be overridden by individual events","type":"boolean|null","propertyGroup":"common","extension":{"calendarOption":"editable","transform":"invert"}},"fishes":{"type":"Array<object>","displayName":"Fishes","description":"Ordered list of fishes managed by this component","extension":{"vbdt":{"itemProperties":{"name":{"type":"string","description":"Name of the fish (e.g., 'Harold')"},"species":{"type":"object","displayName":"Species","description":"The fish's species information","properties":{"latin":{"type":"string","description":"Latin name of the species"},"english":{"type":"string","description":"Informal (english) name of the species"}}}}}}}},"methods":{"focus":{"internalName":"setFocus","description":"A function to set focus on the field","return":"boolean","help":"Go to this link...","visible":false,"params":[{"name":"value","description":"Value to set focus to","type":"string|null","status":[{"description":"Use a string value instead.","since":"1.1.0","target":"parameterType","value":["null"],"type":"deprecated"}]}],"status":[{"description":"Use standard HTML 'focus' method instead.","since":"2.0.0","type":"deprecated"}],"displayName":"setFocus method","extension":{"webelement":{"exceptionStatus":[{"type":"unsupported","since":"3.0.0","description":"Knock it off!"}]}}},"methodWithExtensionMD":{"description":"Dummy method with extension metadata that gets wiped","displayName":"Dummy Method","help":"dummy.html","extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"},"visible":true,"return":"string"},"foo":{}},"events":{"onclick":{"bubbles":true,"description":"Demo event","status":[{"description":"Go listen to something else","since":"3.0.0","type":"deprecated"}],"cancelable":true,"help":"click.html","displayName":"onClick Handler","visible":true,"detail":{"sourceID":{"type":"string|number","eventGroup":"common","description":"Who sent you?","extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"},"status":[{"description":"Expect sourceIDs to only be of type 'number' as of version 4.0.0","since":"2.0.0","target":"parameterType","value":["string"],"type":"deprecated"}]}}},"onTestShouldBeEmpty":{"description":"For testing","bubbles":false,"displayName":"empty on stripping","help":"./running_on_empty.html"},"onAnythingJustEmpty":{}},"slots":{"":{"description":"This is the default slot, y'all","displayName":"Default", "implicitBusyContext": true},"deposits":{"description":"Where money is deposited","implicitBusyContext": true, "visible":true,"extension":{"vbdt":{"description":"demo"}},"displayName":"Deposit Slot","help":"depository.html","status":[{"description":"Does this look like a bank?!??!","since":"3.0.0","type":"deprecated"}],"data":{"bankInfo":{"description":"Bank information","type":"object","properties":{"name":{"type":"string","placeholder":"First National...","description":"Name of the bank","readOnly":true,"writeback":false,"extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"}},"amount":{"type":"number","description":"Amount"},"routing":{"type":"number|null","displayName":"Routing Number","description":"Bank routing number if a check, or null if cash"}}}},"preferredContent":["MoneyElement","CheckElement"],"maxItems":1000,"minItems":1},"shouldEndUpEmpty":{"visible":false,"displayName":"should be empty","description":"to test the code","maxItems":100,"minItems":0},"emptySlot":{}},"dynamicSlots":{"dynamic-slot":{"visible":true,"preferredContent":["PreferredContent"],"status":[{"description":"my status","since":"2.0.0","target":"parameterType","value":["string"],"type":"deprecated"}],"description":"slot for Dynamic Slot","displayName":"Dynamic Slot","help":"dy/no/mite.html","data":{"data-dynamic":{"description":"This is data for dyanamic slot","status":[{"description":"my status","since":"2.0.0","target":"parameterType","value":["string"],"type":"deprecated"}],"type":"string"}}},"emptyDynamicSlot":{}},"help":"comp1.html","since":"0.0.7","license":"MIT","styleVariables":[{"name":"comp-background","description":"Specify the component background","formats":["color"],"help":"stylish.html","displayName":"Variable","status":[{"description":"No background for you!","since":"2.2.0","type":"deprecated"}],"keywords":["auto","transparent"],"extension":{"catalog":{"description":"I am to go!","check":{"description":"Mamam"}},"oracle":{"businessApprovals":{"description":"I am a software engineer at Oracle"}},"vbdt":{"description":"I am to go!"},"audit":{"thisData":{"description":"Het","type":"string"}},"calendarOption":"now"}}],"status":[{"description":"This whole component was a mistake...","since":"3.0.0","type":"deprecated"}],"extension":{"catalog":{"audits":"../audit/rules.zip","category":"Other","tags":["worthless","garbage","trash"],"extraInfo":{}},"oracle":{"businessApprovals":{"vitaMeetaVegamin":"123456"},"uxSpecs":["figma-imagination"]},"themes":{"unsupportedThemes":["Stable"]},"vbdt":{"audits":"../audit/vbcs/rules.zip","defaultColumns":12,"minColumns":6}},"type":"composite"};
const STRIP_TEST_COMPONENT_NAME = 'comp-strip';
const STRIP_TEST_PACK_NAME = 'pack-strip';
const EXPECTED_STRIPPED_JSON = {"name":"comp-strip","version":"1.0.0","properties":{"helpHints":{"type":"object","properties":{"sub-property":{"type":"string","enumValues":["doe","ray","mee"],"value":"string","writeback":false,"binding":{"consume":{"name":"my-binding"},"provide":[{"name":"provider","default":"valueBind","transform":{"transform-prop":false}}]}}}},"source":{"type":"string","readOnly":true},"readOnly":{"type":"boolean|null","extension":{"calendarOption":"editable","transform":"invert"}},"fishes":{"type":"Array<object>"}},"methods":{"focus":{"internalName":"setFocus"},"methodWithExtensionMD":{"extension":{"audit":{"thisData":{"type":"string"}},"calendarOption":"now"}},"foo":{}},"events":{"onclick":{"detail":{"sourceID":{"type":"string|number","extension":{"audit":{"thisData":{"type":"string"}},"calendarOption":"now"}}}},"onTestShouldBeEmpty":{},"onAnythingJustEmpty":{}},"slots":{"":{"implicitBusyContext": true},"deposits":{"implicitBusyContext": true, "data":{"bankInfo":{"type":"object","properties":{"name":{"type":"string","readOnly":true,"writeback":false,"extension":{"audit":{"thisData":{"type":"string"}},"calendarOption":"now"}},"amount":{"type":"number"},"routing":{"type":"number|null"}}}}},"shouldEndUpEmpty":{},"emptySlot":{}},"dynamicSlots":{"dynamic-slot":{"data":{"data-dynamic":{"type":"string"}}},"emptyDynamicSlot":{}}};

    // 
    // Create a 'stripped down' vcomponent in a pack.
    // The pack's vcomponent will have:
    //   - missing ojmetadata from the vcomponent's .tsx file 
    //     (including version, jetVersion, pack)
    //     (e.g: webTsComponentTest/src/ts/pack-one/vcomp-one/vcomp-one.tsx
    //   - missing dependencies from the pack's component.json.
    // 
        function _createVComponentInPackTest({
            appName,
            scriptsFolder,
            pack,
            component
          }) {
            if (!util.noScaffold()) {
              _beforeComponentInPackTest({
                task: 'create',
                app: appName,
                pack,
                component,
                flags: '--vcomponent'
              });
            }
            describe('check created component in pack', () => {
              it(`should have ${appName}/src/${scriptsFolder}/${pack}/${component}/${component}.tsx`, () => {
                const pathToComponent = util.getAppDir(path.join(
                  util.getAppDir(appName),
                  'src',
                  scriptsFolder,
                  'jet-composites',
                  pack,
                  component,
                  `${component}.tsx`
                ));
                const exists = fs.pathExistsSync(pathToComponent);
                assert.ok(exists, pathToComponent);
              });
              it('should have the correct pack in @ojmetadata pack jsdoc', () => {
                const pathToComponent = util.getAppDir(path.join(
                  util.getAppDir(appName),
                  'src',
                  scriptsFolder,
                  'jet-composites',
                  pack,
                  component,
                  `${component}.tsx`
                ));
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
                // webTsComponentTest/web/js/jet-composites/pack-one
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
          };
      
      
function _createVComponentTest({
  appName,
  scriptsFolder,
  component
}) {
  if (!util.noScaffold()) {
    _beforeComponentTest({
      task: 'create',
      app: appName,
      component,
      flags: '--vcomponent'
    });
  }
  describe('check created vcomponent', () => {
    it(`should have ${appName}/src/${scriptsFolder}/${component}/${component}.tsx`, () => {
      const pathToComponent = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        `${component}.tsx`
      ));
      const exists = fs.pathExistsSync(pathToComponent);
      assert.ok(exists, pathToComponent);
    });
    it('should not have @ojmetadata pack "@pack-name@" jsdoc', () => {
      const pathToComponent = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        `${component}.tsx`
      ));
      const packRegex = new RegExp('@ojmetadata pack', 'g');
      const componentContent = fs.readFileSync(pathToComponent, {
        encoding: 'utf-8'
      });
      const hasPack = !!packRegex.exec(componentContent);
      assert.ok(!hasPack, 'singleton vcomponent has @ojmetadata pack jsdoc');
    });
    it('should have a declared global namespace in loader.ts', () => {
      const pathToComponent = util.getAppDir(path.join(
        util.getAppDir(appName),
        'src',
        scriptsFolder,
        'jet-composites',
        component,
        'loader.ts'
      ));
      const regex = /declare\s*global(?<namespaceContent>.*)/gms;
      const loaderContent = fs.readFileSync(pathToComponent, {
        encoding: 'utf-8'
      });
      const match = regex.exec(loaderContent);
      const hasGlobalNameSpace = loaderContent.includes(
        match
        .groups
        .namespaceContent
        .replace(/\\n/g, '')
      );
      assert.ok(hasGlobalNameSpace, 'Does not have a declared global namespace in loader.ts');
    });
  });
};

function _createComponentInMonoPackTest({
    appName,
    scriptsFolder,
    pack,
    component,
    componentJson,
    flags
  }) {
    if (scriptsFolder === 'ts') {
      if (!util.noScaffold()) {
        _beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          componentJson,
          scriptsFolder,
          flags
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
        it('should not add entry to dependencies object in pack', () => {
          const pathToPackComponentJson = util.getAppDir(path.join(
            util.getAppDir(appName),
            'src',
            scriptsFolder,
            'jet-composites',
            pack,
            'component.json'
          ));
          const componentJson = fs.readJSONSync(pathToPackComponentJson);
          const entryDoesNotExists = Object.keys(componentJson.dependencies).length === 0;
          assert(entryDoesNotExists, 'added component entry to dependencies in pack component.json');
        });
        it('should add entry to contents array object in pack', () => {
          const pathToPackComponentJson = util.getAppDir(path.join(
            util.getAppDir(appName),
            'src',
            scriptsFolder,
            'jet-composites',
            pack,
            'component.json'
          ));
          const packComponentJson = fs.readJSONSync(pathToPackComponentJson);
          let entryAddedIntoContentArray = false;
          packComponentJson.contents.forEach(
            (content) => {
              if (content.name === component && content.type === 'resource') {
                entryAddedIntoContentArray = true;
                return;
              }
            });
          assert(entryAddedIntoContentArray , 'component not added into contents array in pack component.json');
        });
      });
    }
  };

function _createComponentInPackTest({
    appName,
    scriptsFolder,
    pack,
    component,
    componentJson
  }) {
    if (!util.noScaffold()) {
      _beforeComponentInPackTest({
        task: 'create',
        app: appName,
        pack,
        component,
        componentJson,
        scriptsFolder
      });
    }
    describe('check created component in pack', () => {
      it(`should have ${appName}/src/${scriptsFolder}/jet-composites/${pack}/${component}/component.json`, () => {
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
        assert(entryExists, 'component entry was added to dependencies in pack component.json');
      });
    });
  };

function _createMonoPackTest({
    appName,
    scriptsFolder,
    pack,
    flags
  }) {
    describe('check created pack', () => {
      it(`should create mono-pack in ts or fails in js application`, async() => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} create pack ${pack} ${flags}`, {
          cwd: util.getAppDir(appName)}, true);
        if (scriptsFolder === 'js') {
          assert.ok(/Cannot create a mono-pack in a Javascript application/.test(result.stdout), result.stdout);
        } else {
          assert.ok(/Success: Pack \'mono-pack\' successfully created./.test(result.stdout), result.stdout);
        }
      });
      if (scriptsFolder === 'ts') {
        it('should add a top-level content of type module in component.json and create folder common with the module in src folder', () => {
          const pathToSrcFolder = path.join(
            util.getAppDir(appName),
            'src',
            scriptsFolder,
            'jet-composites',
            pack
          );
          const pathToComponentJson = path.join(pathToSrcFolder, 'component.json');
          const pathToModule = path.join(pathToSrcFolder, 'common', 'someFunction');
          if (!fs.existsSync(pathToModule)) {
            fs.mkdirSync(
              pathToModule,
              {
                recursive: true
              } 
            )
          }
          fs.writeFileSync(path.join(pathToModule, 'index.ts'), '// Test file.');
          let componentJson = fs.readJSONSync(pathToComponentJson);
          let hasContentModule = false;
          componentJson.contents.push({
            'name': 'someFunction',
            'main': 'common/someFunction',
            'type': 'module',
            'directImport': true
          });
          const errorMessage = 'pack does not have contents attribute with type module in component.json';
          fs.writeJSONSync(pathToComponentJson, componentJson);
          fs.readJSONSync(pathToComponentJson).contents.forEach(
            (content) => {
              if (content.type && content.type === 'module') {
                hasContentModule = true;
                return;
              }
            });
          const moduleExists = fs.existsSync(path.join(pathToModule, 'index.ts'));
          assert.equal(hasContentModule, true, errorMessage);
          assert.ok(moduleExists, pathToModule);
        });
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
        it('should have the correct pack type in component.json', () => {
          const pathToComponentJson = util.getAppDir(path.join(
            util.getAppDir(appName),
            'src',
            scriptsFolder,
            'jet-composites',
            pack,
            'component.json'
          ));
          const componentJson = fs.readJSONSync(pathToComponentJson);
          const typeMatches = componentJson.type === 'mono-pack';
          assert(typeMatches, `Incorrect pack type. Expected mono-pack, but got ${componentJson.type}`);
        });
        it('should have the top-level contents attribute in component.json', () => {
          const pathToComponentJson = util.getAppDir(path.join(
            util.getAppDir(appName),
            'src',
            scriptsFolder,
            'jet-composites',
            pack,
            'component.json'
          ));
          const componentJson = fs.readJSONSync(pathToComponentJson);
          const errorMessage = 'pack does not have contents attribute array in component.json';
          const hasContentsAttributeArray = componentJson.contents !== undefined && Array.isArray(componentJson.contents);
          assert(hasContentsAttributeArray, errorMessage);
        });
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
  };

function _createPackTest({
    appName,
    scriptsFolder,
    pack,
    componentJson
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
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
  };

function _createPackFailureTest({
    appName,
    pack
  }) {
    describe('check pack create failure', () => {
      it('should fail with "The second segment of the pack name must not start with a digit."', async () => {
        const task = 'create';
        const result = await _execComponentCommand({
          task,
          app: appName,
          pack
        });
        assert.ok(util[`${task}ComponentFailure`]({
          pack,
          stdout: result.stdout
        }), result.error);
      })
    })
  };

function _buildPackTest({
    appName,
    pack,
    vcomponent,
    scriptsFolder
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
        task: 'build',
        app: appName,
        pack
      });
    }
    describe('check built pack', () => {
      it(`should have ${appName}/web/js/jet-composites/${pack}/component.json`, () => {
        const appDir = util.getAppDir(appName);
        const packComponentJsonPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, 'component.json');
        const exists = fs.pathExistsSync(packComponentJsonPath);
        assert.ok(exists, packComponentJsonPath);
      });
      if (scriptsFolder === 'ts') {
        it(`should have ${appName}/web/js/jet-composites/${pack}/${vcomponent}/component.json`, () => {
          const appDir = util.getAppDir(appName);
          const componentJsonPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, vcomponent, 'component.json');
          const exists = fs.pathExistsSync(componentJsonPath);
          assert.ok(exists, componentJsonPath);
        });
        it(`should have ${appName}/web/js/jet-composites/${pack}/types/${vcomponent}`, () => {
          const appDir = util.getAppDir(appName);
          const typesDirPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, 'types', vcomponent);
          const exists = fs.pathExistsSync(typesDirPath);
          assert.ok(exists, typesDirPath);
        });
        if (pack === PACK_NAME) {
          it('should have matching pack and vComponent versions (in component.json)', () => {
            const appDir = util.getAppDir(appName);
            const packComponentJsonPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, 'component.json');
            const componentJsonPath = path.join(appDir, 'web', 'js', 'jet-composites', pack, vcomponent, 'component.json');
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
      it(`should be built in ${appName}/web/js/jet-composites/${pack} when unversioned is set to false in oraclejetconfig file`, async() => {
        const appDir = util.getAppDir(appName);
        const { pathToApp } = util.getAppPathData(appName, scriptsFolder);
        const builtVersionedPackPath = path.join(pathToApp, 'web', 'js', 'jet-composites', pack);
        let oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
        // Modify the oraclejetconfig json:
        oracleJetConfigJson.unversioned = false;
        // Re-write the json:
        fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
        await util.execCmd(`${util.OJET_APP_COMMAND} build component ${pack}`, {
          cwd: appDir
        }, true, true);
        assert.ok(fs.existsSync(builtVersionedPackPath), `${pack} has an unversioned path in the staging folder`);
      });
      it(`should be built in ${appName}/web/js/jet-composites/${pack} when unversioned is set to true in oraclejetconfig file`, async() => {
        const appDir = util.getAppDir(appName);
        const { pathToApp } = util.getAppPathData(appName, scriptsFolder);
        const builtUnversionedPackPath = path.join(pathToApp, 'web', 'js', 'jet-composites', pack);
        let oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
        // Modify the oraclejetconfig json:
        oracleJetConfigJson.unversioned = true;
        // Re-write the json:
        fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
        await util.execCmd(`${util.OJET_APP_COMMAND} build component ${pack}`, {
          cwd: appDir
        }, true, true);
        assert.ok(fs.existsSync(builtUnversionedPackPath), `${pack} has a versioned path in the staging folder`);
      });
    })
  };

  
function _vcomponentApiDocumentationPackTest({
    appName,
    scriptsFolder,
    pack,
    component
  }) {
    if (scriptsFolder === 'ts') {
      if (!util.noScaffold()) {
        _beforePackTest({
          task: 'create',
          app: appName,
          pack,
          scriptsFolder
        });
        _beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          scriptsFolder,
          flags: '--vcomponent'
        });
      }
      describe('check that api documentation are generated successfully', () => {
        const appDir = util.getAppDir(appName);
        it('should have generated api docs in web after building the component', async () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          await util.execCmd(`${util.OJET_APP_COMMAND} build pack ${pack}`, {
            cwd: appDir
          }, true);
          const pathToComponentDocsInWeb = path.join(pathToBuiltComponents, pack, 'docs');
          const hasDocsIndexFile = fs.pathExistsSync(path.join(pathToComponentDocsInWeb, 'index.html'));
          const hasComponentHtmlFile = fs.pathExistsSync(path.join(pathToComponentDocsInWeb, `${component}.html`));
          const hasDocsJsonFile = fs.pathExistsSync(path.join(pathToComponentDocsInWeb, 'jsDocMd.json'));
          assert.ok(hasDocsIndexFile, "Does not have index.html in docs folder.");
          assert.ok(hasComponentHtmlFile, `Does not have ${component}.html in docs folder.`);
          assert.ok(hasDocsJsonFile, "Does not have jsDocMd.json in docs folder.");
        });
      })
    }
  };

function _doNotOverWriteOjCPathMappingTest({
    appName,
    scriptsFolder,
    buildType
  }) {
      describe('check that oj-c path in main.js is not overwritten', () => {
        it('should not overwrite paths in main.js if component exists both in node_modules and jet_components', async () => {
          const appDir = util.getAppDir(appName);
          const {
            pathToExchangeComponents
          } = util.getAppPathData(appName, scriptsFolder);
          await util.execCmd(`${util.OJET_APP_COMMAND} add component oj-c`, { cwd: appDir }, true, true);
          const pathToOjCInJetComponents = path.join(pathToExchangeComponents, 'oj-c');
          const result = buildType === 'release' ? await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true) : 
            await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(appName) }, true);
          fs.removeSync(pathToOjCInJetComponents);
          assert.ok(/Either use 'oj-c' from exchange or node_modules/.test(result.stdout), result.stdout);
          assert.ok(!fs.existsSync(pathToOjCInJetComponents), 'oj-c is not deleted from the jet_components folder.')
        });
      });
    };

function _manageMappedLocalReferencePackPathTest({
    appName,
    scriptsFolder,
    pack
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
          task: 'create',
          app: appName,
          pack,
          scriptsFolder
        });
    }
     describe('check that a locally created reference component has mapped path in main.js', () => {
      it('should have mapped path in main.js for local reference component', async () => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents,
          pathToMainJs
        } = util.getAppPathData(appName, scriptsFolder);
        const mainJsReferencesPackMappedPath = await _checkRefCompPathInMainJs(pathToSourceComponents, pack, appDir, pathToMainJs);
        assert.ok(!fs.existsSync(path.join(pathToSourceComponents, pack)), `${pack} not deleted successfully.`)
        assert.ok(mainJsReferencesPackMappedPath, 'Local reference pack not mapped in main.js.');

      })
     });
  };

// function _doNotOverWriteOjCPathMappingTest({
//     appName,
//     scriptsFolder,
//     buildType
//   }) {
//       describe('check that oj-c path in main.js is not overwritten', () => {
//         it('should not overwrite paths in main.js if component exists both in node_modules and jet_components', async () => {
//           const appDir = util.getAppDir(appName);
//           const {
//             pathToExchangeComponents
//           } = util.getAppPathData(appName, scriptsFolder);
//           await util.execCmd(`${util.OJET_APP_COMMAND} add component oj-c`, { cwd: appDir }, true, true);
//           const pathToOjCInJetComponents = path.join(pathToExchangeComponents, 'oj-c');
//           const result = buildType === 'release' ? await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true) : 
//             await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(appName) }, true);
//           fs.removeSync(pathToOjCInJetComponents);
//           assert.ok(/Either use 'oj-c' from exchange or node_modules/.test(result.stdout), result.stdout);
//           assert.ok(!fs.existsSync(pathToOjCInJetComponents), 'oj-c is not deleted from the jet_components folder.')
//         });
//       });
//     };

function _manageMappedLocalReferencePackPathTest({
    appName,
    scriptsFolder,
    pack
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
        task: 'create',
        app: appName,
        pack,
        scriptsFolder
      });
    }
    describe('check that a locally created reference component has mapped path in main.js', () => {
      it('should have mapped path in main.js for local reference component', async () => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents,
          pathToMainJs
        } = util.getAppPathData(appName, scriptsFolder);
        const mainJsReferencesPackMappedPath = await _checkRefCompPathInMainJs(pathToSourceComponents, pack, appDir, pathToMainJs);
        assert.ok(!fs.existsSync(path.join(pathToSourceComponents, pack)), `${pack} not deleted successfully.`)
        assert.ok(mainJsReferencesPackMappedPath, 'Local reference pack not mapped in main.js.');
      })
    });
  };

function _ojetRestoreCommandTest({ appName, scriptsFolder }) {
    describe('check that ojet restore --exchange-only restores exchange components without running npm install', () => {
      it('should have node_modules folder and exchange components before running ojet strip command', async () => {
        const {
          pathToExchangeComponents,
          pathToNodeModules
        } = util.getAppPathData(appName, scriptsFolder);
        assert.ok(fs.existsSync(pathToExchangeComponents), 'Exchange components do not exist in the project.');
        assert.ok(fs.existsSync(pathToNodeModules), 'node_modules do not exist in the project.');
      })
      it('should not have node_modules folder and exchange components after running ojet strip command', async () => {
        const appDir = util.getAppDir(appName);
        await util.execCmd(`${util.OJET_APP_COMMAND} strip`, { cwd: appDir }, true);
        const {
          pathToExchangeComponents,
          pathToNodeModules
        } = util.getAppPathData(appName, scriptsFolder);
        assert.ok(!fs.existsSync(pathToExchangeComponents), 'Exchange components exist in the project.');
        assert.ok(!fs.existsSync(pathToNodeModules), 'node_modules folder exist in the project.');
      })
      it('should restore exchange components but not running npm install after running ojet restore --exchange-only', async () => {
        const appDir = util.getAppDir(appName);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} restore --exchange-only`, { cwd: appDir }, true);
        assert.ok(/Skipping 'npm install'./.test(result.stdout), result.stdout);
        assert.ok(/Success: Restore complete/.test(result.stdout), result.stdout);
      })
    });
  };

function _packagePackHookTest({
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
  };

function _getBundleJsContent({
    appName
  }) {
    const {
      pathToBundleJs
    } = util.getAppPathData(appName);
    const bundleContent = fs.readFileSync(pathToBundleJs);
    return bundleContent;
  };

    //
    // Return a bundle property object.
    //
    function _getBundleJsBundlesObject({
        appName
      }) {
        const bundleContent = _getBundleJsContent({
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
      };
  
function _packagePackTest({
    appName,
    pack
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
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
  };

  function _packageMonoPackTest({
    appName,
    pack,
    component,
    scriptsFolder
  }) {
    if (scriptsFolder === 'ts') {
      if (!util.noScaffold()) {
        _beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          scriptsFolder,
          flags: '--vcomponent'
        });
        _beforePackTest({
          task: 'package',
          app: appName,
          pack,
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
        it(`should be not be packaged in ${appName}/dist/${pack}-${component}_1-0-0.zip`, () => {
          const packagedComponentInPackPath = util.getAppDir(path.join(
            util.getAppDir(appName),
            'dist',
            `${pack}-${component}_1-0-0.zip`,
          ));
          const exists = fs.pathExistsSync(packagedComponentInPackPath);
          assert.ok(!exists, packagedComponentInPackPath);
        });
        it(`should have docs, min, and types folder in web before packaging the mono-pack`, () => {
          const { pathToBuiltComponents } = util.getAppPathData(appName, scriptsFolder);
          const packagedComponentInPackPath = path.join(pathToBuiltComponents, pack);
          const filteredDirs = fs.readdirSync(packagedComponentInPackPath).filter((dirItem) => ['min', 'types', 'docs'].includes(dirItem));
          const hasTheDirs = _.isEqual([ 'docs', 'min', 'types' ], filteredDirs);
          assert.equal(hasTheDirs, true, 'Does not have  docs, min, and types folder in web before packaging the mono-pack');
        });
         it(`should have docs, min, and types folder in the dist folder after packaging the mono-pack`, (done) => {
          const packagedPackPath = util.getAppDir(path.join(
            util.getAppDir(appName),
            'dist',
            `${pack}_1-0-0.zip`,
          ));
          const unPackagedPackPath = util.getAppDir(path.join(
            util.getAppDir(appName),
            'dist',
            'unzipped'
          ));
          if (!fs.existsSync(unPackagedPackPath)) {
            fs.mkdirSync(unPackagedPackPath);
          }
          extract(packagedPackPath, { dir: unPackagedPackPath }, (error) => {
            if(error) {
              const errorMessage = 'Did not extract the packaged component successfully.'
              assert.equal(false, true, `${errorMessage}\n${error}`);
            } else {
              const filteredDirs = fs.readdirSync(unPackagedPackPath).filter((dirItem) => ['min', 'types', 'docs'].includes(dirItem));
              const hasTheDirs = _.isEqual([ 'docs', 'min', 'types' ], filteredDirs);
              assert.equal(hasTheDirs, true, 'Does not have  docs, min, and types folder in web before packaging the mono-pack');
            }
            done();
          });
        });
        it(`should not package intermediate files after packaging the mono-pack`, () => {
          const unPackagedPackPath = util.getAppDir(path.join(
            util.getAppDir(appName),
            'dist',
            'unzipped'
          ));
          const jsDocJsonFile = component.toLowerCase()
            .split('-')
            .map(componentName => componentName.charAt(0).toUpperCase() + componentName.slice(1))
            .join('')
            .concat('.json');
          const pathToJsonFiles = path.join(unPackagedPackPath, 'docs', jsDocJsonFile);
          const hasIntermediateFiles = fs.existsSync(pathToJsonFiles);
          fs.removeSync(unPackagedPackPath);
          assert.equal(!hasIntermediateFiles, true, 'Did not filter the intermediate files successfully');
          assert.equal(!fs.existsSync(unPackagedPackPath), true, 'Did not delete the unzipped folder successfully');
        });
      });
    }
  };

  function _buildMonoPackTest({
    appName,
    pack,
    component,
    scriptsFolder,
    release
  }) {
    if (scriptsFolder === 'ts') {
      describe('check built mono-pack', () => {
        const appDir = util.getAppDir(appName);
        it ('it should add an extension folder successfully', () => {
          const { pathToSourceComponents } = util.getAppPathData(appName, scriptsFolder);
          const pathToPackInSrc = path.join(pathToSourceComponents, pack);
          if (!fs.existsSync(path.join(pathToPackInSrc, 'extension'))) {
            fs.mkdirSync(path.join(pathToPackInSrc, 'extension'))
          }
          fs.writeFileSync(path.join(pathToPackInSrc, 'extension', 'extension.ts'), '// Test file.');
          assert.ok(path.join(pathToPackInSrc, 'extension'));
        });
        it ('it should not have the pack, version and jetVersion values in tsx or component.json in src', () => {
          const { pathToSourceComponents } = util.getAppPathData(appName, scriptsFolder);
          // On creating a component in a mono-pack, the pack (for vcomponents), version, and jetVersion
          // should be omitted as required by JET-55655 and JET-55654. These values are
          // later on inherited from the mono-pack metadata as implemented by JET-48251
          // and tested in the subsequent test.
          let componentTsxFileContent;
          const pathToComponentTsxFile = path.join(pathToSourceComponents, pack, component, `${component}.tsx`);
          if (fs.existsSync(pathToComponentTsxFile)) {
            componentTsxFileContent = fs.readFileSync(pathToComponentTsxFile, { encoding: 'utf-8' });
            const hasVersionAnnotation = componentTsxFileContent.includes(`@ojmetadata version`);
            const hasPackAnnotation = componentTsxFileContent.includes(`@ojmetadata pack`);
            const hasJetVersionAnnotation = componentTsxFileContent.includes(`@ojmetadata jetVersion`);
            assert.equal(!hasVersionAnnotation, true, 'Has version annotated value');
            assert.equal(!hasPackAnnotation, true, 'Has pack annotated value');
            assert.equal(!hasJetVersionAnnotation, true, 'Has jet version annotated value');
          } else {
            const pathToComponentJson = path.join(pathToSourceComponents, pack, component, 'component.json');
            const componentComponentJson = fs.readJSONSync(pathToComponentJson);
            const hasComponentVersion = componentComponentJson.hasOwnProperty('version');
            const hasJetVersion = componentComponentJson.hasOwnProperty('jetVersion');
            assert.equal(!hasComponentVersion, true, 'Has version property in component.json');
            assert.equal(!hasJetVersion, true, 'Has jet version property in component.json');
          }
        });
        it(`should have correct jetVersion and component version for components inherited from the pack`, async() => {
          const { pathToBuiltComponents } = util.getAppPathData(appName, scriptsFolder);
          const pathToComponentInPackJson = path.join(pathToBuiltComponents, pack, component, 'component.json');
          const pathToPackJsonInWeb = path.join(pathToBuiltComponents, pack, 'component.json');
          let command = `${util.OJET_APP_COMMAND} build pack ${pack}`;
          command = release ? command + '--release' : command;
          await util.execCmd(command, { cwd: appDir }, true);
          const componentJsonInWeb = fs.readJSONSync(pathToComponentInPackJson);
          const packJsonInWeb = fs.readJSONSync(pathToPackJsonInWeb);
          assert.equal(componentJsonInWeb.jetVersion, packJsonInWeb.jetVersion, 'Does not have correct jet version');
          assert.equal(componentJsonInWeb.version, packJsonInWeb.version, 'Does not have correct component version');
          assert.equal(componentJsonInWeb.pack, packJsonInWeb.name, 'Does not have correct pack name');
        });
        it ('it should not have a d.ts file under types folder', () => {
          const { pathToBuiltComponents } = util.getAppPathData(appName, scriptsFolder);
          const pathToExtensionDTsFile = path.join(pathToBuiltComponents, pack, 'types', 'extension', 'extension.d.ts');
          const pathToExtensionFile = path.join(pathToBuiltComponents, pack, 'extension', 'extension.d.ts');
          const hasDTsFileUnderTypes = !fs.existsSync(pathToExtensionFile) && fs.existsSync(pathToExtensionDTsFile);
          assert.equal(hasDTsFileUnderTypes, true, 'Does not have the d.ts file under the types folder.');
        });
        it ('it should not have a stub d.ts file under types folder', () => {
          const { pathToBuiltComponents } = util.getAppPathData(appName, scriptsFolder);
          const pathToStubDTsFile = path.join(pathToBuiltComponents, pack, 'types', `${component}.d.ts`);
          const hasNoStubFileUnderTypes = !fs.existsSync(pathToStubDTsFile);
          assert.equal(hasNoStubFileUnderTypes, true, 'Component stub d.ts file under the types folder exists.');
        });
        it ('it should not have a declaration of type any in component index.d.ts in the pack in js folder', () => {
          let hasAMatch = false;
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToIndexDTsFileInJsFolder = path.join(pathToBuiltComponents, pack, 'types', component, 'index.d.ts');

          if (fs.existsSync(pathToIndexDTsFileInJsFolder)) {
            const fileContent = fs.readFileSync(pathToIndexDTsFileInJsFolder, { encoding: 'utf-8' });
            hasAMatch = fileContent.replaceAll(/\s*:\s*/g, ': ').includes(`'${pack}-${component}': any`) ||
              fileContent.replaceAll(/\s*:\s*/g, ': ').includes(`"${pack}-${component}": any`);
            const hasNoDeclarationTypeInIndexDtsFile = fs.existsSync(pathToIndexDTsFileInJsFolder) && !hasAMatch;
            assert.equal(hasNoDeclarationTypeInIndexDtsFile, true, 'Component index d.ts file under the types folder has declaration of type any in js folder.');
          }
        });
        it ('it should not have a declaration of type any in component index.ts and stub file in the pack in ts folder', () => {
          let hasAMatchInIndexFile = false;
          let hasAMatchInStubFile = false;
          const {
            pathToApp,
            typescriptFolder,
            stagingFolder,
            componentsFolder
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToComponentsInTsFolder = path.join(pathToApp, stagingFolder, typescriptFolder, componentsFolder);
          const pathToIndexFileInTsFolder = path.join(pathToComponentsInTsFolder, pack, component, 'index.ts');
          const pathToStubFileInTsFolder = path.join(pathToComponentsInTsFolder, pack, `${component}.ts`);

          if (fs.existsSync(pathToIndexFileInTsFolder)) {
            const fileContent = fs.readFileSync(pathToIndexFileInTsFolder, { encoding: 'utf-8'});
            hasAMatchInIndexFile = fileContent.replaceAll(/\s*:\s*/g, ': ').includes(`'${pack}-${component}': any`) ||
              fileContent.replaceAll(/\s*:\s*/g, ': ').includes(`"${pack}-${component}": any`);
            const hasNoDeclarationTypeInIndexFile = fs.existsSync(pathToIndexFileInTsFolder) && !hasAMatchInIndexFile;
            assert.equal(hasNoDeclarationTypeInIndexFile, true, 'Component index.ts file under the ts folder has declaration of type any.');
          }

          if (fs.existsSync(pathToStubFileInTsFolder)) {
            const fileContent = fs.readFileSync(pathToStubFileInTsFolder, { encoding: 'utf-8'});
            hasAMatchInStubFile = fileContent.replaceAll(/\s*:\s*/g, ': ').includes(`'${pack}-${component}': any`) ||
              fileContent.replaceAll(/\s*:\s*/g, ': ').includes(`"${pack}-${component}": any`);
            const hasNoDeclarationTypeInStubFile = fs.existsSync(pathToStubFileInTsFolder) && !hasAMatchInStubFile;
            assert.equal(hasNoDeclarationTypeInStubFile, true, 'Component stub file under the ts folder has declaration of type any.');
          }
        });
      });
    }
};
    
function _buildReleaseCheckBundle({
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
          `${BUNDLE_NAME}.js`
        );
        const exists = fs.existsSync(pathToBundle);
        assert.ok(!exists, pathToBundle);
      });

      it('release build: path mapping to minified bundle', async () => {
        // The following entry should be in paths:
        // "packbundle-one":"jet-composites/packbundle-one/min"
        const bundleContent = _getBundleJsContent({
          appName
        });
        assert.equal(bundleContent.toString().match(`jet-composites/${BUNDLE_PACK_NAME}/min`),
          `jet-composites/${BUNDLE_PACK_NAME}/min`,
          `bundle.js should contain the minified bundle ${BUNDLE_PACK_NAME}`);

      });

      it('release build: bundle content (local component)', async () => {
        // Check the bundle for the local pack bundle property
        const localPackBundle = `${BUNDLE_PACK_NAME}/${BUNDLE_NAME}`;
        var hasLocalPackBundle = false;
        const bundlesPropObj = _getBundleJsBundlesObject({
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
        const bundlesPropObj = _getBundleJsBundlesObject({
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
          pack
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
  };

function _stripMetadatainMinLoaderPackTest({
    appName,
    scriptsFolder,
    component,
    pack
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
        task: 'create',
        app: appName,
        pack,
        scriptsFolder
      });
      _beforeComponentInPackTest({
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
        const pathToLocalComponentInWeb = path.join(pathToBuiltComponents, pack, component, 'component.json');
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
        } = _getStripTestVariables({
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
  };

function _packMemberExistenceTest({
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
  };

function _buildComponentPackAppTest({
    appName,
    pack,
    component,
    vcomponent,
    resourceComponent,
    vbcsPatternComponent,
    release,
    scriptsFolder
  }) {
    const testName = release ? 'Build (Release)' : 'Build';
    const buildType = release ? 'release' : 'default';
    describe(testName, () => {
      it('should create an extension directory in src', () => {
        const {
          pathToSourceComponents,
          pathToBuiltComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const pathToPackInSrc = path.join(pathToSourceComponents, pack);
        if (!fs.existsSync(path.join(pathToPackInSrc, 'extension'))) {
          fs.mkdirSync(path.join(pathToPackInSrc, 'extension'))
        }
        fs.writeFileSync(path.join(pathToPackInSrc, 'extension', 'extension.js'), '// Test file.');
        assert.ok(path.join(pathToPackInSrc, 'extension'));
      });
      if (release) {
        it(`should add resources for vbcs-pattern component type`, async () => {
          const {
            pathToSourceComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToPackInSrc = path.join(pathToSourceComponents, pack);
          const pathToPackComponentJson = path.join(pathToPackInSrc, 'component.json');

          // Create the pat-1 folder and its contents
          const pathToVbcsPattern = path.join(pathToPackInSrc, vbcsPatternComponent);
          fs.mkdirSync(pathToVbcsPattern);
          const pathToHtmlTemplate = path.join(pathToVbcsPattern, 'html.template');
          fs.writeFileSync(pathToHtmlTemplate, '');
          const pathToTestPatternJson = path.join(pathToVbcsPattern, 'testPattern.json');
          fs.writeFileSync(pathToTestPatternJson, '{}');
          const pathToComponentJson = path.join(pathToVbcsPattern, 'component.json');
          const componentJsonContent = {"name":`${vbcsPatternComponent}`,"pack":`${pack}`,"displayName":"Collapsing Page Section","description":"Stamps out a page section with a title and collapsing content area","type":"vbcs-pattern","version":"1.0.0","jetVersion":"^16.0.0","extension":{"vbdt":{"template":{"content":{"$ref":"html.template"}},"assetDefinition":{"$ref":"testPattern.json"}}}};
          fs.writeJSONSync(pathToComponentJson, componentJsonContent, { encoding: 'utf-8', spaces: 2 });

          // Assert that the vbcs-pattern component and its contents exist
          assert.ok(fs.existsSync(pathToVbcsPattern), `${vbcsPatternComponent} folder does not exist`);
          assert.ok(fs.existsSync(pathToHtmlTemplate), 'html.template does not exist');
          assert.ok(fs.existsSync(pathToTestPatternJson), 'testPattern.json does not exist');
          assert.ok(fs.existsSync(pathToComponentJson), 'component.json does not exist');
        });
      }
      if (!util.noBuild()) {
        it(`should build ${buildType} component app`, async () => {
          const appDir = util.getAppDir(appName);
          let command = `${util.OJET_APP_COMMAND} build`;
          command = release ? `${command} --release` : command;
          const result = await util.execCmd(command, {
            cwd: appDir
          }, false, true);
          assert.equal(util.buildSuccess(result.stdout), true, result.error);
        });
      }
      const componentsDir = path.join(util.getAppDir(appName), 'web', 'js', 'jet-composites');
      const packDir = path.join(componentsDir, pack);
      const packMinDir = path.join(packDir, 'min');
      // Test for debug pack and pack components which should always be present
      it('should have pack(s) directory', () => {
        assert.ok(fs.existsSync(packDir));
      })
      it('should have extension folder in the pack folder in staging', () => {
        const {
          pathToSourceComponents,
          pathToBuiltComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const pathToPackInWeb = path.join(pathToBuiltComponents, pack);

        assert.ok(fs.existsSync(path.join(pathToPackInWeb, 'extension')));
      })
      it('should delete the extension folder in the pack folder in src', () => {
        const {
          pathToSourceComponents,
          pathToBuiltComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const pathToPackInSrc = path.join(pathToSourceComponents, pack);

        fs.removeSync(path.join(pathToPackInSrc, 'extension'));
        assert.ok(!fs.existsSync(path.join(pathToPackInSrc, 'extension')));
      })
      _packMemberExistenceTest({
        packDir,
        component
      });
      _packMemberExistenceTest({
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
        it('should have extension folder in the pack folder in staging (--release)', () => {
          const {
            pathToSourceComponents,
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToPackInWeb = path.join(pathToBuiltComponents, pack);
          assert.ok(fs.existsSync(path.join(pathToPackInWeb, 'extension')));
        });
        
        it(`should have html.template, component.json, and testPattern.json in the min folder under the pack folder in staging`, async () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToPackInStaging = path.join(pathToBuiltComponents, pack, 'min');
          const pathToHtmlTemplateInStaging = path.join(pathToPackInStaging, vbcsPatternComponent, 'html.template');
          const pathToComponentJsonInStaging = path.join(pathToPackInStaging, vbcsPatternComponent, 'component.json');
          const pathToTestPatternJsonInStaging = path.join(pathToPackInStaging, vbcsPatternComponent, 'testPattern.json');

          assert.ok(fs.existsSync(pathToHtmlTemplateInStaging), 'html.template does not exist in staging');
          assert.ok(fs.existsSync(pathToComponentJsonInStaging), 'component.json does not exist in staging');
          assert.ok(fs.existsSync(pathToTestPatternJsonInStaging), 'testPattern.json does not exist in staging');
        });
        _packMemberExistenceTest({
          packDir: packMinDir,
          component,
          release: true
        });
        _packMemberExistenceTest({
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
        _packMemberExistenceTest({
          packDir,
          component: vcomponent
        });
        if (release) {
          _packMemberExistenceTest({
            packDir: packMinDir,
            component: vcomponent,
            release: true
          });
        }
        it('should have pack(s) with /types directory', () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName)
          const typesDir = path.join(pathToBuiltComponents, pack, 'types', vcomponent);
          const exists = fs.pathExistsSync(typesDir);
          assert.ok(exists, typesDir);
        });
        it('should not have vcomponent(s) in pack with /types directory', () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName)
          const typesDir = path.join(pathToBuiltComponents, pack, vcomponent, 'types');
          const exists = fs.pathExistsSync(typesDir);
          assert.ok(!exists, typesDir);
        });
      }
    });
  };

function _addPackTest({
    appName,
    scriptsFolder,
    pack,
    version
  }) {
    if (!util.noScaffold()) {
      _beforePackTest({
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
        it(`should have reference components paths in tsconfig.compilerOptions.paths`, () => {
          const {
            pathToExchangeComponents
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToTsconfig = util.getAppDir(path.join(
            util.getAppDir(appName),
            'tsconfig.json'
          ));
          const tsconfigJson = fs.readJsonSync(pathToTsconfig);
          const exchangeComponents = fs.readdirSync(pathToExchangeComponents);
          let refComponentObjectList = [];
          exchangeComponents.forEach((exchangeComponent) => {
            const pathToComponentJson = path.join(pathToExchangeComponents, exchangeComponent, 'component.json');
            const componentJson = fs.existsSync(pathToComponentJson) ? fs.readJSONSync(pathToComponentJson) : {};
            if (componentJson.type === 'reference') {
              const pathLink = [`./node_modules/${componentJson.package}${SLASH_STAR}`];
              const pathName = (componentJson.paths && componentJson.paths.name) ? componentJson.paths.name : componentJson.package;
              refComponentObjectList.push({
                name: `${pathName}${SLASH_STAR}`,
                link: pathLink
              });
            }
          });
          const hasExchangeRefPathInTsconfigJson = refComponentObjectList.every(refComponentObject => {
            const pathLinkInTsconfig = tsconfigJson.compilerOptions.paths[refComponentObject.name];
            return _.isEqual(pathLinkInTsconfig, refComponentObject.link);
          });
          assert.ok(hasExchangeRefPathInTsconfigJson, `tsconfig.json does not include reference components paths`);
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
  };

function _createComponentInPackFailureTest({
    appName,
    pack,
    component
  }) {
    describe('check create component in pack failure', () => {
      it('should fail with "Invalid pack name:"', async () => {
        const task = 'create';
        const result = await _execComponentInPackCommand({
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
  };

function _createResourceComponentInPackTest({
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
  };

function _createLoaderlessComponentInPackTest({
    appName,
    pack,
    scriptsFolder,
    component,
    flags
  }) {
    if (scriptsFolder === 'ts') {
      if (!util.noScaffold()) {
        _beforeComponentInPackTest({
          task: 'create',
          app: appName,
          pack,
          component,
          flags
        });
      }
      describe('check loaderless component and its resources are successfully created', () => {
        it(`should create a loaderless component in pack`, async () => {
          const errorMessage = `Loaderless component ${component} not found in ${pack}`;
          assert.ok(fs.existsSync(_getLoaderLessComponentPath(appName, scriptsFolder, pack, component)), errorMessage);
        });
        it(`should have index.ts file`, async () => {
          const indexFilePath = path.join(_getLoaderLessComponentPath(appName, scriptsFolder, pack, component), 'index.ts');
          const errorMessage = `index.ts file in the created loaderless component does not exist.`;
          assert.ok(fs.existsSync(indexFilePath), errorMessage);
        });
        it(`should not have loader.ts file`, async () => {
          const loaderFilePath = path.join(_getLoaderLessComponentPath(appName, scriptsFolder, pack, component), 'loader.ts');
          const errorMessage = `loader.ts file in the created loaderless component exists.`;
          assert.ok(!fs.existsSync(loaderFilePath), errorMessage);
        });
        it('should have a declared global namespace in index.ts', () => {
          const pathToComponent = util.getAppDir(path.join(
            util.getAppDir(appName),
            'src',
            scriptsFolder,
            'jet-composites',
            pack,
            component,
            'index.ts'
          ));
          const regex = /declare\s*global(?<namespaceContent>.*)/gms;
          const loaderContent = fs.readFileSync(pathToComponent, {
            encoding: 'utf-8'
          });
          const match = regex.exec(loaderContent);
          const hasGlobalNameSpace = loaderContent.includes(
            match
            .groups
            .namespaceContent
            .replace(/\\n/g, '')
          );
          assert.ok(hasGlobalNameSpace, 'Does not have a declared global namespace in index.ts');
        });
      });
    }
  };

function _getLoaderLessComponentPath(appName, scriptsFolder, pack, component) {
    const {
      pathToSourceComponents
    } = util.getAppPathData(appName, scriptsFolder);
    const packComponentPath = path.join(pathToSourceComponents, pack);
    return path.join(packComponentPath, component);
  };

function _manageMappedLocalReferenceComponentPathTest({
    appName,
    scriptsFolder,
    component
  }) {
    if (!util.noScaffold()) {
      _beforeComponentTest({
        task: 'create',
        app: appName,
        scriptsFolder,
        component
      });
    }
    describe('check that a locally created reference component has mapped path in main.js', () => {
      it('should have mapped path in main.js for local reference component', async () => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents,
          pathToMainJs
        } = util.getAppPathData(appName, scriptsFolder);
        const mainJsReferencesComponentMappedPath = await _checkRefCompPathInMainJs(pathToSourceComponents, component, appDir, pathToMainJs);
        assert.ok(!fs.existsSync(path.join(pathToSourceComponents, `${component}`)), `${component} not deleted successfully.`)
        assert.ok(mainJsReferencesComponentMappedPath, 'Local reference component not mapped in main.js.');

      })
    });
  };

function _vcomponentApiDocumentationComponentTest({
    appName,
    scriptsFolder,
    component
  }) {
    if (scriptsFolder === 'ts') {
      if (!util.noScaffold()) {
        _beforeComponentTest({
          task: 'create',
          app: appName,
          scriptsFolder,
          component,
          flags: '--vcomponent'
        });
      }
      describe('check that api documentation are generated successfully', () => {
        const appDir = util.getAppDir(appName);
        it('should not have apidoc_templates html files before running ojet add docgen', () => {
          const {
            sourceFolder,
            pathToApp
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToApiDocTemplate = path.join(pathToApp, sourceFolder, 'apidoc_templates');
          assert.ok(!fs.existsSync(pathToApiDocTemplate), 'apidoc_templates folder exists in source folder.');
        });
        it('should add jsdoc successfully', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} add docgen`, {
            cwd: appDir
          }, true);
          assert.ok(/Success: API docgen setup finished./.test(result.stdout), result.stdout);
        });
        it('should have apidoc_templates html files after running ojet add docgen', () => {
          const {
            sourceFolder,
            pathToApp
          } = util.getAppPathData(appName, scriptsFolder);
          const pathToApiDocTemplate = path.join(pathToApp, sourceFolder, 'apidoc_templates');
          assert.ok(fs.existsSync(pathToApiDocTemplate), 'apidoc_templates folder does not exist in source folder.');
        });
        it('should have enableDocGen property is set to true in oraclejetconfig.json file after running ojet add docgen', () => {
          const { pathToApp } = util.getAppPathData(appName, scriptsFolder);
          const { enableDocGen } = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
          assert.equal(enableDocGen, true, 'enableDocGen property is not set to true in oraclejetconfig.json even after running ojet add docgen');
        });
        it('should have generated api docs in web after building the component', async () => {
          const {
            pathToBuiltComponents
          } = util.getAppPathData(appName, scriptsFolder);
          await util.execCmd(`${util.OJET_APP_COMMAND} build component ${component}`, {
            cwd: appDir
          }, true);
          const apiDocMetadataFile = path.join(pathToBuiltComponents, component, `${util.toCamelCase(component)}.json`);
          const pathToComponentDocsInWeb = path.join(pathToBuiltComponents, component, 'docs');
          
          const hasApiDocMetadata = fs.pathExistsSync(apiDocMetadataFile);
          const hasDocsIndexFile = fs.pathExistsSync(path.join(pathToComponentDocsInWeb, 'index.html'));
          const hasComponentHtmlFile = fs.pathExistsSync(path.join(pathToComponentDocsInWeb, `${component}.html`));
          const hasDocsJsonFile = fs.pathExistsSync(path.join(pathToComponentDocsInWeb, 'jsDocMd.json'));

          assert.ok(hasApiDocMetadata, `Does not have ${apiDocMetadataFile}`);
          assert.ok(hasDocsIndexFile, "Does not have index.html in docs folder.");
          assert.ok(hasComponentHtmlFile, `Does not have ${component}.html in docs folder.`);
          assert.ok(hasDocsJsonFile, "Does not have jsDocMd.json in docs folder.");
        });
      })
    }
  };


function _stripMetadatainMinLoaderComponentTest({
    appName,
    scriptsFolder,
    component
  }) {
    // The STRIP_TEST_COMPONENT_JSON will be merged with those in component.json in case it is not present.
    // We need it to ensure that all needed attributes at run-time are present. Here, we have
    // added some attributes that are not needed at RT to ensure that stripping is done correctly. 
    if (!util.noScaffold()) {
      _beforeComponentTest({
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
        const pathToLocalComponentInWeb = path.join(pathToBuiltComponents, component, 'component.json');
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
        } = _getStripTestVariables({
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
  };

function _preferLocalOverExchangeComponentTest({
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
        const pathToLocalComponentInWeb = path.join(pathToBuiltComponents, component);
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
  };

function _omitComponentVersionTest({
    appName,
    option
  }) {
    describe(`Build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, () => {
      const components = [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, COMPONENT_NAME_DEMO, VCOMPONENT_NAME, EXCHANGE_COMPONENT_PACK];
      if (!util.noBuild()) {
        it(`should build ${appName} with --${util.OMIT_COMPONENT_VERSION_FLAG}`, async () => {
          const {
          pathToApp
        } = util.getAppPathData(appName);
          let oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
            // Modify the oraclejetconfig json:
            oracleJetConfigJson.unversioned = undefined;
            // Re-write the json:
            fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
          const command = `${util.OJET_APP_COMMAND} build --${util.OMIT_COMPONENT_VERSION_FLAG}`;
          const result = await util.execCmd(command, {
            cwd: util.getAppDir(appName)
          }, true, false);
           oracleJetConfigJson.unversioned = false;
            // Re-write the json:
            fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
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
           const {
          pathToApp
        } = util.getAppPathData(appName);
          let oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
            // Modify the oraclejetconfig json:
            oracleJetConfigJson.unversioned = undefined;
            // Re-write the json:
            fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
          const command = `${util.OJET_APP_COMMAND} build --${util.OMIT_COMPONENT_VERSION_FLAG} --release=true`;
          const result = await util.execCmd(command, {
            cwd: util.getAppDir(appName)
          }, true, false);
          oracleJetConfigJson.unversioned = true;
            // Re-write the json:
            fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
          assert.ok(util.buildSuccess(result.stdout), result.error);
        });
      }
    });
  };

function _customComponentResourceBundleTest({
    appName,
    scriptsFolder,
    component
  }) {
    if (!util.noScaffold()) {
      _beforeComponentTest({
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
      it('should build successfully and have appropriate asserts in the resources folder', async () => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents,
          pathToBuiltComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {
          cwd: appDir
        }, true);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
        // Retrieve the nls, root, and string file paths:
        const pathToNlsFolder = path.join(pathToBuiltComponents, component, 'resources', 'nls');
        const pathToRootFolder = path.join(pathToNlsFolder, 'root');
        const pathToStringFile = path.join(pathToNlsFolder, `${component}-strings.js`);
        // Ensure that the needed info exist in the appropriate files:
        const stringFileContent = fs.readFileSync(pathToStringFile, {
          encoding: "utf-8"
        });
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
  };

function _buildReleaseExchangeComponentTest({
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
  };

// Run the build, then verify that components have been properly built.
// Note that we verify multiple components - component is an array of components.
function _buildComponentAppTest({
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
            const componentLoader = path.join(componentsDir, individualComponent, 'loader.js');
            const componentMinDir = path.join(componentsDir, individualComponent, 'min');
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
                const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', individualComponent, 'types');
                const exists = fs.pathExistsSync(typesDir);
                assert.ok(exists, typesDir);
              });
            }
          });
        })
      };

function _beforeComponentInPackTest({
    task,
    app,
    pack,
    component,
    flags = '',
    componentJson,
    scriptsFolder
  }) {
    before(async () => {
      await _execComponentInPackCommand({
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
  };

function _execComponentInPackCommand({
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

  function _beforePackTest({
    task,
    app,
    pack,
    version,
    componentJson,
    scriptsFolder,
    flags = ''
  }) {
    before(async () => {
      await _execPackCommand({
        task,
        app,
        pack,
        version,
        flags
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
  };

function _execPackCommand({
    task,
    app,
    pack,
    version,
    flags = ''
  }) {
    return util.execCmd(
      `${util.OJET_APP_COMMAND} ${task} pack ${pack}${version ? `@${version}` : ''} ${flags}`, {
        cwd: util.getAppDir(app)
      },
      false,
      true
    );
  };

async function _checkRefCompPathInMainJs(pathToSourceComponents, component, appDir, pathToMainJs) {
    const pathToComponentJSON = path.join(pathToSourceComponents, `${component}`, 'component.json');
    const componentJson = fs.readJSONSync(pathToComponentJSON);
    componentJson.type = 'reference';
    componentJson.paths = {
      name: 'test-path-name',
      npm: {
        debug: 'test-path-name-debug',
        min: 'test-path-name-min'
      }
    };
    fs.writeJSONSync(pathToComponentJSON, componentJson);
    await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: appDir }, true);
    const mainJsContent = fs.readFileSync(pathToMainJs, { encoding: 'utf-8' });
    const mappedPathName = componentJson.paths.name;
    const hasRefCompPath = mainJsContent.includes(`"${mappedPathName}":"libs/test-path-name/test-path-name-debug"`);
    fs.removeSync(path.join(pathToSourceComponents, `${component}`));
    return hasRefCompPath;
  };

// Returns the variables to used to run the test checks:
function _getStripTestVariables ({
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
};

function _addComponentTestFilesTest({
    appName,
    component,
    scriptsFolder
  }) {
    describe('check that component test files are added only after running the ojet add testing command', () => {
      it('should create component without adding test file templates', async () => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents
        } = util.getAppPathData(appName, scriptsFolder);
        // create the component and pack to package:
        await util.execCmd(`${util.OJET_APP_COMMAND} create component ${component}`, {
          cwd: appDir
        }, true, true);
        const pathToComponentTestFiles = path.join(pathToSourceComponents, component, '__tests__');
        const errorMessage = 'Component has test files before adding the test librabries.'
        const hasPathToComponentTestFiles = fs.existsSync(pathToComponentTestFiles);
        assert.ok(!hasPathToComponentTestFiles, errorMessage);
      });
      it(`should create component with test file templates after running the test libraries`, async() => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents
        } = util.getAppPathData(appName, scriptsFolder);
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, {
          cwd: appDir
        }, true, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create component ${component}-one`, {
          cwd: appDir
        }, true, true);
        const pathToComponentTestFiles = path.join(pathToSourceComponents, `${component}-one`, '__tests__');
        const hasKnockoutSpecFile = fs.pathExistsSync(path.join(pathToComponentTestFiles, `${component}-one-knockout.spec.ts`));
        const hasUiSpecFile = fs.pathExistsSync(path.join(pathToComponentTestFiles, `${component}-one-ui.spec.ts`));
        const hasViewModelSpecFile = fs.pathExistsSync(path.join(pathToComponentTestFiles, `${component}-one-viewmodel.spec.ts`));
        assert.ok(/Success: add testing complete/.test(result.stdout), result.stdout);
        assert.ok(hasKnockoutSpecFile, `Has no ${component}-one-knockout.spec.ts`);
        assert.ok(hasUiSpecFile, `${component}-one-ui.spec.ts` );
        assert.ok(hasViewModelSpecFile, `${component}-one-viewmodel.spec.ts`);
      });
      it(`should create component without test file templates after running the test libraries without defined mocha and jest libraries in oraclejetconfig.json`, async() => {
        const appDir = util.getAppDir(appName);
        const {
          pathToSourceComponents,
          pathToApp
        } = util.getAppPathData(appName, scriptsFolder);
        // Modify the oraclejetconfig.json:
        const oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
        const mochaTestingLibraries = oracleJetConfigJson.mochaTestingLibraries;
        const jestTestingLibraries = oracleJetConfigJson.jestTestingLibraries;
        // Delete the mocha and jest libraries property in json file:
        if (mochaTestingLibraries && jestTestingLibraries) {
          delete oracleJetConfigJson.mochaTestingLibraries;
          delete oracleJetConfigJson.jestTestingLibraries;
          // Re-write the json:
          fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson);
        }
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} create component ${component}-2`, {
          cwd: appDir
        }, true, true);
        // Restore the properties in the json file:
        oracleJetConfigJson.mochaTestingLibraries = mochaTestingLibraries;
        oracleJetConfigJson.jestTestingLibraries = jestTestingLibraries;
        fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson);
        // Retrieve the path to test files if they were added:
        const pathToComponentTestFiles = path.join(pathToSourceComponents, `${component}-2`, '__tests__');
        const hasKnockoutSpecFile = fs.pathExistsSync(path.join(pathToComponentTestFiles, `${component}-2-knockout.spec.ts`));
        const hasUiSpecFile = fs.pathExistsSync(path.join(pathToComponentTestFiles, `${component}-2-ui.spec.ts`));
        const hasViewModelSpecFile = fs.pathExistsSync(path.join(pathToComponentTestFiles, `${component}-2-viewmodel.spec.ts`));
        const regex = new RegExp(`Add component '${component}-2' finished`);
        // Check the tests
        assert.ok(regex.test(result.stdout), result.stdout);
        assert.ok(!hasKnockoutSpecFile, `Has ${component}-2-knockout.spec.ts`);
        assert.ok(!hasUiSpecFile, `${component}-2-ui.spec.ts` );
        assert.ok(!hasViewModelSpecFile, `${component}-2-viewmodel.spec.ts`);
      });
    });
  };

function _addComponentTest({
    appName,
    scriptsFolder,
    component
  }) {
    if (!util.noScaffold()) {
      _beforeComponentTest({
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
  };


function _createComponentTypeLoaderlessTest({
    appName,
    component
  }) {
    describe('check loaderless component create failure', () => {
      it(`should fail to create singleton loaderless vcomponent without a pack`, async () => {
        const result = await _execComponentCommand({
          task: 'create',
          app: appName,
          component,
          flags: '--vcomponent --withLoader=false'
        });
        assert.ok(/Cannot create a loaderless component without a pack./.test(result.stdout), result.stdout);
      });
      it(`should fail to create singleton CCA loaderless component with or without a pack`, async () => {
        const result = await _execComponentCommand({
          task: 'create',
          app: appName,
          component,
          flags: '--withLoader=false'
        });
        assert.ok(/Cannot create a loaderless CCA component./.test(result.stdout), result.stdout);
      });
    });
  }; 


function _createComponentFailureTest({
    appName,
    component,
    flags
  }) {
    describe('check component create failure', () => {
      it('should fail with "Invalid component name:"', async () => {
        const task = 'create';
        const result = await _execComponentCommand({
          task,
          app: appName,
          component,
          flags
        });
        assert.ok(util[`${task}ComponentFailure`]({
          component,
          stdout: result.stdout
        }), result.error);
      })
    })
  };


// 
// Create a component with type:demo.
// 
function _createComponentTypeDemoTest({
    appName,
    scriptsFolder,
    component,
    componentJson
    }) {
    if (!util.noScaffold()) {
        _beforeComponentTest({
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
    };
  

// Creates a composite component.
// Approach: create a component, then edit the component.json to insert
// 'type': 'composite'.
//
// Also we add a dependency on the exchange component.
// In a subsequent (release build) test, this will verify the dependency on a pack component.
//
function _createComponentTypeCompositeTest({
    appName,
    scriptsFolder,
    component,
    componentJson
    }) {
    if (!util.noScaffold()) {
        _beforeComponentTest({
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

function _createComponentTest ({
    appName,
    scriptsFolder,
    component
  }) {
    if (!util.noScaffold()) {
      _beforeComponentTest({
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
  };

function _execComponentCommand({
    task,
    app,
    component,
    flags = ''
  }) {
    return util.execCmd(`${util.OJET_APP_COMMAND} ${task} component ${component} ${flags}`, {
      cwd: util.getAppDir(app)
    }, true, true);
  };

  function _beforeComponentTest({
    task,
    app,
    component,
    flags,
    componentJson,
    scriptsFolder
    }) {
        before(async () => {
        await _execComponentCommand({
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
    };


module.exports = {
    EXCHANGE_COMPONENT_PACK: EXCHANGE_COMPONENT_PACK,
    EXCHANGE_COMPONENT_PACK_MEMBER: EXCHANGE_COMPONENT_PACK_MEMBER,
    COMPONENT_NAME: COMPONENT_NAME,
    DEFAULT_COMPONENT_VERSION: DEFAULT_COMPONENT_VERSION,
    LOADERLESS_COMPONENT_NAME: LOADERLESS_COMPONENT_NAME,
    // Component with type:demo
    COMPONENT_NAME_DEMO: COMPONENT_NAME_DEMO,
    VCOMPONENT_NAME: VCOMPONENT_NAME,
    SLASH_STAR: SLASH_STAR,
    DEFAULT_PACK_VERSION: DEFAULT_PACK_VERSION,
    
    // Component with type:composite
    COMPONENT_NAME_COMPOSITE: COMPONENT_NAME_COMPOSITE,

    COMPOSITE_COMPONENT_OPTIMIZED_FOLDER: COMPOSITE_COMPONENT_OPTIMIZED_FOLDER,
    COMPOSITE_COMPONENT_OPTIMIZED_FILE: COMPOSITE_COMPONENT_OPTIMIZED_FILE,
    
    // This value is set initially but later updated
    // the specific (and possibly more accurate) version
    // that was downloaded in add component:
    EXCHANGE_COMPONENT_VERSION: EXCHANGE_COMPONENT_VERSION,
    EXCHANGE_COMPONENT_NAME: EXCHANGE_COMPONENT_NAME,
    EXCHANGE_PACK_BUNDLE: EXCHANGE_PACK_BUNDLE,
    STRIP_TEST_COMPONENT_JSON: STRIP_TEST_COMPONENT_JSON,
    STRIP_TEST_COMPONENT_NAME: STRIP_TEST_COMPONENT_NAME,
    BUNDLE_COMPONENT_NAME1: BUNDLE_COMPONENT_NAME1,
    BUNDLE_COMPONENT_NAME2: BUNDLE_COMPONENT_NAME2,
    BUNDLE_VCOMPONENT_NAME1: BUNDLE_VCOMPONENT_NAME1,
    BUNDLE_VCOMPONENT_NAME2: BUNDLE_VCOMPONENT_NAME2,
    RESOURCE_COMPONENT_NAME: RESOURCE_COMPONENT_NAME,
    BUNDLE_NAME: BUNDLE_NAME,
    BUNDLE_PACK_NAME: BUNDLE_PACK_NAME,

    beforeComponentTest: _beforeComponentTest,

    execComponentCommand: _execComponentCommand,
    createVComponentInPackTest: _createVComponentInPackTest,
    
    setupOjetCreateComponent: (appConfig) => {
        describe('ojet create component', () => {
            describe('valid name', () => {
            util.runComponentTestInTestApp(appConfig, {
                test: _createComponentTest,
                component: COMPONENT_NAME
            });
            util.runComponentTestInTestApp(appConfig, {
                test: _createComponentTypeCompositeTest,
                component: COMPONENT_NAME_COMPOSITE,
                componentJson: {
                type: 'composite',
                dependencies: {
                    [EXCHANGE_COMPONENT_NAME]: EXCHANGE_COMPONENT_VERSION
                }
                }
            });
            util.runComponentTestInTestApp(appConfig, {
                test: _createComponentTypeDemoTest,
                component: COMPONENT_NAME_DEMO,
                componentJson: {
                type: 'demo'
                }
            });
            if (appConfig === util.TYPESCRIPT_COMPONENT_APP_CONFIG) {
              util.runComponentTestInTestApp(
                appConfig, {
                  test: _createVComponentTest,
                  component: VCOMPONENT_NAME
                });
              }
            });
            describe('no hyphen in name', () => {
            util.runComponentTestInTestApp(appConfig, {
                test: _createComponentFailureTest,
                component: 'comp1'
            });
            });
            describe('capital letter in name', () => {
            util.runComponentTestInTestApp(appConfig, {
                test: _createComponentFailureTest,
                component: 'Comp-one'
            });
            });
            describe('starting digit in second segment', () => {
            util.runComponentTestInTestApp(appConfig, {
                test: _createComponentFailureTest,
                component: INVALID_COMPONENT_NAME,
                flags: '--vcomponent'
            });
            });
        });
        describe('ojet create loaderless component', () => {
            util.runComponentTestInTestApp(appConfig, {
            test: _createComponentTypeLoaderlessTest,
            component: LOADERLESS_COMPONENT_NAME
            });
        });
        describe('ojet add component', () => {
            util.runComponentTestInTestApp(appConfig, {
            test: _addComponentTest,
            component: EXCHANGE_COMPONENT_NAME
            });
        });
        describe('ojet add testing', () => {
            util.runComponentTestInTestApp(appConfig, {
            test: _addComponentTestFilesTest,
            component: 'add-testing-comp'
            });
        });
    },
    
    setupOjetBuildRelease: (appConfig) => {
        describe('ojet build --release', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildComponentAppTest,
          component: [COMPONENT_NAME, COMPONENT_NAME_COMPOSITE, VCOMPONENT_NAME],
          release: true
        });
      });
      describe('ojet build --release (bundle)', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildReleaseExchangeComponentTest,
          pack: BUNDLE_TEST_EXCHANGE_COMPONENT
        });
      });
      describe('ojet build --release, custom component resource bundle test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _customComponentResourceBundleTest,
          component: 'comp-res-bundle'
        });
      });
      describe(`ojet build --${util.OMIT_COMPONENT_VERSION_FLAG}`, () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _omitComponentVersionTest
        });
      });
      describe('ojet build (component exists in both exchange and src folders)', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _preferLocalOverExchangeComponentTest,
          component: COPYING_TEST_COMPONENT_NAME
        });
      });
      describe('ojet build --release, stripped metadata in min/loader.js component test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _stripMetadatainMinLoaderComponentTest,
          component: STRIP_TEST_COMPONENT_NAME
        });
      });
      describe('ojet build --release, stripped metadata in min/loader.js component test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _vcomponentApiDocumentationComponentTest,
          component: 'api-test-vcomp'
        });
      });
      describe('ojet build, map local reference component in main.js test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _manageMappedLocalReferenceComponentPathTest,
          component: 'local-reference-component'
        });
      });
    },

    checkRefCompPathInMainJs: _checkRefCompPathInMainJs,

    packageComponentTest: ({
        appName,
        component
      }) => {
        if (!util.noScaffold()) {
          _beforeComponentTest({
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
      },
  
    packageComponentHookTest: ({
        appName,
        component,
        scriptsFolder
      }) => {
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
      },

    preferLocalOverExchangeComponentTest: _preferLocalOverExchangeComponentTest,
    stripMetadatainMinLoaderComponentTest: _stripMetadatainMinLoaderComponentTest,

    buildComponentAppTest: _buildComponentAppTest,
    buildReleaseExchangeComponentTest: _buildReleaseExchangeComponentTest,

    buildComponentTest: ({
        appName,
        component
      }) => {
        if (!util.noScaffold()) {
          _beforeComponentTest({
            task: 'build',
            app: appName,
            component
          });
        }
        describe('check built component', () => {
          it(`should be built in ${appName}/web/js/jet-composites/${component}`, () => {
            const appDir = util.getAppDir(appName);
            const builtComponentPath = path.join(appDir, 'web', 'js', 'jet-composites', component);
            const exists = fs.pathExistsSync(builtComponentPath);
            assert.ok(exists, builtComponentPath);
          });
          if (component === VCOMPONENT_NAME) {
            it(`should have a types folder in ${appName}/web/js/jet-composites/${component}/types`, () => {
              const appDir = util.getAppDir(appName);
              const typesDir = path.join(appDir, 'web', 'js', 'jet-composites', component, 'types');
              const exists = fs.pathExistsSync(typesDir);
              assert.ok(exists, typesDir);
            });
            it(`should not have an apidoc json file in ${appName}/web/js/jet-composites/${component} if doc gen flag is not set`, () => {
              const appDir = util.getAppDir(appName);
              const { enableDocGen } = fs.readJSONSync(path.join(appDir, 'oraclejetconfig.json'));
              const apiDocFile = path.join(appDir, 'web', 'js', 'jet-composites', component, `${util.toCamelCase(component)}.json`);
              const apiDocMetadataExists = fs.pathExistsSync(apiDocFile);
              let errorMessage;
              
              if (enableDocGen) {
                errorMessage = `${apiDocFile} does not exists even if enableDocGen is set to true in oraclejetconfig.json file.`
                assert.equal(apiDocMetadataExists, true, errorMessage);
              } else {
                errorMessage = `${apiDocFile} exists even if enableDocGen is set to false or it is undefined in oraclejetconfig.json file.`
                assert.equal(apiDocMetadataExists, false, errorMessage);
              }
            });
            it(`should not have api-doc files generated without running 'ojet add docgen'`, () => {
              const appDir = util.getAppDir(appName);
              const pathToComponentDocsInWeb = path.join(appDir, 'web', 'js', 'jet-composites', component, 'docs');
              const hasDocFilesGenerated = fs.pathExistsSync(pathToComponentDocsInWeb);
              assert.ok(!hasDocFilesGenerated, "API-doc files generated without running 'ojet add docgen'.");
            });
            it(`should have a "properties" entry in ${appName}/web/js/jet-composites/${component} indicating component.json generated by the compiler`, () => {
              const appDir = util.getAppDir(appName);
              const pathToComponentJSON = path.join(appDir, 'web', 'js', 'jet-composites', component, 'component.json');
              const componentJson = fs.readJsonSync(pathToComponentJSON);
              assert.ok(componentJson.properties, "Properties not found in component.json");
            });
          }
          it(`should be built in ${appName}/web/js/jet-composites/${component}`, () => {
            const appDir = util.getAppDir(appName);
            const builtComponentPath = path.join(appDir, 'web', 'js', 'jet-composites', component);
            const exists = fs.pathExistsSync(builtComponentPath);
            assert.ok(exists, builtComponentPath);
          });
          it(`should be built in ${appName}/web/js/jet-composites/${component} when unversioned is set to false in oraclejetconfig file`, async() => {
            const appDir = util.getAppDir(appName);
            const { pathToApp } = util.getAppPathData(appName);
            const builtVersionedComponentPath = path.join(appDir, 'web', 'js', 'jet-composites', component);
            let oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
            // Modify the oraclejetconfig json:
            oracleJetConfigJson.unversioned = false;
            // Re-write the json:
            fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
            await util.execCmd(`${util.OJET_APP_COMMAND} build component ${component}`, {
              cwd: appDir
            }, true, true);
            assert.ok(fs.existsSync(builtVersionedComponentPath), `${component} has an unversioned path in the staging folder`);
          });
          it(`should be built in ${appName}/web/js/jet-composites/${component} when unversioned is set to true in oraclejetconfig file`, async() => {
            const appDir = util.getAppDir(appName);
            const { pathToApp } = util.getAppPathData(appName);
            const builtUnversionedComponentPath = path.join(pathToApp, 'web', 'js', 'jet-composites', component);
            let oracleJetConfigJson = fs.readJSONSync(path.join(pathToApp, 'oraclejetconfig.json'));
            // Modify the oraclejetconfig json:
            oracleJetConfigJson.unversioned = true;
            // Re-write the json:
            fs.writeJSONSync(path.join(pathToApp, 'oraclejetconfig.json'), oracleJetConfigJson, { deference: true });
            await util.execCmd(`${util.OJET_APP_COMMAND} build component ${component}`, {
              cwd: appDir
            }, true, true);
            assert.ok(fs.existsSync(builtUnversionedComponentPath), `${component} has a versioned path in the staging folder`);
          });
        })
      },
    
    getStripTestVariables: _getStripTestVariables,
    manageMappedLocalReferenceComponentPathTest: _manageMappedLocalReferenceComponentPathTest,

    vcomponentApiDocumentationComponentTest: _vcomponentApiDocumentationComponentTest,
    customComponentResourceBundleTest: _customComponentResourceBundleTest,
    omitComponentVersionTest: _omitComponentVersionTest,


      execComponentInPackCommand: _execComponentInPackCommand,
      beforePackTest: _beforePackTest,
      beforeComponentInPackTest: _beforeComponentInPackTest,
      createPackTest: _createPackTest,
      createPackFailureTest: _createPackFailureTest,
      createMonoPackTest: _createMonoPackTest,
      createComponentInPackTest: _createComponentInPackTest,
      createComponentInMonoPackTest: _createComponentInMonoPackTest,
      createLoaderlessComponentInPackTest: _createLoaderlessComponentInPackTest,
      createResourceComponentInPackTest: _createResourceComponentInPackTest,
      createComponentInPackFailureTest: _createComponentInPackFailureTest,
      addPackTest: _addPackTest,
      buildComponentPackAppTest: _buildComponentPackAppTest,
      packMemberExistenceTest: _packMemberExistenceTest,
      stripMetadatainMinLoaderPackTest: _stripMetadatainMinLoaderPackTest,
      buildReleaseCheckBundle: _buildReleaseCheckBundle,
      packagePackTest: _packagePackTest,
      packageMonoPackTest: _packageMonoPackTest,
      buildMonoPackTest: _buildMonoPackTest,
      packagePackHookTest: _packagePackHookTest,
      buildPackTest: _buildPackTest,    
    vcomponentApiDocumentationPackTest: _vcomponentApiDocumentationPackTest,
    // doNotOverWriteOjCPathMappingTest: _doNotOverWriteOjCPathMappingTest,
    manageMappedLocalReferencePackPathTest: _manageMappedLocalReferencePackPathTest,
    doNotOverWriteOjCPathMappingTest: _doNotOverWriteOjCPathMappingTest,
    manageMappedLocalReferencePackPathTest: _manageMappedLocalReferencePackPathTest,
    ojetRestoreCommandTest: _ojetRestoreCommandTest,

    setupOjectCreatePackTests: (appConfig) => {
      describe('ojet create pack', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createPackTest,
          pack: PACK_NAME
        });
      });
      describe('ojet create pack (failure)', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createPackFailureTest,
          pack: INVALID_PACK_NAME
        });
      });
      describe('ojet create pack', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createMonoPackTest,
          pack: MONO_PACK_NAME,
          flags: '--type=mono-pack'
        });
      });
      describe('ojet create component --pack', () => {
        describe('valid pack name', () => {
          util.runComponentTestInTestApp(appConfig, {
            test: _createComponentInPackTest,
            pack: PACK_NAME,
            component: COMPONENT_NAME
          });
          util.runComponentTestInTestApp(appConfig, {
            test: _createComponentInMonoPackTest,
            pack: MONO_PACK_NAME,
            component: COMPONENT_NAME,
            flags: '--type=resource'
          });
        })
        describe('invalid pack name', () => {
          util.runComponentTestInTestApp(appConfig, {
            test: _createComponentInPackFailureTest,
            pack: 'pack-2',
            component: COMPONENT_NAME
          });
        })
      });
      describe('create loaderless component in pack', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createLoaderlessComponentInPackTest,
          pack: PACK_NAME,
          component: LOADERLESS_COMPONENT_NAME,
          flags: '--vcomponent --withLoader=false'
        });
      });
      describe('create loaderless component in a mono-pack without the withLoader flag', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createLoaderlessComponentInPackTest,
          pack: MONO_PACK_NAME,
          component: LOADERLESS_COMPONENT_NAME,
          flags: '--vcomponent'
        });
      });
  
    if (appConfig === util.TYPESCRIPT_COMPONENT_APP_CONFIG) {
        //
        // Create  a 'stripped down vcomponent',
        // where the pack's vcomponent has a missing version etc.
        //
        describe('ojet create component --vcomponent --pack', () => {
            util.runComponentTestInTestApp(
            appConfig, {
                test: _createVComponentInPackTest,
                pack: PACK_NAME,
                component: VCOMPONENT_NAME
            }
            );
        });
    }

      describe('create resource component', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createResourceComponentInPackTest,
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
        util.runComponentTestInTestApp(appConfig, {
          test: _addPackTest,
          pack: EXCHANGE_PACK,
          version: EXCHANGE_PACK_VERSION
        });
      });
  
      describe('ojet package pack', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _packagePackTest,
          pack: PACK_NAME
        });
      });
  
      describe('ojet package pack (hook test)', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _packagePackHookTest,
          component: 'package-hooks-component',
          pack: 'package-hooks-pack'
        });
      });
  
      describe('ojet build mono-pack, vcomponent test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildMonoPackTest,
          pack: MONO_PACK_NAME,
          component: LOADERLESS_COMPONENT_NAME,
          release: false
        });
      });
  
      describe('ojet build mono-pack (release), vcomponent test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildMonoPackTest,
          pack: MONO_PACK_NAME,
          component: LOADERLESS_COMPONENT_NAME,
          release: true
        });
      });
  
      describe('ojet build mono-pack, cca test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildMonoPackTest,
          pack: MONO_PACK_NAME,
          component: COMPONENT_NAME,
          release: false
        });
      });
  
      describe('ojet build mono-pack (release), cca test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildMonoPackTest,
          pack: MONO_PACK_NAME,
          component: COMPONENT_NAME,
          release: true
        });
      });
      describe('ojet package mono-pack', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _packageMonoPackTest,
          pack: MONO_PACK_NAME,
          component: 'package-comp-in-mono-pack',
          flags: '--type=mono-pack'
        });
      });
  
      describe('ojet build', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildComponentPackAppTest,
          pack: PACK_NAME,
          component: COMPONENT_NAME,
          vcomponent: VCOMPONENT_NAME,
          resourceComponent: RESOURCE_COMPONENT_NAME,
          release: false
        });
      });
  
      describe('ojet build --release', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildComponentPackAppTest,
          pack: PACK_NAME,
          component: COMPONENT_NAME,
          vcomponent: VCOMPONENT_NAME,
          resourceComponent: RESOURCE_COMPONENT_NAME,
          vbcsPatternComponent: VBCS_PATTERN_COMPONENT_NAME,
          release: true
        });
      });

      if (appConfig === util.TYPESCRIPT_COMPONENT_APP_CONFIG) {
        // Verify the 'stripped down vcomponent' created in createVComponentInPackTest.
        describe('ojet build pack <pack>', () => {
          util.runComponentTestInTestApp(
            appConfig, {
              test: _buildPackTest,
              pack: PACK_NAME,
              vcomponent: VCOMPONENT_NAME
            }
          );
        });      
      }
    },
    ojetCreatePackBundleTest: (appConfig) => {
        describe('ojet create pack (bundle) ', () => {
            util.runComponentTestInTestApp(appConfig, {
              test: _createPackTest,
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
              util.runComponentTestInTestApp(appConfig, {
                test: _createComponentInPackTest,
                pack: BUNDLE_PACK_NAME,
                component: BUNDLE_COMPONENT_NAME1,
                componentJson: {
                  dependencies: {
                    [`${BUNDLE_PACK_NAME}-${BUNDLE_COMPONENT_NAME2}`]: DEFAULT_COMPONENT_VERSION
                  }
                }
              });
              util.runComponentTestInTestApp(appConfig, {
                test: _createComponentInPackTest,
                pack: BUNDLE_PACK_NAME,
                component: BUNDLE_COMPONENT_NAME2
              });
            });
          });        
    },
    ojetCreateResourceComponentBundle: (appConfig) => {
      describe('create resource component (bundle)', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _createResourceComponentInPackTest,
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
        util.runComponentTestInTestApp(appConfig, {
          test: _buildPackTest,
          pack: BUNDLE_PACK_NAME,
          vcomponent: BUNDLE_VCOMPONENT_NAME1
        });
      });
  
      describe('ojet build (bundle) ', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildComponentPackAppTest,
          pack: BUNDLE_PACK_NAME,
          component: BUNDLE_COMPONENT_NAME1,
          vcomponent: BUNDLE_VCOMPONENT_NAME1,
          resourceComponent: RESOURCE_COMPONENT_NAME,
          release: false
        });
      });
  
      describe('ojet build --release (bundle)', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _buildReleaseCheckBundle,
          pack: BUNDLE_PACK_NAME,
          component: BUNDLE_COMPONENT_NAME1,
          vcomponent: BUNDLE_VCOMPONENT_NAME1
        });
      });
  
      describe('ojet build --release, stripped metadata in min/loader.js pack test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _stripMetadatainMinLoaderPackTest,
          pack: STRIP_TEST_PACK_NAME,
          component: STRIP_TEST_COMPONENT_NAME
        });
      });
  
      describe('ojet build component', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _vcomponentApiDocumentationPackTest,
          pack: 'vcomp-docs-pack-test',
          component: 'comp-in-pack-docs-test'
        });
      });
  
      // describe('ojet build, do not overwrite path-mapping for oj-c', () => {
      //   util.runComponentTestInTestApp(appConfig, {
      //     test: _doNotOverWriteOjCPathMappingTest
      //   });
      // }); 
  
      // describe('ojet build --release, do not overwrite path-mapping for oj-c', () => {
      //   util.runComponentTestInTestApp(appConfig, {
      //     test: _doNotOverWriteOjCPathMappingTest,
      //     buildType: 'release'
      //   })
      // })
  
      // describe('ojet build, do not overwrite path-mapping for oj-c', () => {
      //   util.runComponentTestInTestApp(appConfig, {
      //     test: _doNotOverWriteOjCPathMappingTest
      //   });
      // }); 
  
      // describe('ojet build --release, do not overwrite path-mapping for oj-c', () => {
      //   util.runComponentTestInTestApp(appConfig, {
      //     test: _doNotOverWriteOjCPathMappingTest,
      //     buildType: 'release'
      //   });
      // });
      
      describe('ojet build, map local reference pack in main.js test', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _manageMappedLocalReferencePackPathTest,
          pack: 'local-reference-pack'
        });
      });
  
      describe('ojet strip, ojet restore, ojet restore --exchange-only tests', () => {
        util.runComponentTestInTestApp(appConfig, {
          test: _ojetRestoreCommandTest
        });
      });
    }
};