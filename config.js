#! /usr/bin/env node
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * # Config
 *
 * @public
 * @global
 */
const helpTitlePartLength = 35;
const helpSpace = ' ';
const helpDescNewLineIndent = helpSpace.repeat(helpTitlePartLength + 1);
const newLine = `\n${helpDescNewLineIndent}`;

const config = {
  tasks: {
    add: {
      description: 'Adds platforms, plugins and more to a JET app',
      scopes: {
        hybrid: {
          description: 'Adds a hybrid app target to the web app',
          examples: ['ojet add hybrid']
        },
        platform: {
          aliases: ['platforms'],
          description: 'Adds target platform(s) to the hybrid app',
          parameters: '<platform1> [<platform2>]',
          examples: ['ojet add platform ios']
        },
        plugin: {
          aliases: ['plugins'],
          description: 'Adds Cordova plugin(s) to the hybrid app',
          parameters: '<plugin1> [<plugin2>]',
          examples: ['ojet add plugins cordova-plugin-camera cordova-plugin-file --variable 1234'],
          options: {
            variable: {
              description: 'Specify a plugin\'s required variables'
            }
          }
        },
        sass: {
          description: 'Adds SASS compilation and watch to the app',
          examples: ['ojet add sass']
        }
      },
    },
    build: {
      description: 'Builds a JET app',
      scopes: {
        app: {
          description: 'Builds a JET app for the specified platform',
          parameters: '[android|ios|windows|web]',
          isParameterOptional: true,
          options: {
            release: {
              description: 'Build in release mode',
              parameters: '[true|false]',
            },
            'build-config': {
              description: 'Specify the build config file for signing the hybrid app',
              parameters: '<build_config_file>'
            },
            sass: {
              description: 'Enable SASS compilation',
              parameters: '[true|false](--no-sass)',
              default: 'true'
            },
            theme: {
              description: 'Specify the theme to be used by the app',
              parameters: '<theme_name>[:<platform>]' + // eslint-disable-line
                newLine + 'where <theme_name> is: alta or <custom_theme_name>' + // eslint-disable-line
                newLine + 'and <platform> is one of: android, ios, web, windows',
              default: 'alta for the specified platform'
            },
            themes: {
              description: 'Specify multiple themes separated by comma(s)' + // eslint-disable-line
              newLine + 'When the --theme flag is missing,' +
              newLine + 'the first element in the --themes flag is identified as the default theme.'
            },
          },
          hybridOnlyOptions: {
            destination: {
              description: 'Specify the destination for building the app',
              parameters: 'device|emulator',
              default: 'emulator'
            },
            device: {
              description: 'Shortcut for --destination=device'
            },
            emulator: {
              description: 'Shortcut for --destination=emulator'
            },
            'platform-options': {
              description: 'Specify platform specific options that are passed to the Cordova command line',
              parameters: '<platform_specific_options>' + // eslint-disable-line
                newLine + 'Use quotes to pass multiple options as a single parameter value'
            }
          },
          examples: [
            'ojet build',
            'ojet build ios --no-sass',
            'ojet build app android --release',
            'ojet build ios --device --build-config ./buildConfig.json --theme myCustomTheme',
            'ojet build web --theme alta:android',
            'ojet build windows --platform-options "--archs=\\"x86 x64 arm\\""'
          ]
        }
      },
    },
    clean: {
      description: 'Cleans the JET app build output',
      scopes: {
        platform: {
          description: 'Clean the project build output',
          examples: ['ojet clean', 'ojet clean ios']
        },
      },
    },
    create: {
      description: 'Creates a new JET app or a custom theme',
      scopes: {
        app: {
          description: 'Creates an app with the specified name',
          parameters: '<app-name>',
          isParameterOptional: true,
          default: 'The name of the current directory',
          options: {
            hybrid: {
              description: 'Create a hybrid app'
            },
            web: {
              description: 'Create a web app (default)'
            },
            template: {
              description: 'Use a pre-defined app template',
              parameters: 'blank|basic[:web|:hybrid]|navbar[:web|:hybrid]|' + // eslint-disable-line
                newLine + ' navdrawer[:web|:hybrid]|<URL_to_zip_file>'
            },
          },
          hybridOnlyOptions: {
            appid: {
              description: 'Specify the app ID for the hybrid app',
              default: 'org.oraclejet.<app_name>'
            },
            appname: {
              description: 'Specify the app name for the hybrid app',
              default: '<current_working_directory>'
            },
            platform: {
              description: 'Specify the supported platform for the hybrid app',
              parameters: 'android|ios|windows'
            },
            platforms: {
              description: 'Specify platforms for scaffolded hybrid app',
              parameters: '[android],[ios],[windows]'
            }
          },
          examples: [
            'ojet create myWebApp --template=navbar',
            'ojet create myHybridApp --hybrid --appid "com.oracle.myApp" --appname "My App" --platforms=ios,android --template=navdrawer',
            'ojet create myApp --web --template=basic:hybrid',
            'ojet create FixItFast --template http://www.oracle.com/webfolder/technetwork/jet/public_samples/FixItFast.zip'
          ]
        },
        theme: {
          description: 'Creates a custom theme with the specified name',
          parameters: '<theme-name>',
          examples: ['ojet create theme red']
        }
      },
    },
    help: {
      description: 'Displays command line help',
      tasks: '[add|build|create|help|list|remove|restore|serve]'
    },
    list: {
      description: 'Lists platforms and plugins within a JET app',
      scopes: {
        platform: {
          aliases: ['platforms'],
          description: 'Lists all installed platforms',
          examples: ['ojet list platform']
        },
        plugin: {
          aliases: ['plugins'],
          description: 'Lists all installed plugins',
          examples: ['ojet list plugins']
        }
      }
    },
    remove: {
      description: 'Removes platforms and plugins from a JET app',
      scopes: {
        platform: {
          description: 'Removes a platform from the app',
          aliases: ['platforms'],
          parameters: '<platform1> [<platform2>]',
          examples: ['ojet remove platforms ios android']
        },
        plugin: {
          description: 'Removes a plugin from the app',
          aliases: ['plugins'],
          parameters: '<plugin1> [<plugin2>]',
          examples: ['ojet remove plugin cordova-plugin-camera']
        }
      },
    },
    restore: {
      description: 'Install missing dependencies, plugins, and libraries for a JET app',
      scopes: {
        app: {
          description: 'Install missing dependencies, plugins, and libraries for a JET app',
        }
      }
    },
    serve: {
      description: 'Serves a JET app to an emulator, device or the browser',
      scopes: {
        app: {
          description: 'Serves a JET app to an emulator, device or the browser',
          parameters: '[android|ios|windows|web]',
          isParameterOptional: true,
          options: {
            release: {
              description: 'Serve in release mode',
              parameters: '[true|false]',
            },
            'build-config': {
              description: 'Specify the build config file for signing the hybrid app',
              parameters: '<build_config_file>'
            },
            build: {
              description: 'Build the app before serving it',
              parameters: '[true|false](--no-build)',
              default: 'true'
            },
            sass: {
              description: 'Enable SASS compilation and SASS watch ',
              parameters: '[true|false](--no-sass)',
              default: 'true'
            },
            'server-port': {
              description: 'Specify the server port',
              parameters: '<integer>',
              default: '8000'
            },
            theme: {
              description: 'Specify the theme to be used by the app',
              parameters: '<theme_name>[:<platform>]' + // eslint-disable-line
                newLine + 'where <theme_name> is: alta or <custom_theme_name>' + // eslint-disable-line
                newLine + 'and <platform> is one of: android, ios, web, windows',
              default: 'alta for the specified platform'
            },
            themes: {
              description: 'Specify multiple themes separated by comma.' + // eslint-disable-line
                newLine + 'When the --theme flag is missing,' +
                newLine + 'the first element in the --themes flag is identified as the default theme'
            },
            livereload: {
              description: 'Enable live reload',
              parameters: '[true|false](--no-livereload)',
              default: 'true'
            },
            'livereload-port': {
              description: 'Specify the live reload port',
              parameters: '<integer>',
              default: '35729'
            },
            'server-only': {
              description: 'Shortcut for --destination=server-only'
            },
          },
          hybridOnlyOptions: {
            destination: {
              description: 'Specify the destination for serving the app',
              parameters: 'device[:<device_name>]|emulator[:<emulator_name>]|' + // eslint-disable-line
                newLine + ' browser[:chrome|:firefox|:edge|:ie|:opera|:safari]|server-only',
              default: 'emulator' + // eslint-disable-line
                newLine + 'Default browser: chrome'
            },
            browser: {
              description: 'Shortcut for --destination=browser',
              parameters: '[chrome|firefox|edge|ie|opera|safari]',
              default: 'chrome'
            },
            device: {
              description: 'Shortcut for --destination=device',
              parameters: '[<device_name>]',
              default: 'The only connected device for the specified platform'
            },
            emulator: {
              description: 'Shortcut for --destination=emulator',
              parameters: '[<emulator_name>]',
              default: 'The default emulator for the specified platform'
            },
            'platform-options': {
              description: 'Specify platform specific options that are passed to the Cordova command line',
              parameters: '<platform_specific_options>' + // eslint-disable-line
                newLine + 'Use quotes to pass multiple options as a single parameter value'
            }
          },
          examples: [
            'ojet serve',
            'ojet serve app ios --no-livereload --emulator="iPad-Air, 10.2"',
            'ojet serve --device --release',
            'ojet serve windows --no-sass --livereload-port=357230',
            'ojet serve --platform android --browser',
            'ojet serve --browser=edge',
            'ojet serve ios --device --build-config ./buildConfig.json --theme myCustomTheme',
            'ojet serve web --theme alta:android',
            'ojet serve windows --platform-options "--archs=\\"x86 x64 arm\\""'
          ]
        }
      }
    },
    strip: {
      description: 'Strips all non source files from the JET app',
      scopes: {
        app: {
          description: 'Remove all non source-controlled files',
          examples: ['ojet strip']
        },
      },
    }
  },
  // Disabling line, can not use arrow function because it changes 'this' scope
  addNamesToTaskAndScopes: function() { // eslint-disable-line
    const tasks = this.tasks;
    Object.keys(tasks).forEach((task) => {
      tasks[task].name = task;
      const scopes = tasks[task].scopes;
      if (scopes) {
        Object.keys(scopes).forEach((scope) => {
          scopes[scope].name = scope;
        });
      }
    });
  },
  env: {
    test: 'test'
  },
  help: {
    titlePartLength: helpTitlePartLength,
    descIndent: helpDescNewLineIndent,
    indent: 4,
    dot: '.',
    space: helpSpace
  }
};

// Add 'name' property to all the tasks
config.addNamesToTaskAndScopes();

module.exports = config;
