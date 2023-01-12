#! /usr/bin/env node
/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

const config = require('../../config');
const pckg = require('../../package.json');
const utils = require('../util/utils');
const add = require('./add');
const buildAndServe = require('./build.serve');
const clean = require('./clean');
const configure = require('./configure');
const create = require('./create');
const help = require('./help');
const list = require('./list');
const PackageClass = require('./package');
const publish = require('./publish');
const remove = require('./remove');
const restore = require('./restore');
const search = require('./search');
const strip = require('./strip');

module.exports = function (commands, options) {
  function _logPackageVer(pkg) {
    const ver = utils.getPackageVersion(pkg);
    if (ver) {
      utils.log(`     ${pkg}, version: ${ver}`);
    } else {
      utils.log(`     ${pkg}, not installed`);
    }
  }

  const _commands = [...commands];
  let _options = { ...options };
  process.title = 'ojet';
  process.env.verbose = _options.verbose || false;
  if (utils.isVerbose()) {
    utils.log('Original input:');
    _printUserInput(_commands, _options);
  }
  // Apply task aliases
  const helpTaskNameUsed = _commands.indexOf('help') === 0;
  const n = helpTaskNameUsed ? 1 : 0;
  _commands[n] = _applyTaskAliases(_commands[n]);
  if (_commands[n + 1]) {
    // Apply scope aliases
    _commands[n + 1] = _applyScopeAliases(_commands[n], _commands[n + 1]);
  }
  // Apply options aliases
  if (!utils.isObjectEmpty(_options)) {
    _options = _applyOptionsAliases(_options);
  }
  // Print user input after applying aliases to _commands and options
  if (utils.isVerbose()) {
    utils.log('Input after aliases applied (if not used, same as above).');
    _printUserInput(_commands, _options);
  }
  // Help flag used?
  if (utils.hasHelpFlag(_options)) {
    return help(_commands);
  }
  // Here's the main logic
  const task = _commands[0];
  const scope = _commands[1];
  const parameters = _commands.slice(2);
  const tasksObj = config.tasks;
  switch (_commands[0]) {
    // App
    case tasksObj.add.name:
      return add(scope, parameters, _options);
    case tasksObj.build.name:
    case tasksObj.serve.name:
      return buildAndServe(task, scope, parameters, _options);
    case tasksObj.configure.name:
      return configure(task, scope, parameters, _options);
    case tasksObj.clean.name:
      return clean(scope, parameters);
    case tasksObj.create.name:
      return create(scope, parameters, _options);
    case tasksObj.help.name:
      return help(_commands);
    case tasksObj.list.name:
      return list(scope, parameters);
    case tasksObj.package.name: {
      const packageInstance = new PackageClass(task, scope, parameters, _options);
      return packageInstance.package();
    }
    case tasksObj.publish.name:
      return publish(task, scope, parameters, _options);
    case tasksObj.remove.name:
      return remove(scope, parameters, _options);
    case tasksObj.restore.name:
      return restore(task, scope, parameters, _options);
    case tasksObj.search.name:
      return search(task, scope, parameters, _options);
    case tasksObj.strip.name:
      return strip(parameters);
    case undefined:
      if (utils.hasProperty(_options, 'version')) {
        utils.log(`${pckg.description}, version: ${pckg.version}`);
        _logPackageVer('@oracle/oraclejet-tooling');
        _logPackageVer('@oracle/oraclejet-templates');
        _logPackageVer('@oracle/oraclejet');
        _logPackageVer('@oracle/oraclejet-core-pack');
        _logPackageVer('@oracle/oraclejet-preact');
        _logPackageVer('typescript');
        _logPackageVer('webpack');
        _logPackageVer('node-sass');

        return Promise.resolve();
      }
      return help(_commands);
    default:
      utils.log.error(utils.toNotSupportedMessage(`${task}`));
      return Promise.reject();
  }
};

/**
 * ## _applyTaskAliases
 * If alias has been used, this translates it to the default name
 * E.g. ojet a plugin > ojet add plugin
 *
 * @private
 * @param {string} task        - task name, the verb
 * @returns {string} inputTask - task in default name || original input
 */
function _applyTaskAliases(task) {
  let taskCopy = task; // Make a 'copy' to pass eslint (no-param-reassign)
  // Loop over tasks
  const tasksKeyList = Object.keys(config.tasks);
  for (let indexTask = 0; indexTask < tasksKeyList.length; indexTask += 1) {
    const taskKey = tasksKeyList[indexTask];
    if (taskCopy === taskKey) {
      break; // Task matches the name. No need to loop further.
    } else {
      // Loop over all possible aliases
      const loopedTaskObj = config.tasks[taskKey];
      if (utils.hasProperty(loopedTaskObj, 'aliases') && loopedTaskObj.aliases.indexOf(taskCopy) > -1) {
        // 1. Replace in process.argv so that Grunt can consume it
        const args = process.argv;
        const indexArg = args.indexOf(taskCopy);
        args.splice(indexArg, 1, taskKey);
        // 2. Replace in user input
        taskCopy = taskKey;
        break;
      }
    }
  }
  return taskCopy;
}

