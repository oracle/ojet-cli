# @oracle/ojet-cli 15.1.0

## About the module
This module contains a command line interface for Oracle JET web application development.

This is an open source project maintained by Oracle Corp.

## Installation
For web app development, install this module as follows:
```
npm install -g @oracle/ojet-cli
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

serve .............. Serves a JET app to the browser

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

For more information on the Oracle JET CLI, refer to the [Oracle JET Developers Guide](http://www.oracle.com/pls/topic/lookup?ctx=jet1510&id=homepage).

## Contributing
This project is not accepting external contributions at this time. For bugs or enhancement requests, please file a GitHub issue unless it’s security related. When filing a bug remember that the better written the bug is, the more likely it is to be fixed. If you think you’ve found a security vulnerability, do not raise a GitHub issue and follow the instructions in our [security policy](./SECURITY.md).

## Security
Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

## License
Copyright (c) 2023 Oracle and/or its affiliates and released  under the 
[Universal Permissive License (UPL)](https://oss.oracle.com/licenses/upl/), Version 1.0