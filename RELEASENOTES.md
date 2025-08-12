## Release Notes for ojet-cli ##

### 19.0.0

* update typescript to 5.8.3
* update express server to 5.1.0
* Introduced a new configuration option, enableLegacyPeerDeps, in oraclejetconfig.json. This flag allows users to opt-in to installing NPM packages with the --legacy-peer-deps flag. When enabled (true),the CLI includes this flag in the installation
command; otherwise, it does not.
* generateSourceMaps flag is introduced in the oraclejetconfig.json file. This new flag controls the generation of source maps, with a default value of false. When enabled (true), the CLI configures Terser and RequireJS (r.js) packages to generate source maps as needed.
* Running ojet migrate command now adds a log file that includes explanations of what has been migrated and what has not. This log file is located in the project root directory and is named ojet.migrate.log.
* Added an override entry in the package.json file of generated JET applications to pin @types/minimatch to version 5.1.2, ensuring compatibility and preventing errors caused by the latest deprecated version.

### 18.0.0

* node-sass updated to 9.0.0
* Building applications where npm dependencies are hoisted to any level of parent directory is now supported (monorepo directory structure)
* Remove alta based theme creation
* Install 'sass' instead of 'node-sass' for theme building.  Use 'node-sass' only if 'sass' is not present
* Introduced a new flag enableDocGen in oraclejetconfig.json to control API documentation generation. Running ojet add docgen will add this flag and set it to true, allowing API documentation to be generated. Setting enableDocGen to false will disable API documentation generation.
* Added a new entry for jsdocLibraries in oraclejetconfig.json to facilitate maintenance of packages required for API documentation generation.
* Update typescript to 5.7.2

### 17.0.0

* New applications created with ojet will now require nodejs versions 16 or higher
* In the oraclejetconfig.json file, a new property called unversioned has been added. This property controls whether components in the staging folder are versioned. If unversioned is set to true, components will not be versioned; if set to false, components will be versioned. This setting will override the --omit-component-version flag during the build process. If unversioned is not defined, then the --omit-component-version flag will be respected. By default, unversioned is set to true.
* Update typescript version to 5.4.5

### 16.1.0

* Update version of Express to 4.19.2

### 16.0.0

* Update jest version to 29
* Update webpack library to 5.76.0
* Update typescript version to 5.3.2
* Support for dependencyScope attribute in component.json
* Added --server-url option for 'ojet serve'
* Added a new webdriver-ts template
* Default helper scripts now added to package.json when an app is created

### 15.1.0

* Add calls to build and serve hooks during build and serve processes, respectively, for a webpack project

### 15.0.0

* Hybrid build/serve capability based on Cordova has been removed and is no longer supported
* Updated the default webpack library to 5.75.0
* Add a 'tsconfig' option to oraclejetconfig.json paths.source section to optionally allow user to configure the path (relative to the app root path) to their tsconfig.json file
* node-sass updated to 8.0.0
* typescript updated to 5.0.4, and updated default typescript target to es2021 from es2020
* watch-files flag is now added to enable or disable the watch file functionality when serving.
* no-livereload flag now only disables live reload (it used to disable watching files as well). Files
will still be watched unless the watch-files is set to false or no-watch-files flag is used.

### 14.1.0

### 14.0.0

* node-sass updated to 7.0.1
* strict mode is now enabled by default in generated tsconfig.json files
* oraclejet-serve.js and oraclejet-build.js are no longer read or processed.  Users should use other options in oraclejetconfig.json or the user hook system to set similar settings to what is found in oraclejet-serve.js and oraclejet-build.js.  The same configuration objects formerly found in oraclejet-serve.js and oraclejet-build.js can be found in the 'opts' section of the context object passed into the before_build and before_serve hooks.
* Add a "before_injection" hook that runs after all copying but before output files are modified by injectors
* Hybrid build/serve capability based on Cordova is deprecated as of 10.1.0 and is planned for removal in version 15.0.0
* Add 'webpackLibraries' and 'typescriptLibraries' properties to oraclejetconfig.json to facilitate maintenance of third-party libraries needed by Webpack and Typescript, respectively
* Update default typescript version to 4.8.4.  If you see a message warning about the wrong typescript version during build, please check your application's package.json to ensure that it is installing 4.8.4
* When creating a vcomponent component, the template type now defaults to 'function' instead of 'class' if the value of the --vcomponent flag is not specified.
* The CLI now installs itself within an application's node_modules for easy use of npx to issue ojet commands
* A fix was made where the 'strict' typescript setting may not have been passed in to the compiler.  If a project sees new typescript compilation failures, 'strict' mode as set in tsconfig.json may be the issue

