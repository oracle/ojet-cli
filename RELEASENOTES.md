## Release Notes for ojet-cli ##

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
