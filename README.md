
# npm-dependency-analyzer

[![npm](https://img.shields.io/npm/v/npm-dependency-analyzer.svg)](https://www.npmjs.com/package/npm-dependency-analyzer)
[![license](https://img.shields.io/github/license/pt-osda/npm-dependency-analyzer.svg)](https://github.com/PsychoSnake/MarkdownTest/blob/master/LICENSE)
[![Dependency Status](https://img.shields.io/david/pt-osda/npm-dependency-analyzer.svg)](https://david-dm.org/pt-osda/npm-dependency-analyzer.svg)

Analyze Open Source dependencies in a project developed on a Node.js environment. This plugin analyzes all dependencies of a project to check for vulnerabilities and licenses.

# Requirements
* [Download and install Node.js](https://nodejs.org/en/download/) with version 8.0.0 or higher.
* Projects **MUST** have a policy file named **.osda**

<details><summary>Policy file structure</summary>
<p>

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Project Policy",
  "description": "A policy with a project related configurations and \tinformation",
  "type": "object",
  "properties": {
    "project_id": {
      "description": "Id of the project to present in the report",
      "type": "string"
    },
    "project_name": {
      "description": "Name of the project to present in the report",
      "type": "string"
    },
    "project_version": {
      "description": "Version of the project to present in the report",
      "type": "string"
    },
    "project_description": {
      "description": "Description of the project to present in the report",
      "type": "string"
    },
    "organization": {
      "description": "The organization the project belongs to",
      "type": "string"
    },
    "repo": {
      "description": "The repository in github the project belongs to",
      "type": "string"
    },
    "repo_owner": {
      "description": "The owner of the repository the project belongs to",
      "type": "string"
    },
    "admin": {
      "description": "The username of the administrator of the project (Only used in project first report)",
      "type": "string"
    },
    "invalid_licenses": {
      "description": "The names of all invalid licenses. Default value is an empty collection",
      "type": "array"
    },
    "fail": {
      "description": "Indicates if the build should fail in case a vulnerability is found. Default value is false",
      "type": "boolean"
    },
    "api_cache_time": {
      "description": "Indicates, in seconds, the amount of time the cached results should be considered valid. If 0 (which is the default value), there are no restrictions on the lifetime of cached results",
      "type": "number"
    }
  },
  "required": ["project_id", "project_name", "admin"]
}
```

</p>
</details>

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/package/npm-dependency-analyzer).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```bash
 $ npm install --save-dev npm-dependency-analyzer
```

## How to Use

:warning: In order for the plugin to be executed successfully, it needs to have all dependencies installed by the user [install all dependencies](https://docs.npmjs.com/cli/install) before using any functionality provided:
```bash
$ npm install
```

This plugin provides an executable that is placed into ["node_modules/.bin"](https://docs.npmjs.com/files/package.json#bin) folder of any project it is dependent. This executable can be used in the [script property](https://docs.npmjs.com/files/package.json#scripts).
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
        "node":">=8.0.0",
        "npm":">=5.7.0"
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
After making the necessary adjustments to the package.json, the execution of the build script will have the plugin generate a report based on the findings, storing it on a build folder at the root of the project.
