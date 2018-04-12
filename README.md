
# npm-dependency-analyzer

[![npm](https://img.shields.io/npm/v/npm-dependency-analyzer.svg)](https://www.npmjs.com/package/npm-dependency-analyzer)
[![license](https://img.shields.io/github/license/pt-osda/npm-dependency-analyzer.svg)](https://github.com/PsychoSnake/MarkdownTest/blob/master/LICENSE)

Analyze Open Source dependencies in a project developed on a Node.js environment. This plugin analyzes all dependencies of a project to check for vulnerabilities and licenses.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 4.0.0 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```bash
 $ npm install --save-dev npm-dependency-analyzer
```

## How to Use

:warning: In order for the plugin to be executed successfully, it is needed by the user to [install all dependencies](https://docs.npmjs.com/cli/install) before using any functionality provided:
```bash
$ npm install
```

This plugin provides a command to be executed in a [npm script](https://docs.npmjs.com/misc/scripts) named [***npm-dependency-analyzer***](https://github.com/pt-osda/npm-dependency-analyzer/blob/master/bin/npm-dependency-analyzer.js).
This command is to be used in the build process of a project, as demonstrated in the example below of a package.json:
```json
{
    "name":"example-project",
    "version":"1.0.0",
    "description":"Example of a project package.json",
    "main":"index.js",
    "bin":{
        "example-command":"./bin/example-command.js"
    },
    "scripts":{
        "prebuild":"npm install && rimraf build/",
        "build":"npm run lint && npm test && npm-dependency-analyzer",
        "lint":"eslint .",
        "test":"mocha"
    },
    "engines":{
        "node":">=4.0.0",
        "npm":">=2.0.0"
    },
    "keywords":[
        "Example",
        "Plugin"
    ],
    "dependencies":{
        "async":"^2.6.0",
        "debug":"^3.1.0",
        "executive":"^1.5.13",
        "nsp":"3.2.1"
    },
    "devDependencies":{
        "eslint":"^4.19.0",
        "eslint-config-standard":"^11.0.0",
        "eslint-plugin-import":"^2.10.0",
        "eslint-plugin-node":"^6.0.1",
        "eslint-plugin-promise":"^3.7.0",
        "eslint-plugin-standard":"^3.0.1",
        "mocha":"^5.0.4",
        "rimraf":"^2.6.2"
    }
}
```
After making the necessary adjustments to the package.json, when running the build script the plugin will execute and generate a report based on the findings, storing it on a build folder at the root of the project.
