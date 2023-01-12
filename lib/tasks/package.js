#! /usr/bin/env node
/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * ## Dependencies
 */
const config = require('../../config');
const utils = require('../util/utils');
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

        // Fix to force css build doing pack that leads to a build
        this.options.themes = utils.validateThemes(this.options);
        this.options.sassCompile = (this.options.nosass) ? false :
          this.options.sass || (this.options.sass === undefined);
        this.options.pcssCompile = (!this.options.sassCompile) ? false : this.options.pcss || true;

        const tooling = utils.loadTooling();
        return tooling.package(this.scope, this.parameters, this.options);
      }
      case undefined:
        utils.log.error(utils.toMissingInputMessage(`${this.task}`));
        return Promise.reject();
      default:
        utils.log.error(utils.toNotSupportedMessage(`${config.tasks[this.task].name} ${this.scope}`));
        return Promise.reject();
    }
  }
}
module.exports = Package;
