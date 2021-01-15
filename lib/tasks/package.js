#! /usr/bin/env node
/**
  Copyright (c) 2015, 2021, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * ## Dependencies
 */
const config = require('../../config');
const utils = require('../utils');
/**
 * # Package
 *
 * @param task
 * @param scope
 * @param parameters
 * @param options?
 */
class Package {
  constructor(task, scope, parameters, options) {
    this.task = task;
    this.scope = scope;
    this.parameters = parameters;
    this.options = options;
  }
  package() {
    switch (this.scope) {
      case config.tasks[this.task].scopes.component.name:
      case config.tasks[this.task].scopes.pack.name: {
        utils.ensureParameters(this.parameters);
        utils.ensureJetApp();
        const tooling = utils.loadTooling();
        tooling.package(this.scope, this.parameters, this.options);
        break;
      }
      case undefined:
        utils.log.error(utils.toMissingInputMessage(`${this.task}`));
        break;
      default:
        utils.log.error(utils.toNotSupportedMessage(`${config.tasks[this.task].name} ${this.scope}`));
    }
  }
}
module.exports = Package;