### 13.1.0

* In index.html, the injected <script> type will be changed to 'module' for CDN bundle config loading if 'cdn' and 'bundles-config-esm.js' is selected in path_mapping.json, to support the new self-locating JET CDN bundle configuration file
* Hybrid build/serve capability based on Cordova is deprecated as of 10.1.0 and is planned for removal in version 15.0.0

### 13.0.0

* Metadata to support API documentation is now emitted for vcomponents during build
* New webpack applicatons support non-vdom JavaScript and Typescript source code
* Updated default typescript version to 4.6.4
* Add synonym for --vcomponent to allow 'functional' in addition to 'function'
* Enhancements to ease monorepo development

### 12.1.0

* Bug fixes

### 12.0.0

* Add optional 'stripList' property to oraclejetconfig.json to allow providing the list of files/directories to delete instead of using .gitignore
* Add optional '--ci' flag to restore to use npm ci instead of the default npm install
* The third party library 'svgo' by oraclejet-tooling was updated.  If you run into problems during an 'ojet build' surrounding 'svgo', ensure that you have version svgo 2.7.0+ installed in your application's node_modules.  If in the rare case you have an svgMin section in your oraclejetconfig.json, its plugin section may need to be updated per the svgo 2.7.0 documentation
* Custom hooks have been added to run before/after package creation
* Webpack support has been expanded to both debug and release builds
* Added --installer option/installer property for oraclejetconfig.json
* Updated default typescript version to 4.5.4
* Remove obsolete "generatorVersion" from oraclejetconfig.json

### 11.1.0

* ojs/ojcss is supported as a name for the ojcss plugin

### 11.0.0

* Support for es5 code for IE11 has been removed.  There will no longer be a "main_es5.js" or "batch_es5.js" generated in builds.  Therefore, release builds will now directly load the bundle.js after bundling and minifying all code from main.js and the application into it. Previous versions attempted to modify portions of the main.js to refer to the bundled and minified bundle.js for release builds.
* Support has been added for script tag injector tokens in `src/index.html` that will automatically be replaced with the required scripts tags (instead of having to manually specify them). During debug builds, the tokens will be replaced with script tags that will load `require.js` and `main.js`. During release builds, the tokens will be replaced with script tags that load `require.js` and `bundle.js`. Because it is no longer used during release builds, `main.js` will be deleted at the end of the build. This means that if your application does not use the script tag injector tokens, it will have to include a script tag in `src/index.html` that loads `bundle.js` instead of `main.js`. The required tokens can be seen below:
```
<!-- This injects script tags for the main javascript files -->
<!-- injector:scripts -->
<!-- endinjector -->
```
* node-sass updated to 5.0.0
* ojet-cli now requires node 12.21 or later
* A --use-global-tooling flag has been added to 'ojet create'.  This can be used to share a global CLI module among applications to save space and create time.  If this flag is not specified, ojet create will install oraclejet-tooling locally to the created application as in previous versions
* A --basetheme option has been added to ojet create theme to allow the base theme to be redwood or stable.  It is required when creating a theme.
* Failed downloads for Exchange components will now automatically retry
* An add webpack option has been added to facilitate webpack-based release bundling (as an alternative to requirejs bundling)
* 'ojet publish pack' is now atomic. In case of validation issues with any of the components, the publishing request is rejected as a whole, and no artifacts are uploaded to Exchange

### 10.1.0

* Hybrid build/serve capability based on Cordova is deprecated and is planned for removal in version 12.0.0

### 10.0.0

