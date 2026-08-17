/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const template = require('../common/template');

describe('template URL handling', () => {
  it('should accept HTTPS template URLs', () => {
    const url = 'https://example.com/template.zip';

    assert.equal(template._toTemplateUrl(url), url);
  });

  it('should accept loopback HTTP template URLs', () => {
    [
      'http://localhost:8080/template.zip',
      'http://127.0.0.1:8080/template.zip',
      'http://[::1]:8080/template.zip'
    ].forEach((url) => {
      assert.equal(template._toTemplateUrl(url), url);
    });
  });

  it('should reject non-loopback HTTP template URLs', () => {
    [
      'http://example.com/template.zip',
      'http://0.0.0.0:8080/template.zip',
      'http://10.0.0.1/template.zip',
      'http://192.168.0.1/template.zip'
    ].forEach((url) => {
      assert.throws(
        () => template._toTemplateUrl(url),
        /HTTP template URLs are not supported/
      );
    });
  });

  it('should ignore non-URL template values', () => {
    assert.equal(template._toTemplateUrl('basic'), null);
    assert.equal(template._toTemplateUrl('/path/to/template.zip'), null);
  });
});
