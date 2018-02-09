/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const build = require('./build');
const serve = require('./serve');
const utils = require('../utils');
/*
 * Options and Arguments processing before Invoking tooling APIs
 */

module.exports = function (task, scope, parameter, options) {
  const scopeCheckedForAppValue = scope === 'app' ? undefined : scope;
  const platform = parameter === undefined ? scopeCheckedForAppValue : parameter;
  if (task === 'build') {
    build(platform, options);
  } else if (task === 'serve') {
    serve(platform, options);
  } else {
    utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  }
};
