/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

module.exports =
{
  error: function _error(error, task) {
    return _getError(error, task);
  },

  prefixError: function _prefixError(error) {
    return _getPrefixError(error);
  },

  scaffoldComplete: function _scaffoldComplete() {
    return _getScaffoldComplete();
  },

  restoreComplete: function _restoreComplete(invokedByRestore, appDir) {
    return _getRestoreComplete(invokedByRestore, appDir);
  },

  appendJETPrefix: function _appendJETPrefix(message) {
    return _appendSuccessPrefix(message || '');
  }
};

function _getScaffoldComplete() {
  return _appendSuccessPrefix('Your app structure is generated. Continuing with library install.');
}

function _getRestoreComplete(invokedByRestore, appDir) {
  if (invokedByRestore) {
    return _appendSuccessPrefix('\x1b[32mYour app restore finished successfully.\x1b[0m');
  }
  return _appendSuccessPrefix(`\x1b[32mYour app is ready! Change to your new app directory '${appDir}' and try 'ojet build' and 'ojet serve'.\x1b[0m`);
}

function _getPrefixError(error) {
  if (error !== null && typeof error === 'object') {
    const newErr = Object.assign({}, error);
    newErr.message = _appendErrorPrefix(error.message);
    return newErr;
  }

  return _appendErrorPrefix(error);
}

function _getError(error, task) {
  const taskName = task ? `(during ${task}) ` : '';
  if (error !== null && typeof error === 'object') {
    const newErr = Object.assign({}, error);
    newErr.message = taskName + error.message;
    return newErr;
  }

  return taskName + error;
}

function _appendSuccessPrefix(message) {
  return `${message}`;
}

function _appendErrorPrefix(message) {
  return `${message}`;
}
