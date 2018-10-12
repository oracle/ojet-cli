/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const assert = require('assert');
const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');

const utils = require('./utils');
const _ = require('lodash');
const appName = 'testApp';
const testDir = path.resolve('test_result');
const appDir = path.resolve(`${appName}`);
const ojet = "node_modules/@oracle/ojet-cli/ojet.js";
const ojetAbs = path.resolve(ojet);

const ojetUtil = require(path.resolve("node_modules/@oracle/ojet-cli/lib", "utils"));
const ojetPaths = require(path.resolve("node_modules/@oracle/ojet-cli/lib", "utils.paths"));
describe("Customization Test", function ()
{ 
  const buildOps = ojetUtil.getBuildCustomizedConfig();
  const serveOps = ojetUtil.getServeCustomizedConfig();

  it("Load oraclejet build config", function(){
    assert(!_.isEmpty(buildOps));
  });

  it("Load oraclejet serve config", function(){
    assert(!_.isEmpty(serveOps));
  });

  it("Validate serve config", function(){
    const validServe = ojetUtil.validateServeOptions(serveOps);
    assert(_.isEmpty(validServe));
  });  

  
  it("Get default paths", function(){
    const defaultPaths = ojetPaths.getDefaultPaths();
    assert(!_.isEmpty(defaultPaths));

  });  

  it("Validate configured paths", function(){
    const defaultPaths = ojetPaths.getDefaultPaths();
    assert(defaultPaths.source == 'src');
    assert(defaultPaths.sourceWeb == 'src-web');
    assert(defaultPaths.sourceHybrid == 'src-hybrid');
    assert(defaultPaths.sourceJavascript == 'js');
    assert(defaultPaths.sourceThemes == 'themes');
    assert(defaultPaths.stagingHybrid == 'hybrid');
    assert(defaultPaths.stagingWeb == 'web');
    assert(defaultPaths.stagingThemes == 'themes');
  });  

   
  it("Get configured paths", function(){
      const confPaths = ojetPaths.getConfiguredPaths(path.resolve());
      assert(!_.isEmpty(confPaths));
  });  

  it("Validate configured paths", function(){
      const defaultPaths = ojetPaths.getDefaultPaths();
      const confPaths = ojetPaths.getConfiguredPaths(path.resolve());
      assert(_.isEqual(confPaths, defaultPaths));
  });  

  it("Validate is Cwd is JET App", function(){
      const isJetApp = ojetUtil.ensureJetApp();
      assert(_.isEqual(isJetApp, undefined));
  });  

  it("Validate util ensure parameters", function(){
      assert.doesNotThrow(() =>
      {
        const isJetApp = ojetUtil.ensureParameters('component');
      });
  });  
});

