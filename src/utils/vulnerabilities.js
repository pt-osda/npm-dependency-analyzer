'use strict'

module.exports = getVulnerabilities

const exec  = require('executive')
const fs = require('fs')


function getVulnerabilities(){
	console.log('Starting to check vulnerabilities')

	exec.quiet('nsp check --reporter json',
		(error, stdout, stderr) => {
			if(error){
				console.log('Error: '+error)
				console.log('Standard Error: '+stderr)
			}

			console.log('Vulnerabilities checked with success')
			writeFile('vulnerabilities', stdout)
		})
		
}

function writeFile(fileName, data){
	const fileDescriptor = fs.openSync('build/'+fileName+'.txt', 'w')
	fs.writeFileSync(fileDescriptor, data, 'utf-8')
	fs.closeSync(fileDescriptor)
}