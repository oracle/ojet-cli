/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const pkg = require('./package.json');
const tasks = require('./lib/tasks');

class Ojet {
  /**
   *
   * @param {string} options.cwd path to invoke ojet from
   * @param {boolean} options.logs whether to allow ojet logging
   */
  constructor({ cwd = '.', logs = true }) {
    this._cwd = cwd;
    this._logs = logs;
    this.version = Ojet._version;
  }
  /**
   *
   * @param {string} options.task name of task to execute
   * @param {string} options.scope scope of the task to execute
   * @param {Array<string>} options.parameters parameters to execute the task with
   * @param {Object} options.options options to execute the task with
   * @returns {Promise<undefined>}
   */
  async execute({ task, scope, parameters = [], options = {} }) {
    this._setOptions();
    let result;
    // eslint-disable-next-line prefer-rest-params
    this._logExecuteSummary(arguments[0]);
    try {
      const tasksList = [task, ...(scope ? [scope, ...parameters] : parameters)];
      result = await tasks(tasksList, options);
    } catch (error) {
      result = Promise.reject(error);
    } finally {
      Ojet._clearOptions();
    }
    return result;
  }
  _setOptions() {
    const { _cwd, _logs } = this;
    const OJET = {
      cwd: process.cwd(),
      logs: _logs
    };
    process.env.OJET = JSON.stringify(OJET);
    process.chdir(_cwd);
  }
  _logExecuteSummary({ task, scope, parameters = [], options }) {
    if (this._logs) {
      let message = `OJET API: ojet ${task}`;
      if (scope) {
        message += ` ${scope}`;
      }
      if (parameters.length) {
        parameters.forEach((parameter) => {
          message += ` ${parameter}`;
        });
      }
      if (options) {
        Object.keys(options).forEach((key) => {
          message += ` --${key}=${options[key]}`;
        });
      }
      console.log(message);
    }
  }
}

Ojet._version = pkg.version;

Ojet._clearOptions = function () {
  const OJET = JSON.parse(process.env.OJET || false);
  if (OJET && OJET.cwd) {
    process.chdir(OJET.cwd);
  }
  Ojet._clearEnvVariables();
};

Ojet._clearEnvVariables = function () {
  delete process.env.OJET;
};

module.exports = Ojet;
