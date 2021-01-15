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
// 3rd party
const argv = require('minimist')(process.argv.slice(2));

// Oracle utils
const config = require('./config');
const pckg = require('./package');
const utils = require('./lib/utils');

// Oracle command libs
// Tasks
const add = require('./lib/tasks/add');
const buildAndServe = require('./lib/tasks/build.serve');
const clean = require('./lib/tasks/clean');
const configure = require('./lib/tasks/configure');
const create = require('./lib/tasks/create');
const help = require('./lib/tasks/help');
const list = require('./lib/tasks/list');
const PackageClass = require('./lib/tasks/package');
const publish = require('./lib/tasks/publish');
const remove = require('./lib/tasks/remove');
const restore = require('./lib/tasks/restore');
const search = require('./lib/tasks/search');
const strip = require('./lib/tasks/strip');

/**
 * # ojet CLI - Oracle JET command line interface
 *
 * Management (scaffolding, building, serving, theming, publishing ...) for:
 * Oracle JET web and hybrid applications
 *
 * @public
 */
module.exports = (function () {
  process.title = 'ojet';

  // This is the minimist parser output of the user input
  // https://www.npmjs.com/package/minimist
  //
  // $ojet command1 command2 --option1=value1 -o2 value2
  // { _: [command1, command2],
  //   option1: value1,
  //   o2: value2
  // }

  // Extract commands
  const commands = argv._;
  // Extract options from the parsed user input
  let options = utils.cloneObject(argv);
  delete options._; // Delete commands
  // Convert boolean values
  options = _convertStringBooleansToRealBooleans(options);

  // Is verbose?
  process.env.verbose = options.verbose || false;

  // Print original input
  if (utils.isVerbose()) {
    utils.log('Original input:');
    _printUserInput(commands, options);
  }

  // Apply task aliases
  const helpTaskNameUsed = commands.indexOf('help') === 0;
  const n = helpTaskNameUsed ? 1 : 0;
  commands[n] = _applyTaskAliases(commands[n]);
  if (commands[n + 1]) {
    commands[n + 1] = _applyScopeAliases(commands[n], commands[n + 1]);
  }

  // Apply options aliases
  if (!utils.isObjectEmpty(options)) {
    options = _applyOptionsAliases(options);
  }

  // Print user input after applying aliases to commands and options
  if (utils.isVerbose()) {
    utils.log('Input after aliases applied (if not used, same as above).');
    _printUserInput(commands, options);
  }

  // Help flag used?
  if (utils.hasHelpFlag(options)) {
    help(commands);
  } else {
    // Here's the main logic
    const task = commands[0];
    const scope = commands[1];
    const parameters = commands.slice(2);
    const tasksObj = config.tasks;
    switch (commands[0]) {
      // App
      case tasksObj.add.name:
        add(scope, parameters, options);
        break;
      case tasksObj.build.name:
      case tasksObj.serve.name:
        buildAndServe(task, scope, parameters, options);
        break;
      case tasksObj.configure.name:
        configure(task, scope, parameters, options);
        break;
      case tasksObj.clean.name:
        clean(scope, parameters);
        break;
      case tasksObj.create.name:
        create(scope, parameters, options);
        break;
      case tasksObj.help.name:
        help(commands);
        break;
      case tasksObj.list.name:
        list(scope, parameters);
        break;
      case tasksObj.package.name: {
        const packageInstance = new PackageClass(task, scope, parameters, options);
        packageInstance.package();
        break;
      }
      case tasksObj.publish.name:
        publish(task, scope, parameters, options);
        break;
      case tasksObj.remove.name:
        remove(scope, parameters, options);
        break;
      case tasksObj.restore.name:
        restore(task, scope, parameters, options);
        break;
      case tasksObj.search.name:
        search(task, scope, parameters, options);
        break;
      case tasksObj.strip.name:
        strip(parameters);
        break;
      case undefined:
        if (utils.hasProperty(options, 'version')) {
          utils.log(`${pckg.description}, version: ${pckg.version}`);
        } else {
          help(commands);
        }
        break;
      default:
        utils.log.error(utils.toNotSupportedMessage(`${task}`));
    }
  }
}());

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
 * ## _convertStringBooleansToRealBooleans
 * 'true' & 'false' parsed from the command line are of a string type.
 * This is a conversion to real booleans.
 * E.g. ojet serve --build false
 *
 * @private
 * @param {Object} options
 * @return {Object} optionsCopy
 */
function _convertStringBooleansToRealBooleans(options) {
  const optionsCopy = utils.cloneObject(options);
  Object.keys(optionsCopy).forEach((key) => {
    if (utils.hasProperty(optionsCopy, key)) {
      if (optionsCopy[key] === 'true') {
        optionsCopy[key] = true;
      } else if (options[key] === 'false') {
        optionsCopy[key] = false;
      }
    }
  });
  return optionsCopy;
}

/**
 * ## _printUserInput
 *
 * @private
 * @param {Array} commands
 * @param {Object} options
 */
function _printUserInput(commands, options) {
  const optionsCopy = utils.cloneObject(options);
  if (commands.length > 0) {
    utils.log('Commands:', commands);
  }
  if (!utils.isObjectEmpty(optionsCopy)) {
    if (utils.hasProperty(optionsCopy, 'password')) {
      // Do not printout password value
      optionsCopy.password = '*'.repeat(optionsCopy.password.length);
    }
    utils.log('Options:', optionsCopy);
  }
}
