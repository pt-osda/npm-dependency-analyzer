#!/usr/bin/env node

/* 
 * Command that reads the package.json from the project this module is a dependency,
 * and writes it's content to a new file on a build folder
 */

const index = require('../src/index')
const { existsSync, mkdirSync } = require('fs')

if(!existsSync('./build')) 
	mkdirSync('./build')

index.checkProject()