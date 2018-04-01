'use strict'

const fs = require('fs')

module.exports = {
	readPackage,
	writePackage
}
function readPackage(){
	const fileData = fs.readFileSync('./package.json', 'utf-8')
	return fileData
}
function writePackage(filePath, data){
	const fileDescriptor = fs.openSync(filePath, 'w')
	fs.writeFileSync(fileDescriptor, data, 'utf-8')
	fs.closeSync(fileDescriptor)
}