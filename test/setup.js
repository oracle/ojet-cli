/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
var assert = require('assert');
var fs = require('fs-extra');
var util = require('./util');

var env = process.env;

before( async function () {
  const platform = util.getPlatform(env.OS);

  if (!util.noScaffold()) {
    fs.ensureDirSync(util.testDir);
    fs.emptyDirSync(util.testDir);

    // Scaffold a basic web app
    let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.APP_NAME} --norestore=true`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check that it output the right text to the command line
    assert.strictEqual(util.norestoreSuccess(result.stdout), true, result.stderr);
    // Restore
    result = await util.execCmd(`${util.OJET_APP_COMMAND} restore`, { cwd: util.getAppDir(util.APP_NAME) });
    console.log(result.stdout);
  }

  // Always copy
  util.copyOracleJetTooling(`${util.APP_NAME}`);
    
  if (!util.noScaffold()) {
    // Add hybrid
    result = await util.execCmd(`${util.OJET_APP_COMMAND} add hybrid --platform=${platform}`, { cwd: util.getAppDir(util.APP_NAME) });
    console.log(result.stdout);

    // Scaffold hybrid app from scratch
    result = await util.execCmd(`${util.OJET_COMMAND} create ${util.HYBRID_APP_NAME} --template=navbar --appid=my.id --appName=testcase --hybrid --platform=${platform}`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
  }
  
  // Always copy
  util.copyOracleJetTooling(`${util.HYBRID_APP_NAME}`);

  if (!util.noScaffold()) {
    // Scaffold TS app from scratch
    result = await util.execCmd(`${util.OJET_COMMAND} create ${util.TS_APP_NAME} --template=navbar --typescript`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
  }
  
  // Always copy
  util.copyOracleJetTooling(`${util.TS_APP_NAME}`);  
});
