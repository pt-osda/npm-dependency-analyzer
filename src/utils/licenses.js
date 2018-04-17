'use strict'

module.exports = getLicences

const {openSync,writeFileSync,closeSync} = require('fs')

const debug = require('debug')('Licenses')

/**
 * Gets the licenses from each dependency
 * @param {Object} param0 object with information about all dependencies in the current project
 */
function getLicences({dependencies}){
	debug('Checking Licenses')

	const keyQuantity = Object.keys(dependencies).length
	let count = 0
	const objToWrite = {}

	for(let dependency in dependencies) {
		objToWrite[dependency.name] = dependency.license

		if(++count == keyQuantity){
			writeFile('licenses.json', JSON.stringify(objToWrite) )
			debug('Licenses checked with success')
		}
	}
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}