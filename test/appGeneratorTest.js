/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const assert = require('assert');
const path = require('path');

const common = require('../common');
const generateApp = require('../generators/app');

describe('App generator errors', () => {
  const original = {};

  beforeEach(() => {
    original.validateFlags = common.validateFlags;
    original.ojet = process.env.OJET;
    process.env.OJET = JSON.stringify({ logs: false });
  });

  afterEach(() => {
    common.validateFlags = original.validateFlags;
    if (original.ojet === undefined) {
      delete process.env.OJET;
    } else {
      process.env.OJET = original.ojet;
    }
  });

  it('should preserve a failed scaffold step error', async () => {
    const expectedError = new Error('webpack dependency installation failed');
    common.validateFlags = () => Promise.reject(expectedError);

    await assert.rejects(
      () => generateApp('webpackFailureApp', {}),
      error => error === expectedError
    );
  });

  it('should pin Webpack to the webpack-dev-server peer-compatible version', () => {
    const config = require(path.join(__dirname, '..', 'template', 'common', 'oraclejetconfig.json'));
    const libraries = config.webpackLibraries.split(' ');

    assert.ok(libraries.includes('webpack@5.101.0'));
    assert.ok(libraries.includes('webpack-dev-server'));
    assert.ok(!libraries.includes('webpack-dev-server@4.15.2'));
  });
});
