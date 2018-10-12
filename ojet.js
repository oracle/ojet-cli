#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
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

  // Apply aliases
  const helpTaskNameUsed = commands.indexOf('help') === 0;
  const n = helpTaskNameUsed ? 1 : 0;
  commands[n] = _applyTaskAliases(commands[n]);
  if (commands[n + 1]) {
    commands[n + 1] = _applyScopeAliases(commands[n], commands[n + 1]);
  }

  // Final user input
  if (utils.isVerbose()) {
    if (commands.length > 0) {
      utils.log('User input commands:', commands);
    }
    if (!utils.isObjectEmpty(options)) {
      utils.log('User input options:', options);
    }
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
      case tasksObj.publish.name:
        publish(task, scope, parameters, options);
        break;
      case tasksObj.remove.name:
        remove(scope, parameters);
        break;
      case tasksObj.restore.name:
        restore(task, scope, parameters);
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
  let inputTask = task; // Make a 'copy' to pass eslint (no-param-reassign)
  // Loop over tasks
  // Disabling eslint to be able to use 'break'
  for (const taskName in config.tasks) { // eslint-disable-line
    if (inputTask === taskName) {
      break; // Task matches the name. No need to loop further.
    } else {
      // Loop over all possible aliases
      const loopedTaskObj = config.tasks[taskName];
      if (utils.hasProperty(loopedTaskObj, 'aliases') && loopedTaskObj.aliases.indexOf(inputTask) > -1) {
        // 1. Replace in process.argv so that Grunt can consume it
        const args = process.argv;
        const i = args.indexOf(inputTask);
        args.splice(i, 1, taskName);
        // 2. Replace in user input
        inputTask = taskName;
        break;
      }
    }
  }
  return inputTask;
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
  let inputScope = scope; // Make a 'copy' to pass eslint (no-param-reassign)
  const taskObj = config.tasks[task];
  if (taskObj) {
    // Disabling eslint to be able to use 'break'
    for (const scopeName in taskObj.scopes) { // eslint-disable-line
      const loopedScopeObj = taskObj.scopes[scopeName];
      if (inputScope === scopeName) {
        break; // Scope matches the name. No need to loop further.
      } else if (utils.hasProperty(loopedScopeObj, 'aliases') && loopedScopeObj.aliases.indexOf(inputScope) > -1) {
        // Replace in user input
        inputScope = scopeName;
        break;
      }
    }
  }
  return inputScope;
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