* The before_serve hook now supports custom middleware
configObj['middleware'] = [...];
configObj['preMiddleware'] = [...];
configObj['postMiddleware'] = [...];
If 'middleware' is specified, then that is used exclusively and replaces the default middleware.  If 'preMiddleware' and/or 'postMiddleware' are specified, then those are pre- or post-pended to the default middleware.
* Support for add-on css files
* cssvars is now the default for theming
* Support for creating progressive web apps
* Applications scaffolded from none-NPM templates (`--template=<localDir>`, `--template=<localZip>` & `--template=<remoteZip>`) will:
  * No longer have their oraclejetconfig.json and package.json replaced by ojet's default if they contain one. If the template contains a package.json but it doesn't have the @oraclejet/oraclejet and @oraclejet/oraclejet-tooling dependencies set, ojet will inject the latest versions of them
  * No longer have their tsconfig.json renamed to tsconfig_old.json. ojet no will longer run `ojet add typescript` if it detects the presence of a tsconfig.json in the template during the scaffolding process

### 9.2.0

* The JET pack packaging process during `ojet package pack <jet-pack>` and `ojet publish pack <jet-pack>` has changed. Previously, a JET pack would be packaged with the type definitions and minified files of its member components in the `types` and `min` folders respectively i.e `<jet-pack>/min/<member-component>` and `<jet-pack>/types/<member-component>`. Now, a JET pack is only packaged with its own resources (e.g its `component.json`). The type definitions and minified files of its member components are packaged with the associated component i.e `<member-component>/types` and `<member-component>/min`. No changes are required unless your application relied on the packaged JET pack to contain the `types` and `min` folders of its member components. ojet-cli will automatically rearrange these folders to the previous layout when a JET pack is downloaded from the exchange via `ojet add pack <jet-pack>` to main compatibility with local JET packs.

### 9.1.0

* svg-sprite will no longer be installed by default.  If you have altered JET alta theme .svg files, builds will fail without svg-sprite installed and recommend manual installation of svg-sprite
* ojet build will now return a non-zero error code if optimization fails

### 9.0.0

* The redwood theme is now the default
* There are several breaking changes for all existing ojet applications written in typescript. Please run `ojet add typescript` before building or serving your project after migrating.
* Using `tsc` with the special ojet flag that suppresses the typescript compilation tasks is no longer supported. As a result, `tsc && ojet build --<special-ts-suppress-flag>` and `tsc -w && ojet serve --<special-ts-suppress-flag>` will no longer work reliably. This is because ojet now performs special processing of certain typescript files that cannot be replicated using `tsc`.
* ojet serve now uses express instead of connect.  It is API compatible but provides more options for custom middleware
* Hook scripts must now resolve() the context object they are passed back to the caller to complete the promise.  The default hook scripts do this.  You may see a warning when creating, building, or serving that your hook script context object is null or empty.  This is because hook scripts can now modify or pass back values by modifying the context object.  In addition, make sure hook scripts do *not* remove any properties from the context object, as this could potentially affect the CLI's use of what is now the same object.  Any property modifications should be done for intentional, explicit customization of control of the CLI, such as the require* properties in the before_optimize hooks.
* The ojet serve process now looks for several optional custom values coming back from the before_serve hook: 'express', where a user can create a custom express object and add their own middleware (note that the CLI adds its own to enable static serving and live reload); 'server', which is a complete replacement for the default HTTP NodeJS server + express object created by ojet serve (it could be HTTPS in your before_serve.js hook, for example); 'options', which will be passed as the first argument in the createServer() call if provided; 'urlPrefix', which is used to changed the default prefix to launch the server from 'http' to 'https', for example; and 'http', which allows for the before_serve hook to pass back a NodeJS HTTP or HTTPS object that ojet serve will use to instantiate its server if provided.  'liveReloadServer', used to specify the live reload server used for watches during the ojet serve.  The default is tiny-lr.
* The properties that are now copied up to the top level of the hook context objects (theme, userOptions, requireJs, requireJsEs5, isRequireJsEs5, componentRequireJs, and typescript) will no longer be copied up to the top level of the context object in version 11.  Those properties can also be found in the 'opts' object property of the context object, and as of version 11, that will be the only place they are found and checked.
* css references now point to the CDN if that is enabled in path_mapping.json

### 8.2.0
* The ojet-cli requires nodejs version 10 and higher

### 8.1.0
* package-lock.json will no longer be removed by 'ojet strip'
* Added after_app_typescript, before_app_typescript, after_component_typescript, before_component_typescript custom hooks
* Updated to default to node-sass 4.13.0

