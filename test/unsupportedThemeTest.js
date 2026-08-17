/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const cliConfig = require('../config');
const cliConstants = require('../lib/util/constants');

describe('Unsupported theme templates', () => {
  const unsupportedTheme = _getUnsupportedTheme();

  function _getUnsupportedTheme() {
    const candidatePaths = [
      path.join(__dirname, '..', 'node_modules', '@oracle', 'oraclejet-tooling', 'lib', 'constants'),
      path.join(__dirname, '..', '..', 'oraclejet-tooling', 'lib', 'constants')
    ];

    const constants = candidatePaths.reduce((result, candidatePath) => {
      if (result) {
        return result;
      }
      try {
        return require(candidatePath); // eslint-disable-line global-require, import/no-dynamic-require
      } catch (error) {
        return null;
      }
    }, null);

    if (!constants) {
      throw new Error('Unable to resolve oraclejet-tooling constants.');
    }
    return constants.UNSUPPORTED_THEMES[0];
  }

  it('should not include unsupported theme CSS in the Karma test template', () => {
    const karmaTemplatePath = path.join(__dirname, '..', 'template', 'test-config-karma', 'karma.conf.js');
    const templateContent = fs.readFileSync(karmaTemplatePath, 'utf8');

    assert.strictEqual(templateContent.includes(`oj-${unsupportedTheme}`), false, templateContent);
  });

  it('should not include unsupported theme site CSS in migrated app fixtures', () => {
    const templatesRoot = path.join(__dirname, 'templates');
    const filesToCheck = [
      path.join(templatesRoot, 'webMigrationTest', 'src', 'index.html'),
      path.join(templatesRoot, 'webTsApiTest', 'src', 'index.html'),
      path.join(templatesRoot, 'webpackMigrationTest', 'src', 'index.html')
    ];

    filesToCheck.forEach((file) => {
      const templateContent = fs.readFileSync(file, 'utf8');
      assert.strictEqual(templateContent.includes(`demo-${unsupportedTheme}-site-min.css`), false, file);
    });
  });

  it('should not expose or forward the obsolete SVG CLI option', () => {
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(cliConfig.tasks.build.scopes.app.options, 'svg'),
      false
    );
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(cliConfig.tasks.serve.scopes.app.options, 'svg'),
      false
    );
    assert.strictEqual(cliConstants.BUILD_OPTIONS.includes('svg'), false);
    assert.strictEqual(cliConstants.SERVE_OPTIONS.includes('svg'), false);

    [
      path.join(__dirname, '..', 'lib', 'tooling', 'build.js'),
      path.join(__dirname, '..', 'lib', 'tooling', 'serve.js')
    ].forEach((file) => {
      const fileContent = fs.readFileSync(file, 'utf8');
      assert.strictEqual(fileContent.includes('options.svg'), false, file);
    });
  });
});
