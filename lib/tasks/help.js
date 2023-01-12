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
 * # Help
 * Prints out help page
 *
 * @public
 * @param {Array} [commands]
 */
const dot = config.output.dot;
const indent = config.output.indent;
const newLineIndent = config.output.helpDescNewLineIndent;
const space = config.output.space;
const titlePartLength = config.output.helpTitlePartLength;

module.exports = function (commands) {
  const helpTaskNameUsed = commands.indexOf('help') > -1;
  const n = helpTaskNameUsed ? 1 : 0;
  const task = commands[n];
  const scope = commands[n + 1];

  if (task && scope) {
    // Call validateParametersCount when we have a valid task but invalid scope.
    if (_validateTask(task) && !_validateScope(task, scope)) {
      utils.validateParametersCount(commands.slice(2), 0);
    }
  } else {
    utils.validateParametersCount(commands.slice(2), 0);
  }

  if (task) {
    _validateCommand(task, scope, helpTaskNameUsed);
    // Print one task

    utils.log('Synopsis:\n');
    _printSynopsis(task, scope);

    utils.log('Command details:\n');
    _printTask(task, scope);
    return Promise.resolve();
  }
  // Print all tasks, default 'ojet help'
  utils.log('Synopsis:\n');
  utils.log(`${space.repeat(indent)}ojet <command> [<scope>] [<parameter(s)>] [<options>]\n`);

  utils.log('Available commands:\n');
  Object.keys(config.tasks).forEach((taskItem) => {
    if (!config.tasks[taskItem].hideFromHelp) {
      _printTask(taskItem, scope, true);
    }
  });

  utils.log('Global options:\n');
  Object.keys(config.globalOptions).forEach((globalOptionKey) => {
    const globalOptionObject = config.globalOptions[globalOptionKey];
    const alias = '' || _serialiseAliases(globalOptionObject);
    const aliasLength = alias ? alias.length : 0;
    const dotsLength = titlePartLength - indent - globalOptionKey.length - aliasLength - 3;
    utils.log(`${space.repeat(indent)}--${globalOptionKey}${alias} ${dot.repeat(dotsLength)} ${globalOptionObject.description}\n`);
  });

  utils.log('Detailed help:\n');
  utils.log(`${space.repeat(indent)}ojet help <command> [<scope>]\n`);
  return Promise.resolve();
};

/**
 * ## _validateCommand
 *
 * @private
 * @param {string} task
 * @param {string} [scope]
 * @param {boolean} helpTaskNameUsed
 */
function _validateCommand(task, scope, helpTaskNameUsed) {
  const help = helpTaskNameUsed ? 'help ' : '';
  if (_validateTask(task)) {
    if (scope) {
      if (!_validateScope(task, scope)) {
        utils.log.error(utils.toNotSupportedMessage(`${help}${task} ${scope}`));
      }
    }
  } else {
    utils.log.error(utils.toNotSupportedMessage(`${help}${task}`));
  }
}

/**
 * ## _validateTask
 *
 * @private
 * @param {string} task
 */
function _validateTask(task) {
  for (const item in config.tasks) { // eslint-disable-line
    if (item === task) {
      return true;
    }
  }
  return false;
}

/**
 * ## _validateScope
 *
 * @private
 * @param {string} task
 * @param {string} scope
 */
function _validateScope(task, scope) {
  for (const item in config.tasks[task].scopes) { // eslint-disable-line
    if (item === scope) {
      return true;
    }
  }
  return false;
}

/**
 * ## _printSynopsis
 *
 * @private
 * @param {string} task
 * @param {string} [scope]
 */
