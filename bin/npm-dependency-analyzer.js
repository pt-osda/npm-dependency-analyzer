#!/usr/bin/env node

/* 
 * Command that reads the package.json from the project this module is a dependency,
 * and writes it's content to a new file on a build folder
 */  



const lib = require('../lib/index')
const fs = require('fs')

if(!fs.existsSync('./build'))
	fs.mkdirSync('./build')

lib.getDependencyGraph("--production", writeFile)

lib.getDependencyGraph("--development", writeFile)


function writeFile(fileName, data){
    const fileDescriptor = fs.openSync('build/'+fileName, 'w')
	fs.writeFileSync(fileDescriptor, data, 'utf-8')
	fs.closeSync(fileDescriptor)
}