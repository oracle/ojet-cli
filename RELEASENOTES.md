## Release Notes for ojet-cli ##

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
