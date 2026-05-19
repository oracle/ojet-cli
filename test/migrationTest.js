/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');
const Ojet = require('../ojet');

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

/**
 * Runs `ojet migrate app` for a given app name.
 * @param {string} appName
 * @param {string[]} [extraArgs]
 * @returns {Promise<{ stdout: string, stderr?: string }>}
 */
function migrateApp(appName, extraArgs = []) {
  const cmd = `${util.OJET_APP_COMMAND} migrate app${extraArgs.length ? ` ${extraArgs.join(' ')}` : ''}`;
  return util.execCmd(`${cmd}`, { cwd: util.getAppDir(appName) }, true, true);
}

/**
 * Run a command from within an app directory
 * @param {string} appName
 * @param {string} command
 */
function execInApp(appName, command) {
  return util.execCmd(`${util.OJET_APP_COMMAND} ${command}`, { cwd: util.getAppDir(appName) }, true, true);
}

function checkUrl(url, version) {
  if (typeof url === 'string' && url.startsWith('http')) {
    return url.includes(version);
  } else if (Array.isArray(url)) {
    return url.every((item) => checkUrl(item, version));
  } else if (url && typeof url === 'object') {
    return Object.values(url).every((value) => checkUrl(value, version));
  }
  return true; // if it does not start with http we will treat it as valid
}

const checkCdnsProperties = (cdns, version) => checkUrl(cdns, version);

function rewriteUrl(url, version, outdatedVersion) {
  if (typeof url === 'string' && url.startsWith('http')) {
    return url.replace(version, outdatedVersion);
  } else if (Array.isArray(url)) {
    return url.map((item) => rewriteUrl(item, version, outdatedVersion));
  } else if (url && typeof url === 'object') {
    return Object.fromEntries(
      Object.entries(url).map(([key, value]) => [key, rewriteUrl(value, version, outdatedVersion)])
    );
  }
  return url;
}

const modifyCdnsPathJetVersions = (cdns, outdatedVersion) => {
  const version = util.getJetVersion(util.MIGRATION_APP_NAME);
  return rewriteUrl(cdns, version, outdatedVersion);
};

