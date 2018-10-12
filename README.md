# @oracle/ojet-cli 6.0.0

## About the module
This module contains a command line interface for Oracle JET web and hybrid mobile application development.

This is an open source project maintained by Oracle Corp.

## Installation
For web app development, install this module as follows:
```
npm install -g @oracle/ojet-cli
```

For hybrid mobile app development, install it together with Cordova:
```
npm install -g @oracle/ojet-cli cordova
```

On macOS, you will need to use 'sudo'.

## Usage
The Oracle JET command line interface observes the following syntax:
```
ojet <command> [<scope>] [<parameter(s)>] [<options>]
```
The available commands are:
```
add ................ Adds platforms, plugins and more to a JET app

build .............. Builds a JET app

clean .............. Cleans build output from a JET app

create ............. Creates a new JET app, custom theme, or component

help ............... Displays command line help
                     Commands: [add|build|clean|create|list|remove|restore|serve|strip]

list ............... Lists platforms, plugins and more within a JET app

remove ............. Removes platforms, plugins and more from a JET app

restore ............ Restores missing dependencies, plugins and libraries to a JET app

serve .............. Serves a JET app to an emulator, device or the browser

strip .............. Strips all non source files from the JET app

```
You can view this information by invoking the help task:
```
ojet help
```
For more detailed help, you can invoke:
```
ojet help <command> [<scope>]
```
For example, to view help on using the 'create' command:
```
ojet help create
```
Or view help on adding a plugin:
```
ojet help add plugin
```

For more information on the Oracle JET CLI, refer to the [Oracle JET Developers Guide](http://www.oracle.com/pls/topic/lookup?ctx=jet600&id=homepage).

## [Contributing](https://github.com/oracle/ojet-cli/tree/master/CONTRIBUTING.md)
Oracle JET is an open source project.  Pull Requests are currently not being accepted. See [CONTRIBUTING](https://github.com/oracle/ojet-cli/tree/master/CONTRIBUTING.md) for details.

## [License](https://github.com/oracle/ojet-cli/tree/master/LICENSE.md)
Copyright (c) 2016, 2018 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0

