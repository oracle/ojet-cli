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
  
  it('Should add theming to enable node-sass, postcss-custom-theme, postcss-calc, autoprefixer', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);
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
        // oj-redwood.css is renamed to redwood.css in the staging location so
        // we have to update the existence check:
        if (dirEntry === 'oj-redwood.css') {
          return fs.existsSync(path.join(pathToRedwoodInStaging, 'redwood.css'));
        } 
        // Similarly, oj-redwood-min.css is renamed to redwood.min.css in the staging 
        // location so we have to update the existence check:
        else if (dirEntry === 'oj-redwood-min.css') {
          return fs.existsSync(path.join(pathToRedwoodInStaging, 'redwood.min.css'));
        }
        return fs.existsSync(path.join(pathToRedwoodInStaging, dirEntry));
      });
      assert.ok(everyExpectedEntryIsPresent, "Not all redwood files are present in staging location.");
    });
  });
});