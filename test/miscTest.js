/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const assert = require('assert');

const util = require('./util');

describe('ojet-cli', () => {
  it('should return ojet version', async () => {
    let result = await util.execCmd(`${util.OJET_COMMAND} --version`, { cwd: util.testDir });
    const version = util.getCliVersion();
    assert.equal(new RegExp(version).test(result.stdout), true, result.error);
  });
});