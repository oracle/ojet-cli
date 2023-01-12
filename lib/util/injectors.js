/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

function getInjectorTagsRegExp(starttag, endtag) {
  const start = escapeForRegExp(starttag);
  const end = escapeForRegExp(endtag);
  const startNoSpace = escapeForRegExp(starttag.replace(/\s/g, ''));
  const endNoSpace = escapeForRegExp(endtag.replace(/\s/g, ''));
  return new RegExp(`([\t ]*)(${start}|${startNoSpace})((\\n|\\r|.)*?)(${end}|${endNoSpace})`, 'gi');
}

function escapeForRegExp(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function getLineEnding(content) {
  return /\r\n/.test(String(content)) ? '\r\n' : '\n';
}

function removeInjectorTokensContent({ content, pattern, eol, startTag, endTag }) {
  const injectResult = content.replace(pattern, () =>
    startTag + eol + endTag
  );
  return injectResult;
}

const scriptsInjector = {
  startTag: '<!-- injector:scripts -->',
  endTag: '<!-- endinjector -->'
};

const themeInjector = {
  startTag: '<!-- injector:theme -->',
  endTag: '<!-- endinjector -->'
};

module.exports = {
  getInjectorTagsRegExp,
  getLineEnding,
  removeInjectorTokensContent,
  scriptsInjector,
  themeInjector
};
