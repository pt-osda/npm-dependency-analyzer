#!/usr/bin/env node

/* 
 * Command that reads the package.json from the project this module is a dependency,
 * and writes it's content to a new file on a build folder
 */  



const io = require('../lib/index')
const fs = require('fs')

const packageContent = io.readPackage()

console.log(packageContent)

if(!fs.existsSync('./build'))
	fs.mkdirSync('./build')
io.writePackage('./build/testFileWrite.txt', packageContent)