/**
 * ## _applyScopeAliases
 * Translates command aliases and shortcuts to default names
 * E.g. ojet add boom > ojet add explosion
 *
 * @private
 * @param {string} task  - task name, the verb
 * @param {string} scope - scope, the noun
 */
function _applyScopeAliases(task, scope) {
  let scopeCopy = scope; // Make a 'copy' to pass eslint (no-param-reassign)
  const taskObj = config.tasks[task];
  if (taskObj && utils.hasProperty(taskObj, 'scopes')) {
    const scopesKeyList = Object.keys(taskObj.scopes);
    for (let indexScope = 0; indexScope < scopesKeyList.length; indexScope += 1) {
      const scopeKey = scopesKeyList[indexScope];
      const scopeObject = taskObj.scopes[scopeKey];
      if (scopeCopy === scopeKey) {
        break; // Scope matches the name. No need to loop further.
      } else if (utils.hasProperty(scopeObject, 'aliases') && scopeObject.aliases.indexOf(scopeCopy) > -1) {
        // Replace in user input
        scopeCopy = scopeKey;
        break;
      }
    }
  }
  return scopeCopy;
}

/**
 * ## _applyOptionsAliases
 *
 * @private
 * @param {Object} options
 * @return {Object} optionsCopy
 */
function _applyOptionsAliases(options) {
  const checkedOptions = {};
  Object.keys(options).forEach((originalOptionKey) => {
    let globalOptionFound = false;
    let commandOptionFound = false;
    // 1. Check global options
    const globalOptionsKeyList = Object.keys(config.globalOptions);
    for (let indexOption = 0; indexOption < globalOptionsKeyList.length; indexOption += 1) {
      const globalOptionKey = globalOptionsKeyList[indexOption];
      if (originalOptionKey === globalOptionKey) {
        // Full name used. Alias name was not used. Stop looping.
        checkedOptions[originalOptionKey] = options[originalOptionKey];
        globalOptionFound = true;
        break;
      } else {
        // Check potential aliases
        const globalOptionObject = config.globalOptions[globalOptionKey];
        // If alias detected, replace it with full option name
        if (utils.hasProperty(globalOptionObject, 'aliases') &&
          globalOptionObject.aliases.indexOf(originalOptionKey) > -1) {
          checkedOptions[globalOptionKey] = options[originalOptionKey];
          globalOptionFound = true;
          break;
        }
      }
    }
    // 2. Check command options
    if (!globalOptionFound) {
      const tasksKeyList = Object.keys(config.tasks);
      commandOptionsIteration: // eslint-disable-line
      for (let indexTask = 0; indexTask < tasksKeyList.length; indexTask += 1) {
        const taskKey = tasksKeyList[indexTask];
        const taskObject = config.tasks[taskKey];
        if (utils.hasProperty(taskObject, 'scopes')) {
          const scopesKeyList = Object.keys(taskObject.scopes);
          for (let indexScope = 0; indexScope < scopesKeyList.length; indexScope += 1) {
            const scopeKey = scopesKeyList[indexScope];
            const scopeObject = taskObject.scopes[scopeKey];
            if (utils.hasProperty(scopeObject, 'options')) {
              const optionsKeyList = Object.keys(scopeObject.options);
              for (let indexOption = 0; indexOption < optionsKeyList.length; indexOption += 1) {
                const optionKey = optionsKeyList[indexOption];
                const optionObject = scopeObject.options[optionKey];
                if (originalOptionKey === optionKey) {
                  // Full name used. Alias name was not used. Stop looping.
                  checkedOptions[originalOptionKey] = options[originalOptionKey];
                  commandOptionFound = true;
                  break commandOptionsIteration; // eslint-disable-line
                } else if (
                  utils.hasProperty(optionObject, 'aliases') &&
                  optionObject.aliases.indexOf(originalOptionKey) > -1
                ) {
                  // If alias detected, replace it with full option name
                  checkedOptions[optionKey] = options[originalOptionKey];
                  commandOptionFound = true;
                  break commandOptionsIteration; // eslint-disable-line
                }
              }
            }
          }
        }
      }
    }
    // 3. Keep option as-is
    if (!globalOptionFound && !commandOptionFound) {
      checkedOptions[originalOptionKey] = options[originalOptionKey];
    }
  });
  return checkedOptions;
}

/**
 * ## _printUserInput
 *
 * @private
 * @param {Array} _commands
 * @param {Object} options
 */
function _printUserInput(_commands, options) {
  const optionsCopy = utils.cloneObject(options);
  if (_commands.length > 0) {
    utils.log('_commands:', _commands);
  }
  if (!utils.isObjectEmpty(optionsCopy)) {
    if (utils.hasProperty(optionsCopy, 'password')) {
      // Do not printout password value
      optionsCopy.password = '*'.repeat(optionsCopy.password.length);
    }
    utils.log('Options:', optionsCopy);
  }
}
