/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');
const path = require('path');

// Oracle
const config = require('../config');
const pckg = require('../package');
const utils = require('./utils');

/**
 * # Help
 * Prints out help page
 *
 * @public
 * @param {string} [task]
 */
module.exports = function (task) {
  switch (task) {
    case config.scope.help.tasks.build.key:
    case config.scope.help.tasks.serve.key:
    case config.scope.help.tasks.create.key: {
      // Print options
      const file = path.join(__dirname, '..', 'doc', `app.${task}.txt`);
      utils.log(`\n${fs.readFileSync(file).toString('utf8')}\n`);
      break;
    }
    case undefined:
      _logDefaultHelp();
      break;
    default:
      throw utils.toError(utils.toNotSupportedMessage(`${config.scope.help.key} ${task}`));
  }
};

/**
 * ## _logArt
 * @private
 */
function _logArt() {
  utils.log('\n  ██████╗      ██╗███████╗████████╗');
  utils.log(' ██╔═══██╗     ██║██╔════╝╚══██╔══╝');
  utils.log(' ██║   ██║     ██║█████╗     ██║');
  utils.log(' ██║   ██║██   ██║██╔══╝     ██║');
  utils.log(' ╚██████╔╝╚█████╔╝███████╗   ██║');
  utils.log('  ╚═════╝  ╚════╝ ╚══════╝   ╚═╝');
}

/**
 * ## _logTitle
 * @private
 */
function _logTitle() {
  utils.log(`\n${pckg.description}`);
}

/**
 * ## _logDefaultHelp
 * @private
 */
function _logDefaultHelp() {
  _logArt();
  _logTitle();
  utils.log(`Version: ${pckg.version}`);
  utils.log(`\nSyntax: ojet [${config.logColors.c2}scope${config.logColors.c1}] ${config.logColors.c3}task${config.logColors.c1} [${config.logColors.c4}parameter${config.logColors.c1}] [${config.logColors.c1}options${config.logColors.c1}]\n`);

  // Scope
  Object.keys(config.scope).forEach((scope) => {
    const currentScope = config.scope[scope];
    utils.log(`${config.logColors.c2}${scope}${_getSerialisedValue(currentScope, 'aliases', true)} ${config.logColors.c1}${_getDescription(currentScope)}`);
    // Task
    Object.keys(currentScope.tasks).forEach((taskItem) => {
      const currentTask = currentScope.tasks[taskItem];
      utils.log(`  ${config.logColors.c3}${currentTask.key}${_getSerialisedValue(currentTask, 'aliases', true)} ${config.logColors.c1}${_getDescription(currentTask)}`);
      // Param
      if (utils.hasProperty(currentTask, 'parameters')) {
        utils.log(`     ${config.logColors.c4}${_getSerialisedValue(currentTask, 'parameters', true, false)}${config.logColors.c1}`);
      }
      // Options
      if (utils.hasProperty(currentTask, 'options')) {
        utils.log(`         ${config.logColors.c1}${_getSerialisedValue(currentTask, 'options', false, false)}${config.logColors.c1}`);
      }
    });
  });
  utils.log(`${config.logColors.c2}--version ${config.logColors.c1}- Prints out ojet version`);

  utils.log(`\nExamples: \n
    ojet create myApp --hybrid --template=navbar - Creates a new hybrid app using navigation bar template
    ojet platform add ios                        - Adds iOS platform support
    ojet build android --release                 - Build release package for Android
    ojet serve ios                               - Serves app to iOS emulator
    ojet serve android --device                  - Serves app to connected Android device
    `);
}

/**
 * ## _getDescription
 * Returns value of 'description' property from given object
 *
 * @private
 * @param {Object} object
 * @returns {String}
 */
function _getDescription(object) {
  if (utils.hasProperty(object, 'description')) {
    return `- ${object.description}`;
  }
  return '';
}

/**
 * ## _getSerialisedValue
 * Returns serialized array of given object property
 *
 * @private
 * @param {Object} object
 * @param {string} property
 * @param {boolean} [isOptional = true]
 * @param {boolean} [isFollower = true]
 * @returns {String}
 */
function _getSerialisedValue(object, property, isOptional, isFollower) {
  const optional = isOptional !== false;
  const follower = isFollower !== false;
  let string = '';
  if (utils.hasProperty(object, property)) {
    if (optional) {
      string = follower ? ', [' : '[';
    } else {
      string = follower ? ', ' : `${string}`;
    }
    const arr = object[property];
    for (let i = 0; i < arr.length; i += 1) {
      string += i === (arr.length - 1) ? `${arr[i]}${optional ? ']' : ''}` : `${arr[i]}, `;
    }
  }
  return string;
}