### 8.0.0
* The CLI will no longer generate source maps for theme SCSS as JET does not generate them
* Template path_mapping.json files have been updated to support JET's ES5 IE compatibility mode.  In addition, in a non-hybrid release mode build with the OJET CLI, the code/JET bundles are now called "bundle.js" and "bundle_es5.js", with a main.js swapped in to load the appropriate bundle based on whether the user's browser is IE or not.
* Removed unsupported QUnit test templating
* uglify-es replaced by terser
* before_optimize, before_component_optimize hooks added
* optimize flag added to ojet build command to control minification of files
* SASS version is now configurable
* typescript component creation now supported
* themes staging directory renamed to staged-themes at build time

### 7.2.0
* A before_optimize user hook is now available to allow user control of the release mode build bundling
* A 'web' option was added to the 'ojet add' command to add a web target to a hybrid app
* Typescript-based applications can now be created and built using the `--typescript` option in create or the `ojet add typescript` command for existing apps
* Node version 8+ is required

### 7.1.0

### 7.0.0
* Removed support for grunt and Yeoman

### 6.2.0

### 6.1.0

* Added an after_component_create user hook
* Enhanced ojet-cli to allow user-defined options for ojet serve and ojet build

### 6.1.0

* Added an after_component_build user hook
* Added an after_app_install user hook
* Enhanced ojet build so that it will also build all components
* Enhanced path mapping so that in release mode, the path to the minimized directory is used

### 6.0.0

* Deprecation of "ojet add sass" command.  JET is moving to the use of CSS variables for theming, and as a result, will remove the use of SASS in a future release.
* On Cordova v7 or v8: A change to the Android Cordova platform location of its config.xml file may result in an "platform.json not found" or "config.xml not found" error messages when you install the latest Cordova version. This will not prevent you from running ojet serve android, but messages returned by ojet serve may appear different from a previous version of Cordova.
* The current ojet-cli supports 'ojet add windows' but not with a version.  It will install the windows version that comes with the installed Cordova.

If you need a specific version, do the following:

1. cd hybrid
2. cordova platform add windows@latest

### 5.2.0
* Cordova 8 may cause very slow performance during build and serve.  You may wish to consider downgrading to Cordova 7 if this is an issue.

### 5.1.0
When using Cordova-Android 7.0.0+, users may encounter an error like:

ENOENT: no such file or directory, open ‘App\hybrid\platforms\android\res\xml\config.xml’

This is because Cordova changed the Android project file structure, and some third-party plugins/tools are not updated yet.
The error is harmless.  Users can also choose to downgrade to Cordova-Android 6.4.0 to completely avoid the issue. 

More information is in the Cordova-Android 7.0.0 release note: 

https://cordova.apache.org/announcements/2017/12/04/cordova-android-7.0.0.html

### 5.0.0
* The main-release-paths.json file has been replaced by the path-mapping.json file in templates used to scaffold applications
* As a continued effort toward abstraction of direct library calls in the JET CLI, the direct use of yeoman and grunt will be removed in the JET v7.0.0 release.  A new hooks API will be provided to allow for customization of tasks.

### 4.2.0
* No changes

### 4.1.0
* If JET images are altered, they will be repackaged into the JET sprite files

### 4.0.0
* Moved module into @oracle scope, changing the name to @oracle/ojet-cli
* Added 'ojet create component' to scaffold a composite component based on a template
* Due to a [known issue](https://github.com/phonegap/ios-deploy/issues/292) in the ios-deploy module, serving an app to an iOS device may fail to launch the app with error code 253. Try upgrading to ios-deploy@1.9.2, restarting your device and  reconnecting the USB cable.  Otherwise, launch the app manually.
* Due to a [known issue](https://github.com/phonegap/ios-deploy/issues/275) in the ios-deploy module, serving an app to an iOS device may fail to launch the app with error code 1.  Try signing the app with developer credentials rather than distribution credentials.  Otherwise, launch the app manually.
* Updated the help descriptions

### 3.2.0
* Changed 'ojet add theme' to 'ojet create theme' for consistency
* Added 'ojet clean' to clean build output from an app
* Added 'ojet strip' to strip all non source-code from an app
* Updated the help descriptions

### 3.1.0
* Changed the syntax to specify the command first, such as 'ojet list plugins' rather than 'ojet plugins list'
* Updated the help descriptions 

### 3.0.0
* Initial release