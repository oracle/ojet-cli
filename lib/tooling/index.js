/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const build = require('./build');
const serve = require('./serve');
const utils = require('../util/utils');
/*
 * Options and Arguments processing before Invoking tooling APIs
 */

module.exports = function (task, scope, parameter, options) {
  const scopeCheckedForAppValue = (scope === 'app' || scope === 'component') ? undefined : scope;
  const platform = parameter === undefined ? scopeCheckedForAppValue : parameter;
  if (task === 'build') {
    return build(platform, options);
  } else if (task === 'serve') {
    return serve(platform, options);
  }
  utils.log.error(utils.toNotSupportedMessage(`${task} ${scope}`));
  return Promise.reject();
};
