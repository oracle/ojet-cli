/**
  Copyright (c) 2015, 2024, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const Ojet = require('../ojet');
const util = require('./util');

const appDir = util.getAppDir(util.VDOM_APP_NAME);

describe('VDOM Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.VDOM_APP_NAME);

      // Scaffold vdomTest application using API
      const ojet = new Ojet({ cwd: util.testDir, logs: false });
      let executeOptions = {};
      try {
        executeOptions = {
          task: 'create',
          parameters: [util.VDOM_APP_NAME],
          options: {
            template: 'basic',
            vdom: true
          }
        };
        await ojet.execute(executeOptions);
   
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
      }
    }
  });

  describe('Scaffold', () => {
    it('should have path_mapping.json at root of the app with no baseUrl', () => {
      const pathToPathMappingJson = path.resolve(appDir, 'path_mapping.json');
      const exists = fs.pathExistsSync(pathToPathMappingJson);
      assert.ok(exists, pathToPathMappingJson);
      if (exists) {
        const pathMappingJson = fs.readJSONSync(pathToPathMappingJson);
        assert.ok(!pathMappingJson.baseUrl, 'path_mapping.json has baseUrl');
      }
    });
    it('should have "vdom" on "architecture" field of oraclejetconfig.json', () => {
      const pathToOracleJetConfig = path.resolve(appDir, 'oraclejetconfig.json');
      const oracleJetConfigJson = fs.readJSONSync(pathToOracleJetConfig);
      assert.ok(oracleJetConfigJson.architecture === "vdom", 'application architecture is not "vdom"');
    });
    it('should have custom folder entries in oraclejetconfig.json', () => {
      const pathToOracleJetConfig = path.resolve(appDir, 'oraclejetconfig.json');
      const oracleJetConfigJson = fs.readJSONSync(pathToOracleJetConfig);
      const pathSource = oracleJetConfigJson.paths.source;
      assert.ok(pathSource.javascript === '.', 'javascript entry is not "."');
      assert.ok(pathSource.typescript === '.', 'typescript entry is not "."');
      assert.ok(pathSource.styles === 'styles', 'styles entry is not "styles"');
      assert.ok(pathSource.components === 'components', 'components entry is not "components"');
      assert.ok(pathSource.exchangeComponents === 'exchange_components', 'exchangeComponents entry is not "exchange_components"');
    });
  });

  describe('Component', () => {
    if (!util.noScaffold()) {
      it('should create vcomponent of type funcational when "ojet create component" is ran', async () => {
        const {
          pathToApp,
          sourceFolder,
          typescriptFolder,
          componentsFolder
        } = util.getAppPathData(util.VDOM_APP_NAME)
        const componentName = 'vcomp-1';
        const pathToComponentTsx = path.join(
          pathToApp,
          sourceFolder,
          typescriptFolder,
          componentsFolder,
          componentName,
          `${componentName}.tsx`
        )
        const ojet = new Ojet({ cwd: pathToApp, logs: false });
        try {
          await ojet.execute({
            task: 'create',
            scope: 'component',
            parameters: [componentName]
          });
          const isVComponent = fs.pathExistsSync(pathToComponentTsx);
          assert.ok(isVComponent, pathToComponentTsx);
          if (isVComponent) {
            const vcompContents = fs.readFileSync(pathToComponentTsx);
            const isFunctionalTemplate = !vcompContents.includes(`@customElement("${componentName}")`);
            assert.ok(isFunctionalTemplate, 'Created component is class-based.')
          }
        } catch {
          assert.ok(false, 'Error creating component');
        }
      });
    }
  });

  describe('Build with a sass file in component folder', () => {
    if (!util.noBuild()) {
      it('should not fail build if there is a sass file in component folder root', async  () => {
        const { pathToApp, sourceFolder } = util.getAppPathData(util.VDOM_APP_NAME);
        // add a sass file in there
        const pathToANonComponentFolder = path.join(pathToApp, sourceFolder, 'components', 'not-a-component');
        fs.mkdirSync(pathToANonComponentFolder);
        const pathToSassFile = path.join(pathToANonComponentFolder, 'foo.scss');
        fs.writeFileSync(pathToSassFile, '// Here is the sample file.');
        await util.execCmd(`${util.OJET_APP_COMMAND} add sass`, { cwd: util.getAppDir(util.VDOM_APP_NAME) });
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} build web`, { cwd: util.getAppDir(util.VDOM_APP_NAME) });
        fs.removeSync(pathToSassFile);
        assert.equal(util.buildSuccess(result.stdout), true, result.error);
      });
    }
  });

  describe('Build', () => {
    if (!util.noBuild()) {
      it('should build vdom app', async () => {
        const ojet = new Ojet({ cwd: util.getAppDir(util.VDOM_APP_NAME), logs: false });
        try {
          await ojet.execute({ task: 'build' });
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
      it('should have injected preact debug', async () => {
        const {pathToApp, stagingFolder} = util.getAppPathData(util.VDOM_APP_NAME);
        const pathToIndexTs = path.join(pathToApp, stagingFolder, 'index.ts');
        const tsContent = fs.readFileSync(pathToIndexTs, { encoding: 'utf-8' });
        const regex = /import 'preact\/debug'/gm;
        assert(regex.exec(tsContent), "import 'preact/debug' not found");          
      });
      it('should have injected preact theming', async () => {
        const {pathToApp, stagingFolder} = util.getAppPathData(util.VDOM_APP_NAME);
        const pathToIndexHtml = path.join(pathToApp, stagingFolder, 'index.html');
        const htmlContent = fs.readFileSync(pathToIndexHtml, { encoding: 'utf-8' });
        const regex = /styles\/theme-redwood/gm;
        assert(regex.exec(htmlContent), "styles/theme-redwood not found");
      });
    }
  });

  describe('Build (Release)', () => {
    if (!util.noBuild()) {
      it('should build vdom app', async () => {
        const ojet = new Ojet({ cwd: util.getAppDir(util.VDOM_APP_NAME), logs: false });
        try {
          await ojet.execute({ task: 'build', options: { release: true }});
          assert.ok(true);
        } catch {
          assert.ok(false);
        }
      });
    }
  });

  describe('Add', () => {
    if (!util.noBuild()) {
      it('should have appropriate vdom files and folders to cache in sw.js on running ojet add pwa', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} add pwa`, { cwd: appDir }, true, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, { cwd: appDir }, true, true);
        const {pathToApp, stagingFolder} = util.getAppPathData(util.VDOM_APP_NAME);
        const pathToSWFile = path.join(pathToApp, stagingFolder, 'sw.js');
        const swJsContent = fs.readFileSync(pathToSWFile, { encoding: 'utf-8' });
        const regex = /resourcesToCache=(?<resourcesToCache>.*)\;self/gm;
        const match = regex.exec(swJsContent);
        const retrievedResourcesToCache = match.groups.resourcesToCache;
        const requiredResourcesToCache = ['index.js', 'index.html', 'bundle.js', 'manifest.json', 'components/', 'libs/', 'styles/'];
        const swJSHasRequiredResourcesTocache =  requiredResourcesToCache.every((resource) => {
          return retrievedResourcesToCache.includes(resource);
        })
        const errorMessage = `sw.js does not contain right files and folders to cache for a vdom app.`;
        assert.equal(swJSHasRequiredResourcesTocache, true, errorMessage); 
      });

      it('should have appropriate testing files on running add testing', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, { cwd: appDir }, true, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create pack pack-1`, { cwd: appDir }, true, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create component comp-1`, { cwd: appDir }, true, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create component comp-1 --pack=pack-1`, { cwd: appDir }, true, true);

        const { pathToApp, pathToSourceComponents } = util.getAppPathData(util.VDOM_APP_NAME);
        const hasTestConfigFile = fs.existsSync(path.join(pathToApp, 'test-config', 'jest.config.js'));
        const hasComponentTestFile = fs.existsSync(path.join(pathToSourceComponents, 'comp-1', '__tests__', 'comp-1.spec.tsx'));
        const hasComponentInPackTestFile = fs.existsSync(path.join(pathToSourceComponents, 'pack-1', 'comp-1', '__tests__', 'comp-1.spec.tsx'));

        assert.equal(hasTestConfigFile, true, 'Has no jest.config.js file.');
        assert.equal(hasComponentTestFile, true, 'Has no component test file.');
        assert.equal(hasComponentInPackTestFile, true, 'Has no component in pack test file.'); 
      });

      it('should add test and debug subproperties if absent in the scripts property in package.json of the project on running add testing', async () => {
        const jestCommand = 'jest -c test-config/jest.config.js';
        const { pathToApp } = util.getAppPathData(util.VDOM_APP_NAME);
        const pathToPackageJson = path.join(pathToApp, 'package.json');
        const debugCommand = 'node --inspect-brk node_modules/.bin/jest --runInBand';

        await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, { cwd: appDir }, true, true);
        
        // Retrieve the json file and check for the added test scripts:
        const packageJsonObj = fs.readJSONSync(pathToPackageJson);
        const hasTestProperty = packageJsonObj.scripts && packageJsonObj.scripts.test === jestCommand;
        const hasDebugProperty = packageJsonObj.scripts && packageJsonObj.scripts['test:debug'] === debugCommand;
        assert.equal(hasTestProperty, true, 'Has no test sub-property in package.json scripts property.');
        assert.equal(hasDebugProperty, true, 'Has no test:debug sub-property in package.json scripts property.');
      });

      it('should add test-jest-ojet and test-debug if test and test:debug subproperties are in the scripts property in package.json of the project on running add testing', async () => {
        const jestCommand = 'jest -c test-config/jest.config.js';
        const { pathToApp } = util.getAppPathData(util.VDOM_APP_NAME);
        const pathToPackageJson = path.join(pathToApp, 'package.json');
        const debugCommand = 'node --inspect-brk node_modules/.bin/jest --runInBand';

        // Modify the test and test:debug subproperties:
        let packageJsonObj = fs.readJSONSync(pathToPackageJson);
        packageJsonObj.scripts = {
          test: 'not-the-above-defined-jest-command',
          'test:debug': 'not-the-above-debug-command'
        }
        fs.writeJSONSync(pathToPackageJson, packageJsonObj, { encoding: 'utf-8', spaces: 2 });

        // Run the ojet add testing
        await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, { cwd: appDir }, true, true);
        
        // Retrieve the json file and check for the added test scripts:
        packageJsonObj = fs.readJSONSync(pathToPackageJson);
        const hasTestProperty = packageJsonObj.scripts && packageJsonObj.scripts['test-jest-ojet']=== jestCommand;
        const hasDebugProperty = packageJsonObj.scripts && packageJsonObj.scripts['test-debug-ojet'] === debugCommand;

        // Restore the initial package json content--the one without scripts subproperties:
        packageJsonObj.scripts = {};
        fs.writeJSONSync(pathToPackageJson, packageJsonObj, { encoding: 'utf-8', spaces: 2 });

        assert.equal(hasTestProperty, true, 'Has no test-jest-ojet sub-property in package.json scripts property.');
        assert.equal(hasDebugProperty, true, 'Has no test-debug-ojet sub-property in package.json scripts property.');
      });
    }
  });
});
