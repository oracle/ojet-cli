#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
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
const utils = require('./lib/utils');

// Oracle command libs
const app = require('./lib/app');
const help = require('./lib/help');
const platformAndPlugin = require('./lib/platformAndPlugin');
const pckg = require('./package');
const theme = require('./lib/theme');

/**
 * # ojet CLI - Oracle JET command line interface
 *
 * Management (scaffolding, building, serving, theming, publishing ...) for:
 * Oracle JET web and hybrid applications
 *
 * @public
 * @global
 */
module.exports = (function () {
  utils.log('\x1b[42m Oracle JET CLI \x1b[0m');
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
  let commands = argv._;
  // Extract options from the parsed user input
  let options = utils.cloneObject(argv);
  delete options._; // Delete commands

  // Apply aliases/abbreviations
  if (commands[0]) {
    commands = _serialiseAppScope(commands);
    commands = _applyScopeAliases(commands);
  }
  if (commands[1]) {
    commands = _applyCommandAliases(commands);
  }
  options = _applyOptionAliases(options);

  // Final user input
  if (utils.isVerbose(options)) {
    utils.log('User input:');
    if (commands.length > 0) {
      utils.log(commands);
    }
    if (!utils.isObjectEmpty(options)) {
      utils.log(options);
    }
  }

  // Here's the main logic
  const scope = commands[0];
  const command = commands[1];
  const parameter = commands[2];

  switch (scope) {
    case config.scope.app.key:
      app(command, parameter, options);
      break;
    case config.scope.platform.key:
    case config.scope.plugin.key:
      platformAndPlugin(scope, command, parameter);
      break;
    case config.scope.theme.key:
      theme(command, parameter);
      break;
    case config.scope.help.key:
      help(command);
      break;
    case undefined:
      if (utils.hasProperty(options, 'version')) {
        utils.log(`${pckg.description}, version: ${pckg.version}`);
      } else {
        help(command);
      }
      break;
    default:
      throw utils.toError(utils.toNotSupportedMessage(`${scope}`));
  }
}());

/**
 * ## _applyCommandAliases
 * Translates command aliases and shortcuts to default names
 * E.g. ojet f boom > ojet foo explode
 *
 * @private
 * @param {Object} userCommands - Array of all commands (arguments) from the command line
 * @returns {Object} usrCmds    - Commands in default names
 */
function _applyCommandAliases(userCommands) {
  const usrCmds = userCommands;
  const curScope = config.scope[usrCmds[0]];
  if (curScope) {
    // Disabling eslint to be able to use 'break'
    for (const command in curScope.tasks) { // eslint-disable-line
      const curCommand = curScope.tasks[command];
      if (usrCmds[1] === command) {
        break; // Command matches the key. No need to loop further.
      } else if (utils.hasProperty(curCommand, 'aliases') && curCommand.aliases.indexOf(usrCmds[1]) > -1) {
        // 1. Replace in process.argv so that Grunt can consume it
        const args = process.argv;
        const i = args.indexOf(usrCmds[1]);
        if (i !== -1) {
          args.splice(i, 1, command);
        }
        // 2. Replace in user command
        usrCmds[1] = command;
        break;
      }
    }
  }
  return usrCmds;
}

/**
 * ## _applyOptionAliases
 * Translates flag aliases and shortcuts to default names
 * E.g. ojet serve -f bar --boom > ojet serve --foo=bar --explosion
 *
 * @private
 * @param {Object} options   - Object with all the flags from the command line
 * @returns {Object} options - Flags in default names
 */
function _applyOptionAliases(options) {
  const opts = Object.assign({}, options);
  // Disabling eslint to be able to use 'break'
  for (const optKey in opts) { // eslint-disable-line
    for (const confKey in config.options) { // eslint-disable-line
      if (optKey === confKey) {
        break; // Option matches the key. No need to loop further.
      } else if (config.options[confKey].indexOf(optKey) > -1) {
        opts[confKey] = options[optKey];
        delete opts[optKey];
        break;
      }
    }
  }
  return opts;
}

/**
 * ## _applyScopeAliases
 * Translates scope aliases to default names
 * E.g. ojet f boom > ojet foo boom
 *
 * @private
 * @param {Object} userCommands - Array of all commands (arguments) from the command line
 * @returns {Object} usrCmds    - Commands in default names
 */
function _applyScopeAliases(userCommands) {
  const usrCmds = userCommands; // Make a 'copy' to pass eslint (no-param-reassign)
  // Disabling eslint to be able to use 'break'
  for (const scope in config.scope) { // eslint-disable-line
    const curScope = config.scope[scope];
    if (usrCmds[0] === scope) {
      break; // Domain matches the key. No need to loop further.
    } else if (utils.hasProperty(curScope, 'aliases') && curScope.aliases.indexOf(usrCmds[0]) > -1) {
      usrCmds[0] = scope;
      break;
    }
  }
  return usrCmds;
}

/**
 * ## _serialiseAppScope
 * 'app' scope is added if missing
 * E.g. ojet serve > ojet app serve
 *
 * @private
 * @param {Array} userCommands - Array of all commands (arguments) from the command line
 * @returns {Object} usrCmds   - Commands including 'app'
 */
function _serialiseAppScope(userCommands) {
  const usrCmds = userCommands;
  if (usrCmds[0] !== 'app') {
    // Check names and aliases of the app's commands
    const appCmds = config.scope.app.tasks;
    // Disabling eslint to be able to use 'break'
    for (const appCmd in appCmds) { // eslint-disable-line
      // Is one of app commands or its alias
      if (usrCmds[0] === appCmds[appCmd].key ||
        (utils.hasProperty(appCmds[appCmd], 'aliases') && appCmds[appCmd].aliases.indexOf(usrCmds[0]) > -1)) {
        // Add 'app' domian
        usrCmds.unshift(config.scope.app.key);
        break;
      }
    }
  }
  return usrCmds;
}