describe('Migration Test', () => {
  before(async () => {
    if (util.noScaffold()) return;

    util.removeAppDir(util.MIGRATION_APP_NAME);
    util.removeAppDir(util.WEBPACK_MIGRATION_APP_NAME);

    const ojet = new Ojet({ cwd: util.testDir, logs: false });
    try {
      await ojet.execute({
        task: 'create',
        parameters: [util.MIGRATION_APP_NAME],
        options: {
          template: path.join(util.getTemplatesDir(), util.MIGRATION_APP_NAME)
        }
      });

      await ojet.execute({
        task: 'create',
        parameters: [util.WEBPACK_MIGRATION_APP_NAME],
        options: {
          template: path.join(util.getTemplatesDir(), util.WEBPACK_MIGRATION_APP_NAME)
        }
      });

      assert.ok(true);
    } catch (e) {
      console.log(e);
      assert.ok(false, 'Error running ojet.execute({ task: "create" })');
    }
  });

  describe('Common Migration Tests', () => {
    it('should run common migration tests for a non-webpack application', async () => {
      await runCommonMigrationTests(util.MIGRATION_APP_NAME);
    });

    it('should run common migration tests for a webpack application', async () => {
      await runCommonMigrationTests(util.WEBPACK_MIGRATION_APP_NAME);
    });
  });

  describe('Migration Tests for Non-Webpack Application', () => {
    let pathToApp, sourceFolder, javascriptFolder;
    before(() => {
      ({ pathToApp, sourceFolder, javascriptFolder } = util.getAppPathData(util.MIGRATION_APP_NAME));
    });

    describe('Index HTML File Validation Test', () => {
      it('should log an error if the injector:theme flag is missing in index.html', async () => {
        const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
        const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');

        try {
          const updatedContent = originalContent.replace(/<!--\s*injector:theme\s*-->/g, '');
          fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');

          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(
            /To enable theme injection, include the <!-- injector:theme --> flag in your index.html file/.test(
              result.stdout
            ),
            true,
            result.stdout
          );
        } finally {
          fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore
        }
      });

      it('should log an error if there are scripts between the theme injector tags in index.html', async () => {
        const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
        const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');
        // Explicitly inject a tag between the injector markers to trigger the validation error
        const regex = /<!--\s*injector:theme\s*-->[\s\S]*?<!--\s*endinjector\s*-->/gs;
        const updatedContent = originalContent.replace(
          regex,
          `<!-- injector:theme -->\n<script>test</script>\n<!-- endinjector -->`
        );

        try {
          // Write invalid content before running migration
          fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');
          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(
            /Style tags will be automatically inserted in-between the tags during the build process\./.test(
              result.stdout
            ),
            true,
            result.stdout
          );
        } finally {
          // Restore original index.html content
          fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8');
        }
      });

      it('should log an error if the injector:scripts flag is missing in index.html', async () => {
        const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
        const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');

        try {
          // First, ensure the theme injector block is empty to avoid unrelated validation errors
          const themeBlockRegex = /<!--\s*injector:theme\s*-->[\s\S]*?<!--\s*endinjector\s*-->/m;
          const sanitized = originalContent.replace(themeBlockRegex, '<!-- injector:theme -->\n<!-- endinjector -->');
          // Now remove the scripts injector flag to trigger the intended error
          const updatedContent = sanitized.replace(/<!--\s*injector:scripts\s*-->/g, '');
          fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');

          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(
            /To enable js scripts to be injected, include the <!-- injector:scripts --> flag in your index.html file/.test(
              result.stdout
            ),
            true,
            result.stdout
          );
        } finally {
          fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore
        }
      });

      it('should log an error if there are existing main.js and require.js scripts in index.html', async () => {
        const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
        const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');

        try {
          // Ensure the theme injector block is empty first
          const themeBlockRegex = /<!--\s*injector:theme\s*-->[\s\S]*?<!--\s*endinjector\s*-->/m;
          const sanitized = originalContent.replace(themeBlockRegex, '<!-- injector:theme -->\n<!-- endinjector -->');
          const updatedContent =
            `${sanitized}\n` +
            '<script src="js/main.js"></script>\n' +
            '<script src="js/libs/require/require.js"></script>';
          fs.writeFileSync(pathToIndexHtml, updatedContent, 'utf8');

          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(
            /With the <!-- injector:scripts --> flag in place, you can safely remove any existing main.js and require.js scripts from your index.html file/.test(
              result.stdout
            ),
            true,
            result.stdout
          );
        } finally {
          fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore
        }
      });

      it('should not log any errors if the index.html file is valid', async () => {
        const pathToIndexHtml = path.join(pathToApp, sourceFolder, 'index.html');
        const originalContent = fs.readFileSync(pathToIndexHtml, 'utf8');

        try {
          // Ensure the theme injector block is empty to satisfy the validator
          const themeBlockRegex = /<!--\s*injector:theme\s*-->[\s\S]*?<!--\s*endinjector\s*-->/m;
          const sanitized = originalContent.replace(themeBlockRegex, '<!-- injector:theme -->\n<!-- endinjector -->');
          fs.writeFileSync(pathToIndexHtml, sanitized, 'utf8');

          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(/Validating index.html file task finished\./.test(result.stdout), true, result.stdout);
        } finally {
          fs.writeFileSync(pathToIndexHtml, originalContent, 'utf8'); // Restore
        }
      });
    });

    describe('Path Mapping Test', () => {
      it('should update the path mappings in the path_mapping.json file', async () => {
        const pathToPathMappingJson = path.join(pathToApp, sourceFolder, javascriptFolder, util.PATH_MAPPING_JSON);
        const originalJson = fs.readJSONSync(pathToPathMappingJson);

        // Remove one lib entry to ensure migrate restores/updates it
        const libEntryToRemove = Object.getOwnPropertyNames(originalJson.libs)[0];
        const modifiedJson = { ...originalJson, libs: { ...originalJson.libs } };
        delete modifiedJson.libs[libEntryToRemove];
        fs.writeJSONSync(pathToPathMappingJson, modifiedJson);

        const result = await migrateApp(util.MIGRATION_APP_NAME);
        assert.equal(
          /Validating and updating path_mapping\.json file task finished\./.test(result.stdout),
          true,
          result.stdout
        );

        const updatedJson = fs.readJSONSync(pathToPathMappingJson);
        const updatedContentHasTheDeletedEntry = Object.getOwnPropertyNames(updatedJson.libs).includes(libEntryToRemove);
        assert.equal(updatedContentHasTheDeletedEntry, true, 'The path mappings were not updated.');
      });

      it('should update the cdns in the path_mapping.json file', async () => {
        const pathToPathMappingJson = path.join(pathToApp, sourceFolder, javascriptFolder, util.PATH_MAPPING_JSON);
        const pathMappingJson = fs.readJSONSync(pathToPathMappingJson);

        const originalCdns = pathMappingJson.cdns;
        const updatedVersion = util.getJetVersion(util.MIGRATION_APP_NAME);

        const modifiedToOutdatedCdns = modifyCdnsPathJetVersions(originalCdns, OUTDATED_VERSION);
        const hasOutdatedCdnsProperties = checkCdnsProperties(modifiedToOutdatedCdns, OUTDATED_VERSION);

        pathMappingJson.cdns = modifiedToOutdatedCdns;
        fs.writeJSONSync(pathToPathMappingJson, pathMappingJson, { encoding: 'utf-8', spaces: 2 });

        await migrateApp(util.MIGRATION_APP_NAME);

        // Re-read after migration to validate actual updated file content
        const updatedPathMappingJson = fs.readJSONSync(pathToPathMappingJson);
        const hasUpdatedCdnsProperties = checkCdnsProperties(updatedPathMappingJson.cdns, updatedVersion);

        assert.equal(hasOutdatedCdnsProperties, true, 'The cdns properties are not outdated as expected.');
        assert.equal(hasUpdatedCdnsProperties, true, 'The cdns properties are not updated.');
      });
    });

    describe('Main JS File Validation Test', () => {
      it('should log an error if the "injector:mainReleasePaths" flag is missing in main.js', async () => {
        const pathToMainJs = path.join(pathToApp, sourceFolder, javascriptFolder, 'main.js');
        const originalContent = fs.readFileSync(pathToMainJs, 'utf8');

        try {
          const updatedContent = originalContent.replace(/\/\/\s*injector:\s*mainReleasePaths/, '');
          fs.writeFileSync(pathToMainJs, updatedContent, 'utf8');

          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(/Missing "injector:mainReleasePaths" flag in main\.js/.test(result.stdout), true, result.stdout);
        } finally {
          fs.writeFileSync(pathToMainJs, originalContent, 'utf8');
        }
      });

      it('should not log an error if the "injector:mainReleasePaths" flag is present in main.js', async () => {
        const result = await migrateApp(util.MIGRATION_APP_NAME);
        assert.equal(/Validating main\.js file task finished\./.test(result.stdout), true, result.stdout);
      });
    });

    describe('Hooks Validation and Update Test', () => {
      it('should log a warning if the hooks folder is missing', async () => {
        const pathToHooks = path.join(pathToApp, 'scripts', 'hooks');
        const renamedHooksPath = pathToHooks.replace('hooks', '_hooks');

        try {
          if (fs.existsSync(pathToHooks)) {
            fs.renameSync(pathToHooks, renamedHooksPath);
          }

          const result = await migrateApp(util.MIGRATION_APP_NAME);
          assert.equal(/Your app is missing the the hooks folder/.test(result.stdout), true, result.stdout);
        } finally {
          if (fs.existsSync(renamedHooksPath)) {
            fs.renameSync(renamedHooksPath, pathToHooks);
          }
        }
      });

      it('should log a warning if the scripts/config folder exists', async () => {
        const pathToScriptsConfig = path.join(pathToApp, 'scripts', 'config');
        if (!fs.existsSync(pathToScriptsConfig)) {
          fs.mkdirSync(pathToScriptsConfig, { recursive: true });
        }

        const result = await migrateApp(util.MIGRATION_APP_NAME);
        assert.equal(/Found an existing scripts\/config folder/.test(result.stdout), true, result.stdout);
      });

      it('should update the hooks.json file and add missing hook files', async () => {
        const pathToHooks = path.join(pathToApp, 'scripts', 'hooks');
        const pathToHooksJson = path.join(pathToHooks, 'hooks.json');

        const hookFiles = fs.readdirSync(pathToHooks);
        const hookFileToRemove = hookFiles.find((file) => file.endsWith('create.js'));

        // Keep behavior stable, but guard against missing file to avoid breaking the suite unexpectedly.
        assert.ok(hookFileToRemove, 'Expected a "*create.js" hook file to exist for this test.');

        fs.unlinkSync(path.join(pathToHooks, hookFileToRemove));

        const result = await migrateApp(util.MIGRATION_APP_NAME);
        assert.equal(/Validating and updating project hooks task finished/.test(result.stdout), true, result.stdout);

        const fileNameWithoutExtension = path.basename(hookFileToRemove, path.extname(hookFileToRemove));
        const updatedHooksJson = fs.readJSONSync(pathToHooksJson);

        const hasUpdatedFileEntry = Object.getOwnPropertyNames(updatedHooksJson.hooks).includes(fileNameWithoutExtension);
        const hasRestoredHookFile = fs.existsSync(path.join(pathToHooks, hookFileToRemove));

        assert.equal(hasUpdatedFileEntry, true, 'The hooks.json file was not updated.');
        assert.equal(hasRestoredHookFile, true, 'The removed hook file was not restored.');
      });
    });

    describe('Migration wtih exchange component', () => {
      it('should run migration with exchange component', async () => {
        await execInApp(util.MIGRATION_APP_NAME, 'add component oj-dynamic-form');
        const result = await migrateApp(util.MIGRATION_APP_NAME);
        assert.equal(/Validating main\.js file task finished\./.test(result.stdout), true, result.stdout);
      });
    });
  });

  describe('Migration Tests for Webpack Application', () => {
    let pathToApp;
    before(() => {
      ({ pathToApp } = util.getAppPathData(util.WEBPACK_MIGRATION_APP_NAME));
    });

    describe('Path Mapping Test', () => {
      it('should show a warning about the presence of the path_mapping.json file', async () => {
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(
          /Warning: The path_mapping\.json file is not utilized in Webpack-based projects\./.test(result.stdout),
          true,
          result.stdout
        );
      });
    });

    describe('Hooks Validation and Update Test', () => {
      it('should log a warning if the hooks folder is missing', async () => {
        const pathToHooks = path.join(pathToApp, 'scripts', 'hooks');
        const renamedHooksPath = pathToHooks.replace('hooks', '_hooks');

        try {
          if (fs.existsSync(pathToHooks)) {
            fs.renameSync(pathToHooks, renamedHooksPath);
          }

          const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
          assert.equal(/Your app is missing the the hooks folder/.test(result.stdout), true, result.stdout);
        } finally {
          if (fs.existsSync(renamedHooksPath)) {
            fs.renameSync(renamedHooksPath, pathToHooks);
          }
        }
      });

      it('should log a warning if the scripts/config folder exists', async () => {
        const pathToScriptsConfig = path.join(pathToApp, 'scripts', 'config');
        if (!fs.existsSync(pathToScriptsConfig)) {
          fs.mkdirSync(pathToScriptsConfig, { recursive: true });
        }

        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(/Found an existing scripts\/config folder/.test(result.stdout), true, result.stdout);
      });

      it('should output all expected warnings for unnecessary hooks and folders', async () => {
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);

        const expectedHookFiles = [
          'after_app_typescript.js',
          'after_component_build.js',
          'after_component_create.js',
          'after_component_package.js',
          'after_component_typescript.js',
          'after_watch.js',
          'before_app_typescript.js',
          'before_component_optimize.js',
          'before_component_package.js',
          'before_component_typescript.js',
          'before_injection.js',
          'before_optimize.js',
          'before_release_build.js',
          'before_watch.js',
          'before_webpack.js',
          'hooks.json'
        ];

        expectedHookFiles.forEach((file) => {
          const pattern = new RegExp(
            `Warning: Found\\s+${file.replace('.', '\\.')}\\s+hook in your project, which is not required in a Webpack-based setup\\. Consider removing it to avoid potential conflicts or unnecessary overhead\\.`,
            'i'
          );
          assert.ok(pattern.test(result.stdout), `Expected warning for "${file}" not found`);
        });

        const configFolderPattern =
          /Warning: Found an existing scripts\/config folder, which is no longer needed and might cause errors in some cases\. Please consider removing it to avoid potential issues\./i;
        assert.ok(configFolderPattern.test(result.stdout), 'Expected warning for scripts/config folder not found');
      });
    });

    describe('Migration with exchange component', () => {
      it('should check that the existing exchange components are compatible with the version migrating to', async () => {
        await execInApp(util.WEBPACK_MIGRATION_APP_NAME, 'add component oj-dynamic-form');
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(
          /Validating and updating exchange components versions task finished\./.test(result.stdout),
          true,
          result.stdout
        );
      });
    });

    describe('ojet.config.js Validation', () => {
      let pathToOjetConfig;
      let originalConfig;
      before(() => {
        pathToOjetConfig = path.join(pathToApp, 'ojet.config.js');
        originalConfig = fs.readFileSync(pathToOjetConfig, 'utf8');
      });

      afterEach(() => {
        if (originalConfig) {
          fs.writeFileSync(pathToOjetConfig, originalConfig, 'utf8');
        }
      });

      it('should not log errors for an explicit object return with required properties', async () => {
        const goodConfig = `module.exports = { webpack: ({ context, config }) => { return { context, webpack: config }; } };`;
        fs.writeFileSync(pathToOjetConfig, goodConfig, 'utf8');
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(/No return statement found in the webpack function/.test(result.stdout), false, result.stdout);
        assert.equal(/must return an object/.test(result.stdout), false, result.stdout);
        assert.equal(/missing required properties/.test(result.stdout), false, result.stdout);
      });

      it('should log an error when required properties are missing in returned object', async () => {
        const missingPropConfig = `module.exports = { webpack: ({ context, config }) => { return { webpack: config }; } };`;
        fs.writeFileSync(pathToOjetConfig, missingPropConfig, 'utf8');
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(/missing required properties: context/.test(result.stdout), true, result.stdout);
      });

      it('should handle multiple return paths and report missing props in any object return', async () => {
        const multiReturnConfig = `module.exports = { webpack: ({ context, config }) => { if (true) { return { webpack: config }; } return { context, webpack: config }; } };`;
        fs.writeFileSync(pathToOjetConfig, multiReturnConfig, 'utf8');
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(/missing required properties: context/.test(result.stdout), true, result.stdout);
      });

      it('should log an error when the function does not return an object', async () => {
        const nonObjectConfig = `module.exports = { webpack: ({ context, config }) => { return 0; } };`;
        fs.writeFileSync(pathToOjetConfig, nonObjectConfig, 'utf8');
        const result = await migrateApp(util.WEBPACK_MIGRATION_APP_NAME);
        assert.equal(/must return an object/.test(result.stdout), true, result.stdout);
      });
    });
  });
});

