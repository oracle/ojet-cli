#! /usr/bin/env node
/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

/**
 * # Config
 *
 * @public
 * @global
 */
const helpTitlePartLength = 42;
const helpSpace = ' ';
const helpDescNewLineIndent = helpSpace.repeat(helpTitlePartLength + 1);
const newLine = `\n${helpDescNewLineIndent}`;

const config = {
  tasks: {
    add: {
      description: 'Adds platforms, plugins and more to a JET app',
      // 'hideFromHelp' not used += v7.2.0, implementation hasn't been removed
      // can be used on task and scope level, example below:
      // hideFromHelp: true,
      scopes: {
        component: {
          // hideFromHelp: true,
          aliases: ['components', 'comp'],
          description: 'Adds the specified component(s) to the app',
          parameters: '<component1> [<component2>]',
          options: {
            'pack-version': {
              description: 'Specify the pack version',
              parameters: '<pack_version>'
            },
            secure: {
              description: 'Whether to enforce secure HTTPS protocol',
              parameters: '[true|false]',
              default: 'true'
            },
            username: {
              aliases: ['u'],
              description: 'The user\'s registered username'
            },
            password: {
              aliases: ['p'],
              description: 'The user\'s registered password'
            }
          },
          examples: ['ojet add component flipcard']
        },
        hybrid: {
          description: 'Adds a hybrid app target to the web app',
          examples: ['ojet add hybrid']
        },
        pack: {
          aliases: ['packs'],
          description: 'Adds the specified pack(s) to the app',
          parameters: '<pack1> [<pack2>]',
          options: {
            secure: {
              description: 'Whether to enforce secure HTTPS protocol',
              parameters: '[true|false]',
              default: 'true'
            },
            username: {
              aliases: ['u'],
              description: 'The user\'s registered username'
            },
            password: {
              aliases: ['p'],
              description: 'The user\'s registered password'
            }
          },
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
        },
        theming: {
          description: 'Adds CSS Custom Property supported SASS compilation to the app,' + // eslint-disable-line
            newLine + 'which also resolves postcss calc and autoprefixer',
          examples: ['ojet add theming']
        },
        typescript: {
          description: 'Adds Typescript compilation to the app',
          examples: ['ojet add typescript']
        },
        docgen: {
          description: 'Adds JSDOC compilation to the app to generate API documentation. Works only for VComponents.',
          examples: ['ojet add docgen']
        },
        pwa: {
          description: 'Adds pwa support to the app',
          examples: ['ojet add pwa']
        },
        webpack: {
          description: 'Adds webpack support to the app',
          examples: ['ojet add webpack']
        },
        web: {
          description: 'Adds a web app target to the web app',
          examples: ['ojet add web']
        },
      },
    },
    build: {
      aliases: ['b'],
      description: 'Builds a JET app',
      scopes: {
        app: {
          description: 'Builds a JET app for the specified platform,' + // eslint-disable-line
          newLine + 'where [app] is the directory context of the JET app.' + newLine, // eslint-disable-line
          parameters: '[android|ios|windows|web] - specifies the build platform' + // eslint-disable-line
              newLine + 'The default platform is \'web\'',
          isParameterOptional: true,
          options: {
            release: {
              aliases: ['r'],
              description: 'Build in release mode',
              parameters: '[true|false]',
            },
            optimize: {
              description: 'Specify rjs optimize value',
              parameters: '<string>'
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
              description: 'Specify the theme to be used by the app,' + // eslint-disable-line
                newLine + '-> alta themes are platform specific' +
                newLine + '-> redwood theme is for all platforms',
              parameters: '<theme_name>[:<platform>]' + // eslint-disable-line
                newLine + 'where <theme_name> is: alta or <custom_theme_name>' + // eslint-disable-line
                newLine + 'and <platform> is one of: android, ios, web, windows',
              default: 'redwood for web platform'
            },
            themes: {
              description: 'Specify multiple themes separated by comma(s)' + // eslint-disable-line
              newLine + 'When the --theme flag is missing,' +
              newLine + 'the first element in the --themes flag is identified as the default theme.'
            },
            cssvars: {
              description: 'Specify to inject css file which supports css custom properties' + // eslint-disable-line
                newLine + 'When the --cssvars flag is missing,' +
                newLine + 'the default css preprocessor has been used to process away the custom properties.',
              parameters: '[enabled|disabled]',
              default: 'disabled'
            },
            'user-options': {
              description: 'Specify user-defined options - these are accessible in hooks config object',
              parameters: '<string>'
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
            'ojet build --cssvars=enabled',
            'ojet build ios --no-sass',
            'ojet build android --release',
            'ojet build ios --device --build-config=./buildConfig.json --theme=myCustomTheme',
            'ojet build web --theme=alta:android',
            'ojet build windows --platform-options="--archs=\\"x86 x64 arm\\""',
            'ojet build --user-options="arbitrary string" // provide user-defined options',
            'ojet build --release --optimize=none // Build a release with readable output. Useful for debugging'
          ]
        },
        component: {
          description: 'Builds an optimized component for the specified component name' + // eslint-disable-line
          newLine + 'Use ojet build component component_name to build an optimized component',
          parameters: 'component name',
          examples: [
            'ojet build component demo-card // component build'
          ]
        },
        pack: {
          description: 'Builds an optimized pack for the specified pack name' + // eslint-disable-line
          newLine + 'Use ojet build pack pack_name to build an optimized pack',
          parameters: 'pack name',
          examples: [
            'ojet build pack demo-card-pack // pack build'
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
          examples: ['ojet clean android', 'ojet clean ios']
        },
      },
    },
    configure: {
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
              parameters: 'blank[-ts]|basic[-ts|-vdom][:web|:hybrid]|navbar[-ts][:web|:hybrid]|' + // eslint-disable-line
                newLine + ' navdrawer[-ts][:web|:hybrid]|<URL_to_zip_file>'
            },
            typescript: {
              description: 'Create a typescript-based app',
            },
            pwa: {
              description: 'Create a pwa-supported app',
            },
            webpack: {
              description: 'Create a webpack-supported app',
            },
            'use-global-tooling': {
              description: 'Use the globally-installed tooling library installed with ojet-cli'
            }
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
            'ojet create myWebApp --template=navbar --typescript',
            'ojet create myWebApp --template=navbar --pwa',
            'ojet create myHybridApp --hybrid --appid="com.oracle.myApp" --appname="My App" --platforms=ios,android --template=navdrawer',
            'ojet create myApp --web --template=basic:hybrid',
            'ojet create FixItFast --template=http://www.oracle.com/webfolder/technetwork/jet/public_samples/FixItFast.zip'
          ]
        },
        component: {
          options: {
            /*
            type: {
              description: 'Specifies the type of component to create',
              parameters: 'vcomponent'
            },
            vcomponent: {
              description: 'Creates a vcomponent.'
            },*/
            pack: {
              description: 'Specifies the pack to create the component into',
              parameters: '<pack_name>'
            }
          },
          description: 'Creates a component with the specified name within an existing app',
          parameters: '<component-name>',
          examples: [
            'ojet create component demo-card',
            // 'ojet create component demo-card --type=vcomponent',
            // 'ojet create component demo-card --vcomponent',
            'ojet create component demo-card --pack=demo-pack'
          ]
        },
        pack: {
          aliases: ['packs'],
          description: 'Creates a pack with the specified name in an existing app',
          parameters: '<pack-name>',
          examples: ['ojet create pack demo-pack']
        },
        theme: {
          aliases: ['themes'],
          description: 'Creates a custom theme with the specified name',
          parameters: '<theme-name>',
          examples: ['ojet create theme xyz --basetheme=stable | redwood']
        }
      },
    },
    help: {
      description: 'Displays command line help',
      commands: '[add|build|clean|configure|create|list|remove|restore|serve|strip]'
    },
    list: {
      aliases: ['ls'],
      description: 'Lists platforms, plugins and more within a JET app',
      scopes: {
        component: {
          aliases: ['components', 'comp'],
          description: 'Lists all installed components',
          examples: ['ojet list component']
        },
        pack: {
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
    package: {
      description: 'Prepares archive of a component or a pack',
      scopes: {
        component: {
          description: 'Prepares archive of a component',
          parameters: '<component>',
          options: {
            pack: {
              description: 'Specify the pack name',
              parameters: '<pack_name>'
            }
          },
          examples: [
            'ojet package component demo-card',
            'ojet package component flip-card --pack=demo-pack',
          ]
        },
        pack: {
          description: 'Prepares archives of a pack and its components',
          parameters: '<pack>',
          examples: ['ojet package pack demo-pack']
        }
      }
    },
    publish: {
      description: 'Publishes components to the Exchange',
      scopes: {
        component: {
          description: 'Publishes the specified component to the Exchange' + // eslint-disable-line
              newLine + 'This is the default scope',
          parameters: '<component>',
          options: {
            username: {
              aliases: ['u'],
              description: 'The user\'s registered username'
            },
            password: {
              aliases: ['p'],
              description: 'The user\'s registered password'
            },
            pack: {
              description: 'Specify the pack name',
              parameters: '<pack_name>'
            },
            path: {
              description: 'Specify the path to component archive',
              parameters: '<path>'
            },
            release: {
              aliases: ['r'],
              description: 'Whether to publish the specified component with a release build'
            },
            secure: {
              description: 'Whether to enforce secure HTTPS protocol',
              parameters: '[true|false]',
              default: 'true'
            }
          },
          examples: [
            'ojet publish component flipcard',
            'ojet publish component --path="./dist/demo-card.zip"',
            'ojet publish --path="./dist/flip-card.zip"',
            'ojet publish --path="/Users/john/my-project/built/demo-card.zip"'
          ]
        },
        pack: {
          description: 'Publishes the specified pack to the Exchange',
          aliases: ['packs'],
          parameters: '<pack>',
          options: {
            username: {
              aliases: ['u'],
              description: 'The user\'s registered username'
            },
            password: {
              aliases: ['p'],
              description: 'The user\'s registered password'
            },
            secure: {
              description: 'Whether to enforce secure HTTPS protocol',
              parameters: '[true|false]',
              default: 'true'
            }
          },
          examples: [
            'ojet publish pack oj-dvt'
          ]
        }
      }
    },
    remove: {
      description: 'Removes platforms, plugins and more from a JET app',
      aliases: ['rm'],
      scopes: {
        component: {
          description: 'Removes the specified component(s) from the app',
          aliases: ['components', 'comp'],
          parameters: '<component1> [<component2>]',
          examples: ['ojet remove components flipcard dv-gantt']
        },
        pack: {
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
          options: {
            secure: {
              description: 'Whether to enforce secure HTTPS protocol',
              parameters: '[true|false]',
              default: 'true'
            },
            username: {
              aliases: ['u'],
              description: 'The user\'s registered username'
            },
            password: {
              aliases: ['p'],
              description: 'The user\'s registered password'
            },
            ci: {
              description: 'Use npm ci instead of npm install',
              default: 'false'
            }
          },
          examples: [
            'ojet restore',
            'ojet restore app'
          ]
        }
      }
    },
    search: {
      description: 'Searches for a component in the Exchange based on the specified keyword',
      scopes: {
        exchange: {
          description: 'Searches for a component in the Exchange based on the specified keyword',
          parameters: '<keyword>',
          options: {
            secure: {
              description: 'Whether to enforce secure HTTPS protocol',
              parameters: '[true|false]',
              default: 'true'
            },
            username: {
              aliases: ['u'],
              description: 'The user\'s registered username'
            },
            password: {
              aliases: ['p'],
              description: 'The user\'s registered password'
            },
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
      aliases: ['s'],
      description: 'Serves a JET app to an emulator, device or the browser',
      scopes: {
        app: {
          description: 'Serves a JET app for the specified platform',
          parameters: '[android|ios|windows|web]',
          isParameterOptional: true,
          options: {
            release: {
              aliases: ['r'],
              description: 'Serve in release mode',
              parameters: '[true|false]',
            },
            optimize: {
              description: 'Specify rjs optimize value',
              parameters: '<string>'
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
              description: 'Specify the theme to be used by the app,' + // eslint-disable-line
                newLine + '-> alta themes are platform specific' +
                newLine + '-> redwood theme is for all platforms',
              parameters: '<theme_name>[:<platform>]' + // eslint-disable-line
                newLine + 'where <theme_name> is: alta or <custom_theme_name>' + // eslint-disable-line
                newLine + 'and <platform> is one of: android, ios, web, windows',
              default: 'redwood for web platform'
            },
            themes: {
              description: 'Specify multiple themes separated by comma.' + // eslint-disable-line
                newLine + 'When the --theme flag is missing,' +
                newLine + 'the first element in the --themes flag is identified as the default theme'
            },
            cssvars: {
              description: 'Specify to inject css file which supports css custom properties' + // eslint-disable-line
                newLine + 'When the --cssvars flag is missing,' +
                newLine + 'the default will be a css without css custom properties',
              parameters: '[enabled|disabled]',
              default: 'disabled'
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
            'user-options': {
              description: 'Specify user-defined options - these are accessible in hooks config object',
              parameters: '<string>'
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
            'ojet serve --cssvars=enabled',
            'ojet serve ios --no-livereload --emulator="iPad-Air, 10.2"',
            'ojet serve --device --release',
            'ojet serve windows --no-sass --livereload-port=35723',
            'ojet serve android --browser',
            'ojet serve --browser=edge',
            'ojet serve ios --device --build-config ./buildConfig.json --theme myCustomTheme',
            'ojet serve web --theme alta:android',
            'ojet serve windows --platform-options "--archs=\\"x86 x64 arm\\""',
            'ojet serve --user-options="arbitrary string" // provide user-defined options.'
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
  globalOptions: {
    global: {
      aliases: ['g'],
      description: 'Global setting'
    },
    help: {
      aliases: ['h'],
      description: 'Print help for the command'
    },
    installer: {
      description: 'Specify an alternate package installer such as yarn'
    },
    verbose: {
      description: 'Print details'
    },
    version: {
      aliases: ['v'],
      description: 'Print CLI version'
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
  },
  localStoreDir: '.ojet'
};

// Add 'name' property to all the tasks
config.addNamesToTaskAndScopes();

module.exports = config;
