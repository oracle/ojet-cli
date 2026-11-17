/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

describe('Generated test app cleanup', () => {
  const appNames = ['cleanupTestOne', 'cleanupTestTwo'];
  const unrelatedAppName = 'cleanupTestUnrelated';

  beforeEach(() => {
    [...appNames, unrelatedAppName].forEach((appName) => {
      const appDir = util.getAppDir(appName);
      fs.ensureDirSync(path.join(appDir, 'node_modules', 'example-package'));
      fs.writeFileSync(path.join(appDir, 'node_modules', 'example-package', 'index.js'), 'module.exports = {};');
    });
  });

  afterEach(() => {
    [...appNames, unrelatedAppName].forEach((appName) => {
      fs.removeSync(util.getAppDir(appName));
    });
  });

  it('removes every named app without removing other generated apps', () => {
    util.removeAppDirs(appNames);
    assert.doesNotThrow(() => util.removeAppDirs(appNames));

    appNames.forEach((appName) => {
      assert.equal(fs.existsSync(util.getAppDir(appName)), false, `${appName} was not removed`);
    });
    assert.equal(fs.existsSync(util.getAppDir(unrelatedAppName)), true, `${unrelatedAppName} was removed`);
  });
});
