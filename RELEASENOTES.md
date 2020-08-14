## Release Notes for ojet-cli ##

### 9.1.0

* svg-sprite will no longer be installed by default.  If you have altered JET alta theme .svg files, builds will fail without svg-sprite installed and recommend manual installation of svg-sprite

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
