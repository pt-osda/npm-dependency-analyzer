'use strict'

module.exports = {
	getDependencyGraph,
	checkProject
}

const exec = require('executive')
const licenses = require('./utils/licenses')
const vulnerabilities = require('./utils/vulnerabilities')
const {openSync, writeFileSync, closeSync } = require('fs')

const debug = require('debug')('Dependencies')

const commands = {
	'--production': 'npm la --json --prod', //Display only the dependency tree for packages in dependencies.
	'--development': 'npm la --json --dev'  //Display only the dependency tree for packages in devDependencies.
}

const defaultCommand = 'npm la --json'

function checkProject(command){
	debug('Getting all dependencies')
	if(command == null){
		getDependencyGraph(defaultCommand)
		return
	}

	const commandString = commands[command]
	if(commandString == null){
		debug(`Invalid command received: ${command}. \n Commands available: \n\t--production \n\t--development`)
		throw new Error('Invalid arguments')
	}

	getDependencyGraph(commandString)
	
}

function getDependencyGraph(commandString){
	debug('Executing command: "%s"', commandString)
	exec.quiet(commandString)
		.then(result => {
			if(result.error){
				throw new Error(result.stderr)
			}
			if(result.stdout === ''){
				throw new Error('Invalid command')
			}
			
			writeFile('dependencies.json', result.stdout)
			licenses(JSON.parse(result.stdout))
			vulnerabilities()
		})
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}


