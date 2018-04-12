'use strict'

module.exports = getLicences

const async = require('async')
const {openSync,writeFileSync,closeSync} = require('fs')

const debug = require('debug')('Licenses')

function getLicences({dependencies}){
	debug('Checking Licenses')
	const keyQuantity = Object.keys(dependencies).length
	let count = 0
	const objToWrite = {}

	async.forEachOf(dependencies, (value) => {
		objToWrite[value.name] = value.license

		if(++count == keyQuantity){
			writeFile('licenses.json', JSON.stringify(objToWrite) )
			debug('Licenses checked with success')
		}
	}, (error) => {
		debug('License check failed: \n\t%0', error)
	})
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}