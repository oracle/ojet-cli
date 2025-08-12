/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');
const Ojet = require('../ojet');

const appDir = util.getAppDir(util.MIGRATION_APP_NAME);
const SASS_VERSION = '1.32.8';
const INCORRECT_SASS_VERSION = '1.32';
const OUTDATED_VERSION = '13.0.0';

// Properties that should exist in the oraclejetconfig.json file after a
// successful JET version migration:
const CONFIG_PROPERTIES_TO_HAVE_POST_MIGRATION = [
  'typescriptLibraries',
  'unversioned',
  'jsdocLibraries',
  'webpackLibraries',
  'mochaTestingLibraries',
  'jestTestingLibraries'
];

function checkUrl(url, version) {
  if (typeof url === 'string' && url.startsWith('http')) {
    return url.includes(version);
  } else if (Array.isArray(url)) {
    return url.every(item => checkUrl(item, version));
  } else if (typeof url === 'object') {
    return Object.values(url).every(value => checkUrl(value, version));
  }
  return true; // if it does not start with http we will treat it as valid
}

const checkCdnsProperties = (cdns, version) => checkUrl(cdns, version);

function rewriteUrl(url, version, outdatedVersion) {
  if (typeof url === 'string' && url.startsWith('http')) {
    return url.replace(version, outdatedVersion);
  } else if (Array.isArray(url)) {
    return url.map(item => rewriteUrl(item, version, outdatedVersion));
  } else if (typeof url === 'object') {
    return Object.fromEntries(Object.entries(url).map(([key, value]) => [
      key, rewriteUrl(value, version, outdatedVersion)
    ]));
  }
  return url;
}

const modifyCdnsPathJetVersions = (cdns, outdatedVersion) => {
  const version = util.getJetVersion(util.MIGRATION_APP_NAME);

  return rewriteUrl(cdns, version, outdatedVersion);
}

