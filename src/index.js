'use strict'

module.exports = {
	getDependencyGraph,
	checkProject
}

const exec = require('executive')
const licenses = require('./utils/licenses')
const vulnerabilities = require('./utils/vulnerabilities')
const {openSync, writeFileSync, closeSync } = require('fs')

const commands = {
	'--production': 'npm la --json --prod', //Display only the dependency tree for packages in dependencies.
	'--development': 'npm la --json --dev'  //Display only the dependency tree for packages in devDependencies.
}

const defaultCommand = 'npm la --json'

function checkProject(command){
	if(command == null){
		console.log('[ GET DEPENDENCIES ]: Executing command for all dependencies')
		getDependencyGraph(defaultCommand)
		return
	}

	const commandString = commands[command]
	if(commandString == null){
		console.log(`Invalid command received: ${command}. \n Commands available: \n\t--production \n\t--development`)
		throw new Error('Invalid arguments')
	}

	console.log(`[ GET DEPENDENCIES ]: Executing command: ${command}`)
	getDependencyGraph(commandString)
	
}

function getDependencyGraph(commandString){
	console.log(commandString)
	exec.quiet(commandString, 
		(error, stdout, stderr) => {
			if(error){
				throw new Error(stderr)
			}
			if(stdout === ''){
				throw new Error('Invalid command')
			}
			
			writeFile('dependencies.txt', stdout)
			licenses()
			vulnerabilities()
		})
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}


