/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * # Config
 *
 * @public
 */
module.exports = {
  scope: {
    app: {
      key: 'app',
      description: `Default 'scope' for JET apps, can be ommited
      ojet app serve == ojet serve`,
      tasks: {
        add: {
          key: 'add',
          description: 'Manages one-time only executable adds',
          parameters: ['hybrid', 'sass']
        },
        create: {
          key: 'create',
          description: 'Creates a new JET app',
          parameters: ['<app-name>'],
          options: ['List options: \'ojet help create\'']
        },
        build: {
          key: 'build',
          description: 'Builds app',
          parameters: ['android', 'ios', 'windows', 'web'],
          options: ['List options: \'ojet help build\'']
        },
        serve: {
          key: 'serve',
          description: 'Serves app',
          parameters: ['android', 'ios', 'windows', 'web'],
          options: ['List options: \'ojet help serve\'']
        },
        clean: {
          key: 'clean',
          description: 'Cleanup hybrid app from build artifacts',
          parameters: ['android', 'ios', 'windows']
        },
        restore: {
          key: 'restore',
          description: 'Restores app',
        }
      }
    },
    platform: {
      key: 'platform',
      description: 'Manage platforms',
      aliases: ['platforms'],
      tasks: {
        add: {
          key: 'add',
          description: 'Adds platform to project',
          parameters: ['android', 'ios', 'window']
        },
        list: {
          key: 'list',
          description: 'Lists all installed platforms'
        },
        remove: {
          key: 'remove',
          description: 'Removes platform from project',
          parameters: ['android', 'ios', 'window']
        }
      }
    },
    plugin: {
      key: 'plugin',
      description: 'Manage plugins',
      aliases: ['plugins'],
      tasks: {
        add: {
          key: 'add',
          description: 'Adds plugin to project',
          parameters: ['<plugin-name>']
        },
        list: {
          key: 'list',
          description: 'Lists all installed plugins',
        },
        remove: {
          key: 'remove',
          description: 'Removes plugin from project',
          parameters: ['<plugin-name>']
        }
      }
    },
    theme: {
      key: 'theme',
      description: 'Manage themes',
      aliases: ['themes'],
      tasks: {
        add: {
          key: 'add',
          description: 'Adds theme to project',
          parameters: ['<theme-name>']
        }
      }
    },
    help: {
      key: 'help',
      description: 'Prints out help page',
      tasks: {
        create: {
          key: 'create',
          description: 'Prints options of \'create\' command',
        },
        build: {
          key: 'build',
          description: 'Prints options of \'build\' command',
        },
        serve: {
          key: 'serve',
          description: 'Prints options of \'serve\' command',
        }
      }
    }
  },
  env: {
    test: 'test'
  },
  logColors: {
    c1: '\x1b[0m',
    c2: '\x1b[32m',
    c3: '\x1b[33m',
    c4: '\x1b[36m',
    c5: '\x1b[35m'
  }
};
