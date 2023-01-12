/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const constants = require('../lib/util/constants');
const path = require('path');
const paths = require('../lib/util/paths');
const commonMessages = require('../common/messages');
const utils = require('../lib/util/utils');
const inquirer = require('inquirer');
const childProcess = require('child_process');

const SUPPORTED_PLATFORMS_PROMP_CHOICES =
  [
    {
      name: 'Android',
      value: 'android'
    },
    {
      name: 'iOS',
      value: 'ios'
    },
    {
      name: 'Windows',
      value: 'windows'
    }
  ];

const TEST_COMMAND =
  [
    {
      platform: 'android',
      testCommand: 'adb',
      testCommandArgs: ['devices']
    },
    {
      platform: 'ios',
      testCommand: 'xcrun',
      testCommandArgs: ['simctl', 'help', 'create']
    },
    {
      platform: 'windows',
      testCommand: 'reg.exe',
      testCommandArgs: ['query',
        'HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\ Kits\\Installed\ Roots', // eslint-disable-line
        '/v', 'KitsRoot10']
    }
  ];

module.exports =
{
  getPlatforms: function _getPlatforms(generatorArg) {
    const generator = generatorArg;

    if (generator.options.platforms || generator.options.platform) {
      // platforms = generator.options.platforms || generator.options.platform;

      return new Promise((resolve) => {
        _validatePlatforms(generator)
          .then((processedPlatforms) => {
            generator._platformsToInstall = processedPlatforms;
            resolve(generator);
          });
      });
    }

    return new Promise((resolve, reject) => {
      // if platforms option is not provided do prompt
      _testPlatforms(constants.SUPPORTED_HYBRID_PLATFORMS)
        .then((possiblePlatforms) => {
          if (!possiblePlatforms.length) {
            resolve(generator);
            return;
          }
          const prompt = inquirer.createPromptModule();
          prompt([{
            type: 'checkbox',
            name: 'platforms',
            choices: _filterPromptingPlatforms(possiblePlatforms),
            message: 'Please choose the platforms you want to install'
          }]).then((answers) => {
            // preserve the values for the corodva add part
            generator._platformsToInstall = answers.platforms;
            resolve(generator);
          });
        })
        .catch((err) => {
          reject(commonMessages.error(err, 'testPlatforms'));
        });
    });
  },

  addPlatforms: function _addPlatforms(generator) {
    const platforms = generator._platformsToInstall;

    // always add the browser platform
    platforms.push('browser');
    const cordovaDir = paths.getConfiguredPaths(path.resolve('.')).stagingHybrid;

    return new Promise((resolve, reject) => {
      let p = Promise.resolve();
      platforms.forEach((value) => {
        p = p.then(() => {
          utils.log(`Adding platform: ${value}`);
          return utils.spawn('cordova',
            ['platform', 'add', value, '--save'], null, true, { cwd: path.resolve(cordovaDir), allowProcessOutput: false });
        });
      });

      p.then(() => {
        resolve(generator);
      })
        .catch((err) => {
          reject(commonMessages.error(err, 'addPlatforms'));
        });
    });
  }
};

/**
 * Returns an array of platforms to be installed.
 * An error is thrown when an invalid platform is requested.
 * A warning is displayed for valid platforms that do not appear
 * to be supported in the environment.
 *
 * @param {type} generator
 * @return {Promise}
 */
function _validatePlatforms(generator) {
  const platformOptions = generator.options.platforms || generator.options.platform;
  const platforms = _processPlatformOptions(platformOptions);

  return new Promise((resolve) => {
    _testPlatforms(platforms)
      .then((availablePlatforms) => {
        const failedPlatforms = [];
        platforms.forEach((entry) => {
          if (availablePlatforms.indexOf(entry) < 0) {
            failedPlatforms.push(entry);
          }
        });

        if (failedPlatforms.length > 0) {
          let msg = 'WARNING: Could not detect support for the following platform(s):';
          failedPlatforms.forEach((entry) => {
            msg += `\n  ${entry}`;
          });
          msg += '\nThe platform(s) will be installed, but may not work properly.';
          utils.log(commonMessages.appendJETPrefix() + msg);
        }
        resolve(platforms);
      }
      );
  });
}

/**
 * Tests if the requested platforms are supported in the current environment.
 * Returns an array of detected valid platforms.
 *
 * @param {Array} platforms array of requested platforms
 * @return {Promise} a promise object
 */
function _testPlatforms(platforms) {
  const filteredTestCommands = _getFilteredTestCommands(platforms);
  const platformTests = _getPlatformTests(filteredTestCommands);
  // note there exists no reject since want to test all the filteredTestCommands
  // and when there are errors (i.e. test command fails) it will resolve w/o that platform
  return new Promise((resolve) => {
    Promise.all(platformTests)
      .then((platformResults) => {
        // note platformResults is an array with those that passed to be populated
        // and those not passed to be undefined (with resolve())
        // as mentioned since one needs to test for every platform passed in the
        // user's environment need the tests to go through w/ resolve and not
        // reject
        resolve(platformResults.filter(entry =>
          // return only entries that resulted in success
          !!entry));
      });
  });
}

function _filterPromptingPlatforms(promptPlatforms) {
  // simple function to return prompt choices based on supported platforms
  return SUPPORTED_PLATFORMS_PROMP_CHOICES.filter(type =>
    promptPlatforms.indexOf(type.value) !== -1);
}

function _processPlatformOptions(platforms) {
  if (!platforms) {
    return [];
  }

  const splitted = platforms.split(',');
  const trimmed = splitted.map(val => val.trim());

  // now filter the content to only supported ones
  return trimmed.filter((val) => {
    const supportedValue = constants.SUPPORTED_HYBRID_PLATFORMS.indexOf(val);
    if (supportedValue === -1) {
      utils.log.error(`ERROR: Passed in unsupported platform - ${val}`);
    }

    return supportedValue !== -1;
  });
}


function _getFilteredTestCommands(platforms) {
  // need to use filter and not map since the passed in content can
  // be a subset of TEST_COMMAND
  return TEST_COMMAND.filter(type => platforms.indexOf(type.platform) !== -1);
}

function _getPlatformTests(platforms) {
  const platformTests = [];

  platforms.forEach((info) => {
    platformTests.push(_createPlatformTest(info));
  });

  return platformTests;
}

function _createPlatformTest(info) {
  return new Promise((resolve) => {
    childProcess.spawn(info.testCommand, info.testCommandArgs, { stdio: ['pipe', 'ignore', 'pipe'] })
      .on('exit', (err) => {
        if (err) {
          // note as mentioned just resolve
          resolve();
        }
        resolve(info.platform);
      })
      .on('error', () => {
        // intentionally resolve it since these are tests and want to proceed through
        // all the promises
        resolve();
      });
  });
}