function _printSynopsis(task, scope) {
  let scp = '';
  let params = '';
  let options = '';
  const taskObj = config.tasks[task];

  // Help task is an exception
  if (task === 'help') {
    params = ' [<command>] [<scope>]';
  } else if (scope) {
    // e.g. ojet help add plugin
    const scopeObj = taskObj.scopes[scope];
    scp = ` ${scope}`;
    if (utils.hasProperty(scopeObj, 'parameters')) {
      params = _hasMultipParameter(scopeObj.parameters) ? ' <parameter(s)>' : ' <parameter>';

      if (utils.hasProperty(scopeObj, 'options')) {
        options = ' [options]';
      }
    }
  } else if (utils.hasProperty(taskObj, 'scopes')) {
    // e.g. ojet help add
    const scopesObj = taskObj.scopes;

    // 'App' it one of possible scopes
    scp = typeof scopesObj.app === 'undefined' ? ' <scope>' : ' [<scope>]';

    // At least one scope do not use parameter
    let hasNotParam = false;
    // At least one scope uses parameter
    let hasParam = false;
    // At least one scope uses parameter with multiple value
    let hasMultiParam = false;
    // At least one scope parameter is optional
    let hasOptionalParam = false;

    Object.keys(scopesObj).forEach((scopeItem) => {
      // At least one scope uses parameter
      const scopeObj = scopesObj[scopeItem];
      if (utils.hasProperty(scopeObj, 'parameters')) {
        const parameters = scopeObj.parameters;
        hasParam = true;
        if (!hasMultiParam) {
          hasMultiParam = _hasMultipParameter(parameters);
        }
      } else {
        hasNotParam = true;
      }

      // At least one scope parameter is optional
      if (utils.hasProperty(scopeObj, 'isParameterOptional') && scopeObj.isParameterOptional) {
        hasOptionalParam = true;
      }

      // At least one scope uses options
      if (utils.hasProperty(scopeObj, 'options')) {
        options = ' [<options>]';
      }
    });

    // Make parameter single or multi
    if (hasParam) {
      params = hasMultiParam ? ' <parameter(s)>' : ' <parameter>';
    }

    // Make parameter optional
    if (hasParam && (hasNotParam || hasOptionalParam)) {
      params = params.substring(1);
      params = ` [${params}]`;
    }
  }

  utils.log(`${space.repeat(indent)}ojet ${task}${scp}${params}${options}\n`);
}

/**
 * ## _hasMultipParameter()
 *
 * @private
 * @param {string} params
 * @return {boolean}
 */

function _hasMultipParameter(params) {
  return params.indexOf('> ') > -1 || params.indexOf('>] ') > -1;
}

/**
 * ## _printTask
 *
 * @private
 * @param {string} task
 * @param {string} [scope]
 * @param {string} [taskOnly] - Do not print granular options, only the list of tasks ('ojet help')
 */
function _printTask(task, scope, taskOnly) {
  const taskObj = config.tasks[task];
  const taskLength = task.length;

  const alias = _serialiseAliases(taskObj);
  const aliasLength = alias ? alias.length : 0;

  let desc = '';
  if (utils.hasProperty(taskObj, 'description')) {
    desc = `${taskObj.description}`;
  }

  const dotsLength = titlePartLength - indent - taskLength - aliasLength - 1;

  utils.log(`${space.repeat(indent)}${task}${alias} ${dot.repeat(dotsLength)} ${desc}`);
  if (utils.hasProperty(taskObj, 'commands')) {
    utils.log(`${newLineIndent}Commands: ${taskObj.commands}`);
  }
  utils.log('');

  if (scope) {
    // Print one
    _printScope(task, scope);
  } else if (!taskOnly && utils.hasProperty(taskObj, 'scopes')) {
    // Print all
    Object.keys(taskObj.scopes).forEach((scopeItem) => {
      if (!taskObj.scopes[scopeItem].hideFromHelp) {
        _printScope(task, scopeItem);
      }
    });
  }

  _printOptions(taskObj, 2);

  if (!taskOnly && utils.hasProperty(taskObj, 'scopes')) {
    if (scope && utils.hasProperty(taskObj.scopes[scope], 'examples')) {
      // Examples for a single scope
      utils.log('Examples:\n');

      taskObj.scopes[scope].examples.forEach((example) => {
        utils.log(`${space.repeat(indent)}${example}`);
      });
    } else {
      utils.log('Examples:\n');

      // Examples of all scopes within the task
      Object.keys(taskObj.scopes).forEach((scopeItem) => {
        const scopeObj = taskObj.scopes[scopeItem];
        if (utils.hasProperty(scopeObj, 'examples') && !scopeObj.hideFromHelp) {
          scopeObj.examples.forEach((example) => {
            utils.log(`${space.repeat(indent)}${example}`);
          });
        }
      });
    }
    utils.log('');
  }
}

