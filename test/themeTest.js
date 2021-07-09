/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

const testDir = path.resolve('../test_result');
const appDir = path.resolve(testDir, util.THEME_APP_NAME);

describe('PCSS Theme Test', () => {
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
    
  });
});