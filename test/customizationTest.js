/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');

const _ = require('lodash');

const util = require('./util');
const CONSTANTS = require('../lib/utils.constants');
const ojetUtil = require('../lib/utils');
const ojetPaths = require('../lib/utils.paths');

describe("Customization Test", () => {
  it("should load oraclejet build config", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const buildOps = ojetUtil.getBuildCustomizedConfig();
    process.chdir(wd);
    assert(!_.isEmpty(buildOps));
  });

  it("should load oraclejet serve config", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const serveOps = ojetUtil.getServeCustomizedConfig();
    process.chdir(wd);
    assert(!_.isEmpty(serveOps));
  });

  it("should validate serve config", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const serveOps = ojetUtil.getServeCustomizedConfig();
    process.chdir(wd);
    const validServe = ojetUtil.validateServeOptions(serveOps);
    assert(_.isEmpty(validServe));
  });  

  
  it("should get default paths", () => {
    const defaultPaths = ojetPaths.getDefaultPaths();
    assert(!_.isEmpty(defaultPaths));
  });  

  it("should validate configured paths", () => {
    const defaultPaths = ojetPaths.getDefaultPaths();
    assert(defaultPaths.source == 'src');
    assert(defaultPaths.sourceWeb == 'src-web');
    assert(defaultPaths.sourceHybrid == 'src-hybrid');
    assert(defaultPaths.sourceJavascript == 'js');
    assert(defaultPaths.sourceThemes == 'themes');
    assert(defaultPaths.stagingHybrid == 'hybrid');
    assert(defaultPaths.stagingWeb == 'web');
    assert(defaultPaths.stagingThemes == CONSTANTS.APP_STAGED_THEMES_DIRECTORY);
  });  

   
  it("should get configured paths", () => {
      const confPaths = ojetPaths.getConfiguredPaths(util.getAppDir(util.APP_NAME));
      assert(!_.isEmpty(confPaths));
  });  

  it("should validate configured paths", () => {
      const defaultPaths = ojetPaths.getDefaultPaths();
      const confPaths = ojetPaths.getConfiguredPaths(util.getAppDir(util.APP_NAME));
      assert(_.isEqual(confPaths, defaultPaths));
  });  

  it("should validate is cwd is JET App", () => {
    const wd = process.cwd();
    process.chdir(util.getAppDir(util.APP_NAME));
    const isJetApp = ojetUtil.ensureJetApp();
    process.chdir(wd);
    assert(_.isEqual(isJetApp, undefined));
  });  

  it("should validate util ensure parameters", () => {
      assert.doesNotThrow(() => {
        const isJetApp = ojetUtil.ensureParameters('component');
      });
  });  
});