/**
 * Reusable migration test suite for a given application name
 * @param {string} appName
 */
async function runCommonMigrationTests(appName) {
  const { pathToApp } = util.getAppPathData(appName);
  const appDir = pathToApp;

  describe('oraclejetconfig.json Validation and Update Test', () => {
    it('should log an error if the SASS version format is incorrect', async () => {
      const cmd = `${util.OJET_APP_COMMAND} migrate app --sassVer=${INCORRECT_SASS_VERSION}`;
      const result = await util.execCmd(`${cmd}`, { cwd: appDir }, true, true);
      assert.equal(
        /Incorrect sass version format: Sass version must be in the format x\.y\.z/.test(result.stdout),
        true,
        result.stdout
      );
    });

    it('should update the oraclejet config according to the desired SASS version', async () => {
      const cmd = `${util.OJET_APP_COMMAND} migrate app --sassVer=${SASS_VERSION}`;
      await util.execCmd(`${cmd}`, { cwd: appDir }, true, true);

      const oraclejetConfigPath = path.join(pathToApp, util.ORACLEJET_CONFIG_JSON);
      const oraclejetConfig = fs.readJSONSync(oraclejetConfigPath);
      assert.equal(oraclejetConfig.sassVer, SASS_VERSION, 'The sass version is not updated correctly.');
    });

    it('should have updated library properties in oraclejetconfig.json file', async () => {
      const oraclejetConfigPath = path.join(pathToApp, util.ORACLEJET_CONFIG_JSON);
      const oraclejetConfig = fs.readJSONSync(oraclejetConfigPath);

      const propertiesExist = CONFIG_PROPERTIES_TO_HAVE_POST_MIGRATION.every((property) =>
        Object.getOwnPropertyNames(oraclejetConfig).includes(property)
      );
      assert.equal(propertiesExist, true, 'The oraclejetconfig file has outdated properties post migration.');
    });
  });

  describe('Install Updated TypeScript Version Test', () => {
    it('should update without overriding existing configurations in the tsconfig file', async () => {
      const pathToTsConfigFile = path.join(pathToApp, util.TSCONFIG_JSON);
      const tsConfigJson = fs.readJSONSync(pathToTsConfigFile);

      delete tsConfigJson.compileOnSave;
      delete tsConfigJson.compilerOptions.paths['ojs/*'];

      tsConfigJson.compilerOptions.skipLibCheck = false;
      tsConfigJson.compilerOptions.removeComments = false;
      tsConfigJson.include.push('./web/ts/**/*');

      fs.writeJSONSync(pathToTsConfigFile, tsConfigJson, { spaces: 2, encoding: 'utf-8' });

      const result = await migrateApp(appName);

      const updatedTsConfigJson = fs.readJSONSync(pathToTsConfigFile);
      const hasUpdatedSkipLibCheckProperty = updatedTsConfigJson.compilerOptions.skipLibCheck === false;
      const hasUpdatedRemoveCommentsProperty = updatedTsConfigJson.compilerOptions.removeComments === false;
      const hasAddedIncludeItem = updatedTsConfigJson.include.includes('./web/ts/**/*');

      assert.equal(hasAddedIncludeItem, true, 'The added item in the include array is removed.');
      assert.equal(hasUpdatedRemoveCommentsProperty, true, 'The removeComments property value is overriden.');
      assert.equal(hasUpdatedSkipLibCheckProperty, true, 'The skipLibCheck property value is overriden.');
      assert.equal(/Added new property compileOnSave with value: true/.test(result.stdout), true, result.stdout);
      assert.equal(/Added new property compilerOptions\.paths\.ojs\/*/.test(result.stdout), true, result.stdout);
      assert.equal(/Updating typescript version and tsconfig\.json file task finished\./.test(result.stdout), true, result.stdout);
    });

    it('should install the updated TypeScript version for a TypeScript application', async () => {
      const result = await migrateApp(appName);
      assert.equal(/Updating typescript version and tsconfig\.json file task finished\./.test(result.stdout), true, result.stdout);
    });
  });
}