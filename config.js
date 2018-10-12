#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
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
      // hideFromHelp: true,
      scopes: {
        component: {
          hideFromHelp: true,
          aliases: ['components'],
          description: 'Adds the specified component(s) to the app',
          parameters: '<component1> [<component2>]',
          options: {
            'pack-version': {
              description: 'Specify the pack version',
              parameters: '<pack_version>'
            }
          },
          examples: ['ojet add component flipcard']
        },
        hybrid: {
          description: 'Adds a hybrid app target to the web app',
          examples: ['ojet add hybrid']
        },
        pack: {
          hideFromHelp: true,
          aliases: ['packs'],
          description: 'Adds the specified pack(s) to the app',
          parameters: '<pack1> [<pack2>]',
          examples: ['ojet add pack oj-dvt']
        },
        platform: {
          aliases: ['platforms'],
          description: 'Adds the specified platform(s) to the hybrid app',
          parameters: '<platform1> [<platform2>]',
          examples: ['ojet add platform ios']
        },
        plugin: {
          aliases: ['plugins'],
          description: 'Adds the specified plugin(s) to the hybrid app',
          parameters: '<plugin1> [<plugin2>]',
          examples: ['ojet add plugins cordova-plugin-camera cordova-plugin-file --variable=1234'],
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
            svg: {
              description: 'Enable SVG re-compilation for JET Alta Theme',
              parameters: '[true|false]',
              default: 'false'
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
            'ojet build ios --device --build-config=./buildConfig.json --theme=myCustomTheme',
            'ojet build web --theme=alta:android',
            'ojet build windows --platform-options="--archs=\\"x86 x64 arm\\""'
          ]
        },
        component: {
          description: 'Builds an optimized component for the specified component name',
          parameters: 'component name',
          examples: [
            'ojet build component demo-card'
          ]
        }
      }
    },
    clean: {
      description: 'Cleans build output from a JET app',
      scopes: {
        app: {
          description: 'Cleans build output from a JET app for the specified platform',
          parameters: 'android|ios|windows|web',
          examples: ['ojet clean app android', 'ojet clean ios']
        },
      },
    },
    configure: {
      hideFromHelp: true,
      description: 'Configures tooling parameters for a JET app',
      scopes: {
        app: {
          description: 'Configures the specified parameter for a JET app',
          options: {
            'exchange-url': {
              description: 'Specify the URL for the Exchange used by the app',
              parameters: '<exchange_url>'
            }
          },
          examples: ['ojet configure --exchange-url=myExchange.org', 'ojet configure app --exchange-url=10.1.1.32:8010/v1/basepath/']
        },
      },
    },
    create: {
      description: 'Creates a new JET app, custom theme, or component',
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
            'ojet create myHybridApp --hybrid --appid="com.oracle.myApp" --appname="My App" --platforms=ios,android --template=navdrawer',
            'ojet create myApp --web --template=basic:hybrid',
            'ojet create FixItFast --template=http://www.oracle.com/webfolder/technetwork/jet/public_samples/FixItFast.zip'
          ]
        },
        component: {
          aliases: ['components'],
          description: 'Creates a component with the specified name in an existing app, or creates a component with a shell app',
          parameters: '<component-name>',
          examples: ['ojet create component demo-card']
        },
        pack: {
          aliases: ['packs'],
          description: 'Creates a pack with the specified name in an existing app, or creates a pack with a shell app',
          parameters: '<pack-name>',
          examples: ['ojet create pack component demo-pack']
        },
        theme: {
          aliases: ['themes'],
          description: 'Creates a custom theme with the specified name',
          parameters: '<theme-name>',
          examples: ['ojet create theme red']
        }
      },
    },
    help: {
      description: 'Displays command line help',
      commands: '[add|build|clean|configure|create|list|remove|restore|serve|strip]'
    },
    list: {
      description: 'Lists platforms, plugins and more within a JET app',
      scopes: {
        component: {
          hideFromHelp: true,
          aliases: ['components'],
          description: 'Lists all installed components',
          examples: ['ojet list component']
        },
        pack: {
          hideFromHelp: true,
          aliases: ['packs'],
          description: 'Lists all installed packs',
          examples: ['ojet list packs']
        },
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
    publish: {
      hideFromHelp: true,
      description: 'Publishes components to the Exchange',
      scopes: {
        component: {
          description: 'Publishes the specified component to the Exchange',
          aliases: ['components'],
          parameters: '<component>',
          options: {
            username: {
              description: 'The user\'s registered username'
            },
            password: {
              description: 'The user\'s registered password'
            },
            pack: {
              description: 'Specify the pack name',
              parameters: '<pack_name>'
            },
            release: {
              description: 'Whether to publish the specified component with a release build'
            }
          },
          examples: [
            'ojet publish component flipcard'
          ]
        },
        pack: {
          description: 'Publishes the specified pack to the Exchange',
          aliases: ['packs'],
          parameters: '<pack>',
          options: {
            username: {
              description: 'The user\'s registered username'
            },
            password: {
              description: 'The user\'s registered password'
            },
          },
          examples: [
            'ojet publish pack oj-dvt'
          ]
        }
      },
    },
    remove: {
      description: 'Removes platforms, plugins and more from a JET app',
      scopes: {
        component: {
          hideFromHelp: true,
          description: 'Removes the specified component(s) from the app',
          aliases: ['components'],
          parameters: '<component1> [<component2>]',
          examples: ['ojet remove components flipcard dv-gantt']
        },
        pack: {
          hideFromHelp: true,
          aliases: ['packs'],
          description: 'Removes the specified pack(s) from the app',
          parameters: '<pack1> [<pack2>]',
          examples: ['ojet remove pack oj-core']
        },
        platform: {
          description: 'Removes the specified platform(s) from the app',
          aliases: ['platforms'],
          parameters: '<platform1> [<platform2>]',
          examples: ['ojet remove platforms ios android']
        },
        plugin: {
          description: 'Removes the specified plugin(s) from the app',
          aliases: ['plugins'],
          parameters: '<plugin1> [<plugin2>]',
          examples: ['ojet remove plugin cordova-plugin-camera']
        }
      },
    },
    restore: {
      description: 'Restores missing dependencies, plugins, and libraries to a JET app',
      scopes: {
        app: {
          description: 'Restores missing dependencies, plugins, and libraries to a JET app',
          examples: [
            'ojet restore',
            'ojet restore app'
          ]
        }
      }
    },
    search: {
      hideFromHelp: true,
      description: 'Searches for a component in the exchange based on the specified keyword',
      scopes: {
        exchange: {
          description: 'Searches for a component in the exchange based on the specified keyword',
          parameters: '<keyword>',
          options: {
            versions: {
              description: 'Lists all available versions'
            }
          },
          examples: [
            'ojet search exchange flip-card',
            'ojet search exchange flip-card dv-gantt'
          ]
        }
      },
    },
    serve: {
      description: 'Serves a JET app to an emulator, device or the browser',
      scopes: {
        app: {
          description: 'Serves a JET app for the specified platform',
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
            svg: {
              description: 'Enable SVG re-compilation for JET Alta Theme',
              parameters: '[true|false]',
              default: 'false'
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
                newLine + ' browser[:chrome|:firefox|:edge|:ie|:safari]|server-only',
              default: 'emulator' + // eslint-disable-line
                newLine + 'Default browser: chrome'
            },
            browser: {
              description: 'Shortcut for --destination=browser',
              parameters: '[chrome|firefox|edge|ie|safari]',
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
            'ojet serve android --browser',
            'ojet serve --browser=edge',
            'ojet serve ios --device --build-config ./buildConfig.json --theme myCustomTheme',
            'ojet serve web --theme alta:android',
            'ojet serve windows --platform-options "--archs=\\"x86 x64 arm\\""'
          ]
        }
      }
    },
    strip: {
      description: 'Strips all non source files from a JET app',
      scopes: {
        app: {
          description: 'Strips all non source files from a JET app',
          examples: ['ojet strip', 'ojet strip app']
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
  exchangeUrlParam: 'exchange-url',
  components: {
    dir: './src/js/jet-composites/'
  },
  configFile: './oraclejetconfig.json',
  output: {
    helpTitlePartLength,
    helpDescNewLineIndent,
    indent: 4,
    dot: '.',
    space: helpSpace
  }
};

// Add 'name' property to all the tasks
config.addNamesToTaskAndScopes();

module.exports = config;
