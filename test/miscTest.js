/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
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
});