# ojet-cli 3.2.0

## About the module
This module contains a command line interface for Oracle JET web and hybrid mobile application development.

This is an open source project maintained by Oracle Corp.

## Installation
For web app development, install this module as follows:
```bash
npm install -g ojet-cli
```

For hybrid mobile app development, install it together with Cordova:
```bash
npm install -g cordova ojet-cli
```

## Usage
The Oracle JET command line interface observes the following syntax:
```bash
ojet <task> [scope] [parameter(s)] [options]
```
The available tasks are:
```
add ........................... Adds platforms, plugins and more to a JET app

build ......................... Builds a JET app

clean ......................... Cleans the JET app build output

create ........................ Creates a new JET app or a custom theme

help .......................... Displays command line help
                                Tasks: [add|build|create|help|list|remove|restore|serve]

list .......................... Lists platforms and plugins within a JET app

remove ........................ Removes platforms and plugins from a JET app

restore ....................... Restores a JET app

serve ......................... Serves a JET app to an emulator, device or the browser

strip ......................... Strips all non source files from the JET app

```
You can view this information by invoking the help task:
```
ojet help
```
For more detailed help, you can invoke:
```
ojet help <task> [<scope>]
```
For example, to view help on adding a plugin:
```
ojet help add plugin
```

## [Contributing](https://github.com/oracle/ojet-cli/tree/master/CONTRIBUTING.md)
Oracle JET is an open source project.  Pull Requests are currently not being accepted. See [CONTRIBUTING](https://github.com/oracle/ojet-cli/tree/master/CONTRIBUTING.md) for details.

## [License](https://github.com/oracle/ojet-cli/tree/master/LICENSE.md)
Copyright (c) 2016, 2017 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0

