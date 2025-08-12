/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const util = require('./util');

describe('ojet-cli', () => {
  it('should return ojet version', async () => {
    const result = await util.execCmd(`${util.OJET_COMMAND} --version`, { cwd: util.testDir });
    const version = util.getCliVersion();
    assert.equal(new RegExp(version).test(result.stdout), true, result.error);
  });

  it('should return help text', async () => {
    let result = await util.execCmd(`${util.OJET_COMMAND} --help`, { cwd: util.testDir });
    assert.equal(new RegExp('ojet <command>').test(result.stdout), true, result.error);

    result = await util.execCmd(`${util.OJET_COMMAND} add --help`, { cwd: util.testDir });
    assert.equal(new RegExp('ojet add <scope>').test(result.stdout), true, result.error);

    result = await util.execCmd(`${util.OJET_COMMAND} add component --help`, { cwd: util.testDir });
    assert.equal(new RegExp('ojet add component <parameter').test(result.stdout), true, result.error);    
  });
});