'use strict'

module.exports = getVulnerabilities

const exec  = require('executive')
const {openSync,writeFileSync,closeSync} = require('fs')

const debug = require('debug')('Vulnerabilities')

/**
 * Gets all vulnerabilities on the current project
 */
function getVulnerabilities(cb){
	debug('Checking Vulnerabilities')

	exec.quiet('nsp check --reporter json')
		.then(result => {
			if(result.error){
				debug('Error: %0'+result.error)
				debug('Standard Error: %s'+result.stderr)
			}

			debug('Vulnerabilities checked with success')
			writeFile('vulnerabilities.json', result.stdout)
			if(result.stdout === '')
				cb([])
			else
				cb(JSON.parse(result.stdout))
		})
		
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}