describe('Migration Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.MIGRATION_APP_NAME);
  
      // Scaffold webTsApiTest application using ojet API
      const ojet = new Ojet({ cwd: util.testDir, logs: false });
      try {
        await ojet.execute({
          task: 'create',
          parameters: [util.MIGRATION_APP_NAME],
          options: {
            template: path.join(util.getTemplatesDir(), util.MIGRATION_APP_NAME),
          }
        });
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false, 'Error running ojet.execute({ task: "create" })');
      }
    }
  });

  describe('oraclejetconfig.json Validation and Update Test', () => {
    it('should log an error if the SASS version format is incorrect', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app --sassVer=${INCORRECT_SASS_VERSION}`, {cwd: appDir}, true, true);
        assert.equal(/Incorrect sass version format: Sass version must be in the format x.y.z/.test(result.stdout), true, result.stdout);
    });

    it('should update the oraclejet config according to the desired SASS version', async () => {
        await util.execCmd(`${util.OJET_APP_COMMAND} migrate app --sassVer=${SASS_VERSION}`, {cwd: appDir}, true, true);
        const { pathToApp } = util.getAppPathData(util.MIGRATION_APP_NAME);
        const oraclejetConfigPath = path.join(pathToApp, util.ORACLEJET_CONFIG_JSON);
        const oraclejetConfig = fs.readJSONSync(oraclejetConfigPath);
        assert.equal(oraclejetConfig.sassVer, SASS_VERSION, 'The sass version is not updated correctly.');
    });

    it('should have updated library properties in oraclejetconfig.json file', async () => {
        const { pathToApp } = util.getAppPathData(util.MIGRATION_APP_NAME);
        const oraclejetConfigPath = path.join(pathToApp, util.ORACLEJET_CONFIG_JSON);
        const oraclejetConfig = JSON.parse(fs.readFileSync(oraclejetConfigPath, 'utf8'));
        const propertiesExist = CONFIG_PROPERTIES_TO_HAVE_POST_MIGRATION.every((property) => Object.getOwnPropertyNames(oraclejetConfig).includes(property));
        assert.equal(propertiesExist, true, 'The oraclejetconfig file has outdated properties post migration.');
    });
  });

describe('Index HTML File Validation Test', () => {
    it('should log an error if the injector:theme flag is missing in index.html', async () => {
      const { pathToApp, sourceFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
      const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');
      const updatedContent = originalContent.replace(/<!--\s*injector:theme\s*-->/g, '');
      fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/To enable theme injection, include the <!-- injector:theme --> flag in your index.html file/.test(result.stdout), true, result.stdout);

      fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore the original content
    });

    it('should log an error if there are scripts between the theme injector tags in index.html', async () => {
      const { pathToApp, sourceFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
      const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');
      const regex = /<!--\s*injector:theme\s*-->.*?<!--\s*endinjector\s*-->/gs;
      const replacement = '<!-- injector:theme -->\n<!-- endinjector -->';
      const updatedContent = originalContent.replace(regex, replacement);

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Style tags will be automatically inserted in-between the tags during the build process./.test(result.stdout), true, result.stdout);

      fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8'); // remove the link tag in between the flags
    });

    it('should log an error if the injector:scripts flag is missing in index.html', async () => {
      const { pathToApp, sourceFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
      const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');
      const updatedContent = originalContent.replace(/<!--\s*injector:scripts\s*-->/g, '');
      fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/To enable js scripts to be injected, include the <!-- injector:scripts --> flag in your index.html file/.test(result.stdout), true, result.stdout);

      fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore the original content
    });

    it('should log an error if there are existing main.js and require.js scripts in index.html', async () => {
      const { pathToApp, sourceFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
      const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');
      const updatedContent = originalContent + '\n<script src="js/main.js"></script>\n<script src="js/libs/require/require.js"></script>';
      fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/With the <!-- injector:scripts --> flag in place, you can safely remove any existing main.js and require.js scripts from your index.html file/.test(result.stdout), true, result.stdout);

      fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore the original content
    });

    it('should not log any errors if the index.html file is valid', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Validating index.html file task finished./.test(result.stdout), true, result.stdout);
    });
  });

  describe('Hooks Validation and Update Test', () => {
    it('should log a warning if the hooks folder is missing', async () => {
      const { pathToApp } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToHooks = path.join(pathToApp, 'scripts', 'hooks');
      if (fs.existsSync(pathToHooks)) {
        fs.renameSync(pathToHooks, pathToHooks.replace('hooks', '_hooks'));
      }

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Your app is missing the the hooks folder/.test(result.stdout), true, result.stdout);

      if (fs.existsSync(pathToHooks.replace('hooks', '_hooks'))) {
        fs.renameSync(pathToHooks.replace('hooks', '_hooks'), pathToHooks);
      }
    });

    it('should log a warning if the scripts/config folder exists', async () => {
      const { pathToApp } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToScriptsConfig = path.join(pathToApp, 'scripts', 'config');
      if (!fs.existsSync(pathToScriptsConfig)) {
        fs.mkdirSync(pathToScriptsConfig, { recursive: true });
      }

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Found an existing scripts\/config folder/.test(result.stdout), true, result.stdout);
    });

    it('should update the hooks.json file and add missing hook files', async () => {
      const { pathToApp } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToHooks = path.join(pathToApp, 'scripts', 'hooks');
      const pathToHooksJson = path.join(pathToHooks, 'hooks.json');

      // Remove a hook file to simulate a missing hook
      const hookFiles = fs.readdirSync(pathToHooks);
      const hookFileToRemove = hookFiles.find(file => file.endsWith('create.js'));
      if (hookFileToRemove) {
        fs.unlinkSync(path.join(pathToHooks, hookFileToRemove));
      }

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Validating and updating project hooks task finished/.test(result.stdout), true, result.stdout);

      const fileNameWithoutExtension = path.basename(hookFileToRemove, path.extname(hookFileToRemove));
      const updatedHooksJson = fs.readJSONSync(pathToHooksJson);
      const hasUpdatedFileEntry = Object.getOwnPropertyNames(updatedHooksJson.hooks).includes(fileNameWithoutExtension);
      const hasRestoredHookFile = fs.existsSync(path.join(pathToHooks, hookFileToRemove));
      assert.equal(hasUpdatedFileEntry, true, 'The hooks.json file was not updated.');
      assert.equal(hasRestoredHookFile, true, 'The removed hook file was not restored.');
    });
  });

  describe('Path Mapping Test', () => {
    it('should update the path mappings in the path_mapping.json file', async () => {
      const { pathToApp, sourceFolder, javascriptFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToPathMappingJson = path.join(pathToApp, sourceFolder, javascriptFolder, util.PATH_MAPPING_JSON);
      const originalContent = fs.readJSONSync(pathToPathMappingJson);
      const libEntryToRemove = Object.getOwnPropertyNames(originalContent.libs)[0];

      // delete the entry:
      delete originalContent.libs[libEntryToRemove];

      fs.writeJSONSync(pathToPathMappingJson, originalContent);

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Validating and updating path_mapping.json file task finished./.test(result.stdout), true, result.stdout);

      const updatedContent = JSON.parse(fs.readFileSync(pathToPathMappingJson, 'utf8'));
      const updatedContentHasTheDeletedEntry = Object.getOwnPropertyNames(updatedContent.libs).includes(libEntryToRemove);
      assert.equal(updatedContentHasTheDeletedEntry, true, 'The path mappings were not updated.');
    });

    it('should update the cdns in the path_mapping.json file', async () => {
      const { pathToApp, sourceFolder, javascriptFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToPathMappingJson = path.join(pathToApp, sourceFolder, javascriptFolder, util.PATH_MAPPING_JSON);
      const pathMappingJson = fs.readJSONSync(pathToPathMappingJson);
      const cdns = pathMappingJson.cdns;
      const updatedVersion = util.getJetVersion(util.MIGRATION_APP_NAME);

      // Modify the paths to ensure that they have outdated versions:
      const modifiedToOutdatedCdns = modifyCdnsPathJetVersions(cdns, OUTDATED_VERSION);

      // Check if the versions are set to the outdated version:
      const hasOutdatedCdnsProperties = checkCdnsProperties(modifiedToOutdatedCdns, OUTDATED_VERSION);
      
      // Update the path_mapping.json:
      pathMappingJson.cdns = modifiedToOutdatedCdns;

      fs.writeJSONSync(
        pathToPathMappingJson,
        pathMappingJson,
        { encoding: 'utf-8', spaces: 2 }
      );

      await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);

      // Check if the paths have been updated to version migrating to:
      const hasUpdatedCdnsProperties = checkCdnsProperties(cdns, updatedVersion);

      assert.equal(hasOutdatedCdnsProperties, true, 'The cdns properties are not outdated as expected.');
      assert.equal(hasUpdatedCdnsProperties, true, 'The cdns properties are not updated.');
    });
  });

  describe('Main JS File Validation Test', () => {
    it('should log an error if the "injector:mainReleasePaths" flag is missing in main.js', async () => {
      const { pathToApp, sourceFolder, javascriptFolder } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToMainJs = path.join(pathToApp, sourceFolder, javascriptFolder, 'main.js');
      const originalContent = fs.readFileSync(pathToMainJs, 'utf8');
      const updatedContent = originalContent.replace(/\/\/\s*injector:\s*mainReleasePaths/, '');
      fs.writeFileSync(pathToMainJs, updatedContent, 'utf8');

      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Missing "injector:mainReleasePaths" flag in main.js/.test(result.stdout), true, result.stdout);
      fs.writeFileSync(pathToMainJs, originalContent, 'utf8'); // Restore the original content
    });

    it('should not log an error if the "injector:mainReleasePaths" flag is present in main.js', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Validating main.js file task finished./.test(result.stdout), true, result.stdout);
    });
  });

  describe('Install Updated TypeScript Version Test', () => {
    it('should update without overriding existing configurations in the tsconfig file', async () => {
      const { pathToApp } = util.getAppPathData(util.MIGRATION_APP_NAME);
      const pathToTsConfigFile = path.join(pathToApp, util.TSCONFIG_JSON);
      const tsConfigJson = fs.readJSONSync(pathToTsConfigFile);
      // Remove some existing values:
      delete tsConfigJson.compileOnSave;
      delete tsConfigJson.compilerOptions.paths['ojs/*'];

      // Modify some values to indicate user's preferred values--these should not be overriden:
      tsConfigJson.compilerOptions.skipLibCheck = false;  // change from true
      tsConfigJson.compilerOptions.removeComments = false;  // change from true

      // Add some values into the config object:
      tsConfigJson.include.push("./web/ts/**/*");

      // Update the tsconfig.json file with out new changes
      fs.writeJSONSync(
        pathToTsConfigFile,
        tsConfigJson,
        { spaces: 2, encoding: 'utf-8'}
      );

      // Run the ojet migrate command:
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);

      const updatedTsConfigJson = fs.readJSONSync(pathToTsConfigFile);

      const hasUpdatedSkipLibCheckProperty = updatedTsConfigJson.compilerOptions.skipLibCheck === false;
      const hasUpdatedRemoveCommentsProperty = updatedTsConfigJson.compilerOptions.removeComments === false
      const hasAddedIncludeItem = updatedTsConfigJson.include.includes('./web/ts/**/*');

      assert.equal(hasAddedIncludeItem, true, 'The added item in the include array is removed.');
      assert.equal(hasUpdatedRemoveCommentsProperty, true, 'The removeComments property value is overriden.');
      assert.equal(hasUpdatedSkipLibCheckProperty, true, 'The skipLibCheck property value is overriden.');
      assert.equal(/Added new property compileOnSave with value: true/.test(result.stdout), true, result.stdout);
      assert.equal(/Added new property compilerOptions.paths.ojs\/*/.test(result.stdout), true, result.stdout);
      assert.equal(/Updating typescript version and tsconfig.json file task finished./.test(result.stdout), true, result.stdout);
    });
    it('should install the updated TypeScript version for a TypeScript application', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Updating typescript version and tsconfig.json file task finished./.test(result.stdout), true, result.stdout);
    });
  });

  describe('Run OJET Restore Test', () => {
    it('should run ojet restore successfully', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} migrate app`, {cwd: appDir}, true, true);
      assert.equal(/Restore complete/.test(result.stdout), true, result.stdout);
    });
  });
});
