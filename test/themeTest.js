/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

const testDir = path.resolve('test_result/test');
const appDir = path.resolve(testDir, util.THEME_APP_NAME);

describe('PCSS Theme Test', () => {
  it('Should add theming to enable node-sass, postcss-custom-theme, postcss-calc, autoprefixer', async () => {
    const result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: appDir });
    assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);
  });
  describe('Create and compile pcss theme', () => {
    it('Should create theme after add theming', async () => {
      const removetheme = path.resolve(appDir, 'src/themes');
      fs.removeSync(removetheme);
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme themename`, {cwd: appDir});
      assert.equal(/with css variables support/.test(result.stdout), true, result.stdout);
    });

    it('Should compile pcss theme', async () => {
      const result = await util.execCmd(`${util.OJET_APP_COMMAND} build --theme=themename`, {cwd: appDir});
      assert.equal(/pcss compile finished/.test(result.stdout), true, result.stdout);
    });
    
  });
});