/**
 * ## _serialiseAliases
 *
 * @private
 * @param {Object} obj
 * @returns {string} aliases
 */
function _serialiseAliases(obj) {
  let aliases = '';
  if (utils.hasProperty(obj, 'aliases')) {
    obj.aliases.forEach((alias) => {
      aliases += ` | ${alias}`;
    });
  }
  return aliases;
}

/**
 * ## _printScope
 *
 * @private
 * @param {string} task
 * @param {string} scope
 */
function _printScope(task, scope) {
  const taskObj = config.tasks[task];
  if (utils.hasProperty(taskObj, 'scopes')) {
    const scopeObj = taskObj.scopes[scope];
    const scp = scope === 'app' ? ` [${scope}]` : ` ${scope}`;
    const scopeLength = scp.length;

    const alias = '' || _serialiseAliases(scopeObj);
    const aliasLength = alias ? alias.length : 0;

    let desc = '';
    if (utils.hasProperty(scopeObj, 'description')) {
      desc = `${scopeObj.description}`;
    }

    const dotsLength = titlePartLength - (2 * indent) -
      scopeLength - aliasLength - 1;

    utils.log(`${space.repeat(2 * indent)}${scp}${alias} ${dot.repeat(dotsLength)} ${desc}`);
    if (utils.hasProperty(scopeObj, 'parameters')) {
      utils.log(`${newLineIndent}Parameter: ${scopeObj.parameters}`);
    }

    if (utils.hasProperty(scopeObj, 'default')) {
      utils.log(`${newLineIndent}Default: ${scopeObj.default}`);
    }

    utils.log('');

    _printOptions(scopeObj);
  }
}

/**
 * ## _printOptions
 *
 * @private
 * @param {Object} obj
 * @param {string} [indentLevel]
 */
function _printOptions(obj, indentLevel) {
  if (utils.hasProperty(obj, 'options')) {
    // Always print all
    _printOpts(obj.options, indentLevel);
    utils.log('');
  }
  if (utils.hasProperty(obj, 'hybridOnlyOptions')) {
    utils.log(`${space.repeat(3 * indent)}Hybrid only:\n`);
    _printOpts(obj.hybridOnlyOptions, indentLevel);
    utils.log('');
  }
}

/**
 * ## _printOpts
 *
 * @private
 * @param {Object} obj
 * @param {string} [indentLevel = 3] help output indent, 2 == task options, 3 == scope options
 */
function _printOpts(obj, indentLevel) {
  Object.keys(obj).forEach((option) => {
    const optionObj = obj[option];
    const optionLength = option.length;

    const alias = '' || _serialiseAliases(optionObj);
    const aliasLength = alias ? alias.length : 0;

    let desc = '';
    if (utils.hasProperty(optionObj, 'description')) {
      desc = `${optionObj.description}`;
    }

    const indentMultiplicator = indentLevel || 3;
    const dotsLength = titlePartLength - (indentMultiplicator * indent)
      - 2 - optionLength - aliasLength - 1;

    utils.log(`${space.repeat(indentMultiplicator * indent)}--${option}${alias} ${dot.repeat(dotsLength)} ${desc}`);
    if (utils.hasProperty(optionObj, 'parameters')) {
      utils.log(`${newLineIndent}Value: ${optionObj.parameters}`);
    }
    if (utils.hasProperty(optionObj, 'default')) {
      utils.log(`${newLineIndent}Default: ${optionObj.default}`);
    }
  });
}
