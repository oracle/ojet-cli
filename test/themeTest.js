/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

const appDir = util.getAppDir(util.THEME_APP_NAME);
const THEME_NAME = 'testTheme';

describe('PCSS Theme Test', () => {
  before(async () => {
    if (!util.noScaffold()) {
      util.removeAppDir(util.THEME_APP_NAME);
  
      // Scaffold a basic web app
      let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.THEME_APP_NAME} --use-global-tooling --norestore=true`, { cwd: util.testDir });
      console.log(result.stdout);
      // Check that it output the right text to the command line
      assert.strictEqual(util.norestoreSuccess(result.stdout), true, result.stderr);
      // Restore
      result = await util.execCmd(`${util.OJET_APP_COMMAND} restore`, { cwd: util.getAppDir(util.THEME_APP_NAME) });
    }
  });

  it('should run ojet build --sass in an app with no *.scss files and not fail', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --sass`, {cwd: appDir});
      assert.equal(util.buildSuccess(result.stdout), true, result.error);
  });

  it('should run ojet build --sass in an app with *.scss files and fail with correct error message', async () => {
    const testComponentName = 'test-component';
    // make a temporary jet-composites folder in the app folder
    await util.execCmd(`${util.OJET_APP_COMMAND} create component ${testComponentName}`, {cwd: appDir});
    const { pathToApp, sourceFolder, javascriptFolder, componentsFolder} = util.getAppPathData(util.THEME_APP_NAME);
    const pathToJetCompositeFolder = path.join(pathToApp, sourceFolder, javascriptFolder, componentsFolder);
    const pathToTestComponent = path.join(pathToJetCompositeFolder,`${testComponentName}`);
    const testComponentCssFile = `${testComponentName}-styles.css`;
    // get .css and .scss file paths and rename .css to .scss
    const cssFilePath = path.join(pathToTestComponent, testComponentCssFile);
    const scssFilePath = cssFilePath.replace('.css', '.scss');
    fs.renameSync(cssFilePath, scssFilePath);
    // set squelch to true to not catch anything on resolving the promise
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --sass`, {cwd: appDir}, true);
    // Delete the jet-composite folder created after running ojet build --sass
    fs.rmdirSync(pathToJetCompositeFolder, {recursive : true});
    assert.ok(/node-sass is not installed. To install it, run: ojet add sass./.test(result.stdout), true, result.stdout);
  });
  
  it('Should not create a custom theme before running ojet add sass or ojet add theming.', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme ${THEME_NAME}`, { cwd: appDir }, true);
    // "Please run 'ojet add sass'..." is part of the message that includes the suggestion to run ojet add theming, if preferred:
    assert.ok(/Please run 'ojet add sass' to configure your projects for SASS processing./.test(result.stdout), result.stdout);
  });

  it('Should throw a warning on creating a custom theme that defaults to alta as base-theme.', async () => {
    await util.execCmd(`${util.OJET_APP_COMMAND} add sass`, { cwd: appDir }, true);
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme ${THEME_NAME}`, { cwd: appDir }, true);
    assert.ok(/The created theme defaults to alta as base-theme, which is deprecated./.test(result.stdout), result.stdout);
  });

  it('Should add theming to enable node-sass, postcss-custom-theme, postcss-calc, autoprefixer', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);
  });

  it('Should set default theme to redwood-notag and refer to its css file in index.html on build', async () => {
    const { pathToApp, pathToIndexHtml } = util.getAppPathData(util.THEME_APP_NAME);
    util.setDefaultTheme('redwood-notag', pathToApp);
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, {cwd: appDir});
    assert.equal(util.buildSuccess(result.stdout), true, result.error);
    const regex = new RegExp('href="css\/redwood\/web\/redwood-notag.css"', 'gm');
    const hasRedwoodNotag = util.checkThemingLink(regex, pathToIndexHtml);
    assert.ok(hasRedwoodNotag, "The index.html file does not have a link to redwood-notag.css.");
  });

  it('Should set default theme to redwood-notag and refer to its css file in index.html on build release', async () => {
    const { pathToApp, pathToIndexHtml } = util.getAppPathData(util.THEME_APP_NAME);
    util.setDefaultTheme('redwood-notag', pathToApp);
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --release`, {cwd: appDir});
    assert.equal(util.buildSuccess(result.stdout), true, result.error);
    const regex = new RegExp('href="css\/redwood\/web\/redwood-notag.min.css"', 'gm');
    const hasRedwoodNotagMin = util.checkThemingLink(regex, pathToIndexHtml);
    assert.ok(hasRedwoodNotagMin, "The index.html file does not have a link to redwood-notag.min.css.");
  });

  describe('svg optimization test', () => {
    it('should fail to optimize an svg file and then emit its path as part of the error message', async () => {
      const { pathToApp } = util.getAppPathData(util.THEME_APP_NAME);
      const pathToRedwoodThemeImageFolder = path.join(pathToApp, 'staged-themes', 'redwood', 'web', 'images');
      const pathToSvgTestFile = path.join(pathToRedwoodThemeImageFolder, 'test-file.svg');
      const svgTestFileContent = 'This is not a valid svg content. Should cause optimization to fail.';
      // Write the file invalid file content into the test-file:
      fs.writeFileSync(pathToSvgTestFile, svgTestFileContent, {encoding: 'utf-8'});
      // Run the build command and get the emitted build info:
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build`, {cwd: appDir});
      let errorMessageForCorruptedFile;
      const pathToTestFileCreated = fs.existsSync(pathToSvgTestFile);
      if (pathToTestFileCreated) {
        errorMessageForFailingFile = `Error caused by file: ${pathToSvgTestFile}`;
      }
      // Delete the corrupted file; otherwise, subsequent tests will fail:
      fs.removeSync(pathToSvgTestFile);
      const pathToTestFileDeleted = fs.existsSync(pathToSvgTestFile);
      const regex = new RegExp(errorMessageForCorruptedFile, 'g');
      // Check the tests that they pass:
      assert.ok(regex.test(result.stdout), result.stdout);
      assert.equal(!pathToTestFileDeleted, true, 'Test file not deleted successfully.');
    });
  });

  describe ('Preact Theme Test', () => {
    it('Should have preact theme files in staging and the referred links in index.html on build with redwood theme', async () => {
      const { pathToIndexHtml } = util.getAppPathData(util.THEME_APP_NAME);
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --theme=redwood`, {cwd: appDir});
      assert.equal(util.buildSuccess(result.stdout), true, result.error);
      const regexRedwood = new RegExp(`href="css\/theme-redwood\/${util.getJetVersion(util.THEME_APP_NAME)}\/web\/theme.css"`, 'gm');
      const hasLinkToThemeRedwood  = util.checkThemingLink(regexRedwood, pathToIndexHtml);
      assert.ok(hasLinkToThemeRedwood, "The index.html file does not have a link to theme-redwood.css.");
    });

    it('Should not have preact theme files in staging and the referred links in index.html on build with stable theme', async () => {
      const { pathToIndexHtml } = util.getAppPathData(util.THEME_APP_NAME);
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --theme=stable`, {cwd: appDir});
      assert.equal(util.buildSuccess(result.stdout), true, result.error);  
      const regexRedwood = new RegExp(`href="css\/theme-redwood\/${util.getJetVersion(util.THEME_APP_NAME)}\/web\/theme.css"`, 'gm');
      const hasLinkToThemeRedwood  = util.checkThemingLink(regexRedwood, pathToIndexHtml);
      assert.ok(!hasLinkToThemeRedwood, "The index.html has a link to theme-redwood.css.");
    });
  });

  describe('Create and compile pcss theme', () => {
    it('Should create theme with basetheme stable after add theming', async () => {
      const removetheme = path.resolve(appDir, 'src/themes');
      fs.removeSync(removetheme);
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme themestable --basetheme=stable`, {cwd: appDir});
      assert.equal(/with css variables support/.test(result.stdout), true, result.stdout);
    });
    
    it('Should create theme with basetheme redwood after add theming', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme themeredwood --basetheme=redwood`, {cwd: appDir});
      assert.equal(/with css variables support/.test(result.stdout), true, result.stdout);
    });

    it('Should compile pcss theme with stable', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --theme=themestable`, {cwd: appDir});
      assert.equal(/pcss compile finished/.test(result.stdout), true, result.stdout);
    });

    it('Should compile pcss theme with redwood', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --theme=themeredwood`, {cwd: appDir});
      assert.equal(/pcss compile finished/.test(result.stdout), true, result.stdout);
    });
    
    it('Should fail creating theme without basetheme flag', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme demotheme`, {cwd: appDir}, true);
      assert.equal(/basetheme is required/.test(result.stdout), true, result.stdout);
    });

    it('Should run build with --theme=all and check that redwood files are present in staging location', async () => {
      await util.execCmd(`${util.OJET_APP_COMMAND} build --themes=all`, {cwd: appDir});
      const { stagingFolder, stylesFolder, pathToNodeModules, pathToApp } = util.getAppPathData(util.THEME_APP_NAME);        
      const pathToRedwoodInStaging = path.join(pathToApp, stagingFolder, stylesFolder, 'redwood', util.getJetVersion(util.THEME_APP_NAME),'web');
      const pathToRedwoodInNodeModules = path.join(pathToNodeModules, '@oracle/oraclejet/dist/css/redwood');
      const everyExpectedEntryIsPresent = fs.readdirSync(pathToRedwoodInNodeModules).every(dirEntry => {
        // oj-redwood.css, oj-redwood.min.css (and their minified versions) are renamed to redwood.css
        // and redwood-notag.css in the staging location so we have to update the existence check:
        if (dirEntry === 'oj-redwood.css') {
          return fs.existsSync(path.join(pathToRedwoodInStaging, 'redwood.css'));
        } 
        else if (dirEntry === 'oj-redwood-min.css') {
          return fs.existsSync(path.join(pathToRedwoodInStaging, 'redwood.min.css'));
        }
        else if (dirEntry === 'oj-redwood-notag.css') {
          return fs.existsSync(path.join(pathToRedwoodInStaging, 'redwood-notag.css'));
        }
        else if (dirEntry === 'oj-redwood-notag-min.css') {
          return fs.existsSync(path.join(pathToRedwoodInStaging, 'redwood-notag.min.css'));
        }
        return fs.existsSync(path.join(pathToRedwoodInStaging, dirEntry));
      });
      assert.ok(everyExpectedEntryIsPresent, "Not all redwood files are present in staging location.");
    });
  });
});