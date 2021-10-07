/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');
const env = process.env;
const Ojet = require('../');

before(async () => {
  const platform = util.getPlatform(env.OS);

  // Initial copy of current oraclejet-tooling build over "global" ojet-cli install
  util.copyOracleJetTooling();

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

    // Scaffold a basic app without a name
    result = await util.execCmd(`${util.OJET_COMMAND} create --norestore=true`, { cwd: util.testDir });
    // Check that it worked
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
  }

  // Always copy
  util.copyOracleJetTooling(util.APP_NAME);

  if (!util.noScaffold() && !util.noHybrid()) {
    // Add hybrid
    let result = await util.execCmd(`${util.OJET_APP_COMMAND} add hybrid --platform=${platform}`, { cwd: util.getAppDir(util.APP_NAME) });
    console.log(result.stdout);

    // Scaffold hybrid app from scratch
    result = await util.execCmd(`${util.OJET_COMMAND} create ${util.HYBRID_APP_NAME} --use-global-tooling --template=navbar --appid=com.oraclecorp.dummy.myapp --appName=testcase --hybrid --platform=${platform}`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
  }

/*  if (!util.noHybrid()) {
    // Always copy
    util.copyOracleJetTooling(util.HYBRID_APP_NAME);
  }*/

  if (!util.noScaffold()) {
    // Scaffold TS app from scratch
    const result = await util.execCmd(`${util.OJET_COMMAND} create ${util.TS_APP_NAME} --use-global-tooling --template=navbar --typescript`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
  }

  // Always copy
  //util.copyOracleJetTooling(util.TS_APP_NAME);

  if (!util.noScaffold()) {
    // Scaffold component js app from scratch
    let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.COMPONENT_APP_NAME} --use-global-tooling --template=navbar`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
    // Set exchange url for exchange-related tests
    result = await util.execCmd(`${util.OJET_APP_COMMAND} configure --exchange-url=${util.EXCHANGE_URL}`, { cwd: util.getAppDir(util.COMPONENT_APP_NAME) });
    console.log(result.stdout);
  }

  // Always copy
  //util.copyOracleJetTooling(util.COMPONENT_APP_NAME);

  if (!util.noScaffold()) {
    // Scaffold component ts app from scratch
    let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.COMPONENT_TS_APP_NAME} --use-global-tooling --template=navbar --typescript`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
    // Set exchange url for exchange-related tests
    result = await util.execCmd(`${util.OJET_APP_COMMAND} configure --exchange-url=${util.EXCHANGE_URL}`, { cwd: util.getAppDir(util.COMPONENT_TS_APP_NAME) });
    console.log(result.stdout);
  }

  // Always copy
  //util.copyOracleJetTooling(util.COMPONENT_TS_APP_NAME); 

  if (!util.noScaffold()) {
    // Scaffold a basic web app
    let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.THEME_APP_NAME} --use-global-tooling --norestore=true`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check that it output the right text to the command line
    assert.strictEqual(util.norestoreSuccess(result.stdout), true, result.stderr);
    // Restore
    result = await util.execCmd(`${util.OJET_APP_COMMAND} restore`, { cwd: util.getAppDir(util.THEME_APP_NAME) });
  }

  // Always copy
  //util.copyOracleJetTooling(util.THEME_APP_NAME);

  if (!util.noScaffold()) {
    // Scaffold component pwa app from scratch
    let result = await util.execCmd(`${util.OJET_COMMAND} create ${util.PWA_APP_NAME} --use-global-tooling`, { cwd: util.testDir });
    console.log(result.stdout);
    // Check output
    assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
    // copy oraclejet-tooling into app
    //util.copyOracleJetTooling(util.PWA_APP_NAME); 
    // convert app to pwa
    result = await util.execCmd(`${util.OJET_APP_COMMAND} add pwa`, { cwd: util.getAppDir(util.PWA_APP_NAME) });
    // check for correct output
    assert.ok(/add pwa complete/.test(result.stdout), result.error);
  }

  // Always copy
  //util.copyOracleJetTooling(util.PWA_APP_NAME);

  if (!util.noScaffold()) {
    // Scaffold webTsApiTest application using ojet API
    const ojet = new Ojet({ cwd: util.testDir, logs: false });
    try {
      await ojet.execute({
        task: 'create',
        parameters: [util.API_APP_NAME],
        options: {
          template: path.join(util.getTemplatesDir(), util.API_APP_NAME),
        }
      });
      assert.ok(true);
    } catch {
      assert.ok(false, 'Error running ojet.execute({ task: "create" })');
    }
  }

  // Always copy
  util.copyOracleJetTooling(util.API_APP_NAME);

  if (!util.noScaffold()) {
    // Scaffold vdomTest application using API
    const ojet = new Ojet({ cwd: util.testDir, logs: false });
    try {
      const executeOptions = {
        task: 'create',
        parameters: [util.VDOM_APP_NAME],
        options: {
          template: 'basic',
          vdom: true
        }
      };
      await ojet.execute(executeOptions);
      assert.ok(true);
    } catch {
      assert.ok(false, `Error running ojet.execute with ${executeOptions}`);
    }
  }

  // Always copy
  util.copyOracleJetTooling(util.VDOM_APP_NAME);
});
