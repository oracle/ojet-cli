/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
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
        const componentName = 'vcomp-one';
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

      it('should have appropriate testing files after running ojet add testing', async () => {
        const { pathToSourceComponents, pathToApp } = util.getAppPathData(util.VDOM_APP_NAME);
        const hasComponentTags = (fileContent) => (/@component@/.test(fileContent) || /@camelcasecomponent-name@/.test(fileContent));
        const pathToCompOneTests = path.join(pathToSourceComponents, 'comp-one', '__tests__', 'comp-one.spec.tsx');
        const pathToCompOnePackTests = path.join(pathToSourceComponents, 'pack-one', 'comp-one', '__tests__', 'comp-one.spec.tsx');
        const pathToCompTwoTests = path.join(pathToSourceComponents, 'comp-two', '__tests__', 'comp-two.spec.tsx');
        const pathToCompTwoPackTests = path.join(pathToSourceComponents, 'pack-one', 'comp-two', '__tests__', 'comp-two.spec.tsx');

        await util.execCmd(`${util.OJET_APP_COMMAND} create pack pack-one`, { cwd: appDir }, false, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create component comp-one`, { cwd: appDir }, false, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create component comp-one --pack=pack-one`, { cwd: appDir }, false, true);

        const hasCompOneTestsBeforeAddCommand = fs.existsSync(pathToCompOneTests);
        const hasCompOnePackTestsBeforeAddCommand = fs.existsSync(pathToCompOnePackTests);

        await util.execCmd(`${util.OJET_APP_COMMAND} add testing`, { cwd: appDir }, false, true);

        const hasTestConfigFile = fs.existsSync(path.join(pathToApp, 'test-config', 'jest.config.js'));

        await util.execCmd(`${util.OJET_APP_COMMAND} create component comp-two`, { cwd: appDir }, false, true);
        await util.execCmd(`${util.OJET_APP_COMMAND} create component comp-two --pack=pack-one`, { cwd: appDir }, false, true);

        const hasCompOneTestsAfterAddCommand = fs.existsSync(pathToCompOneTests);
        const hasCompTwoTestsAfterAddCommand = fs.existsSync(pathToCompTwoTests);
        const hasCompOnePackTestsAfterAddCommand = fs.existsSync(pathToCompOnePackTests);
        const hasCompTwoPackTestsAfterAddCommand = fs.existsSync(pathToCompTwoPackTests);

        let fileContent = fs.readFileSync(pathToCompOneTests, { encoding: 'utf-8' });

        const hasTagsInCompOneTest = hasComponentTags(fileContent);

        fileContent = fs.readFileSync(pathToCompOnePackTests, { encoding: 'utf-8' });

        const hasTagsInCompOnePackTest = hasComponentTags(fileContent);

        fileContent = fs.readFileSync(pathToCompTwoTests, { encoding: 'utf-8' });

        const hasTagsInCompTwoTest = hasComponentTags(fileContent);

        fileContent = fs.readFileSync(pathToCompTwoPackTests, { encoding: 'utf-8' });

        const hasTagsInCompTwoPackTest = hasComponentTags(fileContent);

        assert.equal(hasTestConfigFile, true, 'Has no jest.config.js file.');
        assert.equal(!hasCompOneTestsBeforeAddCommand, true, 'Has component test files before runnning ojet add testing.');
        assert.equal(!hasCompOnePackTestsBeforeAddCommand, true, 'Component in a pack has test files before runnning ojet add testing.');
        assert.equal(hasCompOneTestsAfterAddCommand, true, 'Has no component test files in comp-one.');
        assert.equal(hasCompTwoTestsAfterAddCommand, true, 'Has no component test files in comp-two.');
        assert.equal(hasCompOnePackTestsAfterAddCommand, true, 'Has no component test files in comp-one of pack-one.');
        assert.equal(hasCompTwoPackTestsAfterAddCommand, true, 'Has no component test files in comp-two of pack-one.');
        assert.equal(!hasTagsInCompOneTest, true, 'Has no tags in component test files in comp-one.');
        assert.equal(!hasTagsInCompOnePackTest, true, 'Has no tags in component test files in comp-one of pack-one.');
        assert.equal(!hasTagsInCompTwoTest, true, 'Has no tags in component test files in in comp-two.');
        assert.equal(!hasTagsInCompTwoPackTest, true, 'Has no tags in component test files in comp-two of pack-one.'); 
      });

      it('should not override pre-existing mappings after running ojet build (or with --release)', async () => {
        const { pathToApp } = util.getAppPathData(util.VDOM_APP_NAME);
        const configFilePath = path.join(pathToApp, 'test-config', 'jest.config.js');
        let fileContent = fs.readFileSync(configFilePath, 'utf8');
        const getExctractedRegexData = () => {
          const regex = /(?<=moduleNameMapper:\s)\s*\s*{[\s\S]*?\}/s;
          const extractedObj = fileContent.match(regex)[0];
          return {
            moduleNameMapper : JSON.parse(extractedObj) || {},
            extractedObjString: extractedObj
          };
        };

        let configObj = getExctractedRegexData();

        configObj.moduleNameMapper['translation/(.*)'] = '<rootDir>/web/js/translation/$1';
        const updatedFileContent = fileContent.replace(configObj.extractedObjString, JSON.stringify(configObj.moduleNameMapper, null, 2));
        fs.writeFileSync(configFilePath, updatedFileContent, 'utf-8');

        // Build the project. This will update the module name mapper to add component's mappings:
        await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: appDir }, true, true);
        
        // Read the file again:
        fileContent = fs.readFileSync(configFilePath, 'utf8');
        // Retrieve the config object again to check that moduleNameMapper is not overwritten:
        configObj = getExctractedRegexData();
        const hasTranslationMapping =  Object.getOwnPropertyNames(configObj.moduleNameMapper).includes('translation/(.*)');
        // Check that the components' mapping exist and that it does not override the mapping for translation entry:
        assert.equal(hasTranslationMapping, true, 'jest config file module name mapper contents get overwritten on running building the project.');
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

      it('should search component', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} configure --global --exchange-url=${util.EXCHANGE_URL}`, { cwd: appDir });

        let result = await util.execCmd(`${util.OJET_APP_COMMAND} search exchange nonsense-one`, { cwd: appDir }, true, true);
        assert.equal(/No components found/i.test(result.stdout), true, result.error);

        result = await util.execCmd(`${util.OJET_APP_COMMAND} search exchange demo-card`, { cwd: appDir }, true, true);
        assert.equal(/Demo Flip Card/i.test(result.stdout), true, result.error);
      });
      
      it('should remove component', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} remove component comp-one`, { cwd: appDir }, true, true);
        assert.equal(/Success: Component/i.test(result.stdout), true, result.error);
      });
      it ('should give not found error', async () => {
        // Removal that causes not found error
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} remove pack comp-one`, { cwd: appDir }, true, true);
        assert.equal(/Error: pack 'comp-one' not found/i.test(result.stdout), true, result.error);
      });      
    }
  });

describe('Build translation bundles', () => {
  if (!util.noBuild()) {
    it('should not have translation configurations in the oraclejetconfig.json file before running ojet add translation', async  () => {
      const oracleJetConfigJSON = util.getOracleJetConfigJson(util.VDOM_APP_NAME);
      
      // "buildICUTranslationBundle" is a flag to invoke building the translation bundles.
      const hasbuildICUTranslationBundleEntry = oracleJetConfigJSON.buildICUTranslationsBundle === undefined;
      // "translation" entry contains the config options and the translation type needed to build the bundles.
      const hasTranslationEntry = oracleJetConfigJSON.translation === undefined; 

      assert.equal(hasbuildICUTranslationBundleEntry, true, 'buildICUTranslationBundle flag exists in the oraclejetconfig.json file');
      assert.equal(hasTranslationEntry, true, 'translation entry with needed configurations exists in the oraclejetconfig.json file');
    });

    it('should add libraries and needed configurations in the oraclejetconfig.json file after running ojet add translation', async  () => {
      await util.execCmd(`${util.OJET_APP_COMMAND} add translation`, { cwd: util.getAppDir(util.VDOM_APP_NAME) });
      
      const oracleJetConfigJSON = util.getOracleJetConfigJson(util.VDOM_APP_NAME);
      
      const hasbuildICUTranslationBundleEntry = oracleJetConfigJSON.buildICUTranslationsBundle;
      const hasTranslationEntry = oracleJetConfigJSON.translation &&
        Object.keys(oracleJetConfigJSON.translation).every((entry) => ['type', 'options'].includes(entry)); 

      assert.equal(hasbuildICUTranslationBundleEntry, true, 'buildICUTranslationBundle flag either does not exist or is set to false');
      assert.equal(hasTranslationEntry, true, 'translation entry with needed configurations does not exist');
    });

    it('should build translation bundle during the build time after running the ojet add translation command', async () => {
    const { pathToApp, javascriptFolder, sourceFolder, stagingFolder } = util.getAppPathData(util.VDOM_APP_NAME);
    const pathToResourcesFolder = path.join(pathToApp, sourceFolder, javascriptFolder, 'resources');
    const pathToResourcesNlsFolder = path.join(pathToResourcesFolder, 'nls');
    const pathToBundleTsFile = path.join(pathToResourcesNlsFolder, 'translationBundle.ts');
    const pathToBuiltBundleJsFile = path.join(pathToResourcesNlsFolder.replace(sourceFolder, stagingFolder), 'translationBundle.js');
    const pathToSupportedLocalesFile = path.join(pathToResourcesNlsFolder, 'supportedLocales.ts');

    // We check this to ensure that the translation bundle is built successfully.
    const hasBundleTsFileBeforeRunningOjetBuild = fs.existsSync(pathToBundleTsFile);

    // Add the configuration options for rootDir, bundleName in the oraclejetconfig.json
    // now that we know where they are located:
    const oracleJetConfigJSON = util.getOracleJetConfigJson(util.VDOM_APP_NAME);

    oracleJetConfigJSON.translation.options = {
      ...oracleJetConfigJSON.translation.options,
      // We are putting the random spaces here because we are testing the trim function
      // in the buildICUTranslationBundle function as, by default, the l10nBundleBuilder
      // will pick the first locale in the list (and generate its folder and bundle)
      // only and leave others if there are spaces in the locales list:
      supportedLocales: 'es, fr,    de,ar',
    };

    util.writeOracleJetConfigJson(util.VDOM_APP_NAME, oracleJetConfigJSON);

    // Now we can run ojet build, which also builds the translation bundle:
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, { cwd: util.getAppDir(util.VDOM_APP_NAME) });

    const hasTranslationBundleTsFile = fs.existsSync(pathToBundleTsFile);
 
    let translatedBundleHasRightContent;
    if (hasTranslationBundleTsFile) {
      translatedBundleHasRightContent = fs.readFileSync(pathToBundleTsFile).includes('"Hello! How are you doing?"');
    }

    const resourcesDirItems = fs.readdirSync(pathToResourcesNlsFolder);
    const hasGeneratedLocaleFolders = ['es', 'fr', 'de', 'ar'].every(item => resourcesDirItems.includes(item));
    const hasGeneratedSupportedLocalesFile = fs.existsSync(pathToSupportedLocalesFile);
    const hasBuiltTranslationBundleInStaging = fs.existsSync(pathToBuiltBundleJsFile);

    assert.equal(hasBundleTsFileBeforeRunningOjetBuild, false, 'Translation bundle ts file should exist after running ojet build.');
    assert.equal(util.buildSuccess(result.stdout), true, result.error);
    assert.equal(/Building ICU translation bundles finished./.test(result.stdout), true, result.error);
    assert.equal(hasTranslationBundleTsFile, true, 'There is no translation bundle .ts file created.');
    assert.equal(hasGeneratedSupportedLocalesFile, true, 'There is no generated supported locales file.');
    assert.equal(translatedBundleHasRightContent, true, hasTranslationBundleTsFile ? 'The translation .ts bundle file has incorrect contenst' : 'There is no translation bundle .ts file created.');
    assert.equal(hasGeneratedLocaleFolders, true, 'There are not generated locale folders.');
    assert.equal(hasBuiltTranslationBundleInStaging, true, 'There is no built translation bundle in staging.');
  });

  it('should create a bundle at component level and ensure that translations are generated correctly', async  () => {
    const { pathToSourceComponents } = util.getAppPathData(util.VDOM_APP_NAME);
    const pathToCompOne = path.join(pathToSourceComponents, 'comp-one');
    const pathToNlsRootBundleName = path.join(pathToCompOne, 'resources', 'nls', 'comp-one-strings.json');
    
    fs.writeJSONSync(pathToNlsRootBundleName, { "greetings": "Hello, how are you?" });

    // Build the component:
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build component comp-one`, { cwd: util.getAppDir(util.VDOM_APP_NAME) });

    const hasGeneratedBundleFile = fs.existsSync(pathToNlsRootBundleName.replace('.json', '.ts'));

    assert.equal(hasGeneratedBundleFile, true, 'There is no translation bundle .ts file created.');
    assert.equal(/Built ICU translations bundle for component comp-one successfully/.test(result.stdout), true, result.error);
  });

  it('should customize componentBundleName and ensure that the component translations are generated correctly', async  () => {
    const { pathToSourceComponents } = util.getAppPathData(util.VDOM_APP_NAME);
    const pathToCompOne = path.join(pathToSourceComponents, 'comp-one');
    const pathToNlsRootBundleName = path.join(pathToCompOne, 'resources', 'nls', 'comp-one-strings.json');
    const pathToUpdatedNlsRootBundleName = path.join(pathToCompOne, 'resources', 'nls', 'comp-one-icu-translations.json');
    // Add the configuration options for rootDir, bundleName in the oraclejetconfig.json
    // now that we know where they are located:
    const oracleJetConfigJSON = util.getOracleJetConfigJson(util.VDOM_APP_NAME);

    oracleJetConfigJSON.translation.options = {
      ...oracleJetConfigJSON.translation.options,
      componentBundleName: '${componentName}-icu-translations.json'
    };

    util.writeOracleJetConfigJson(util.VDOM_APP_NAME, oracleJetConfigJSON);

    // Rename the bundle file to reflect the name changes:
    fs.renameSync(pathToNlsRootBundleName, pathToUpdatedNlsRootBundleName);

    // Build the component:
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build component comp-one`, { cwd: util.getAppDir(util.VDOM_APP_NAME) });

    const hasGeneratedBundleFile = fs.existsSync(pathToUpdatedNlsRootBundleName.replace('.json', '.ts'));

    assert.equal(hasGeneratedBundleFile, true, 'There is no translation bundle .ts file created.');
    assert.equal(/Built ICU translations bundle for component comp-one successfully/.test(result.stdout), true, result.error);
  });
  }
});
});
