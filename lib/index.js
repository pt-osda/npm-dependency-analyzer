'use strict'

const fs = require('fs')
const childProcess = require('child_process')

const commands = {
	"--production": "npm ls --json --prod", //Display only the dependency tree for packages in dependencies.
	"--development": "npm ls --json --dev"  //Display only the dependency tree for packages in devDependencies.
}

module.exports = {
	getDependencyGraph
}

function getDependencyGraph(command,cb){
	const commandString = commands[command]
	console.log(`Executing command: ${command}`)
	if(command){
		childProcess.exec(commandString,
			(error, stdout, stderr) => {
				console.log('Error: '+error)
				console.log('Standard Output: '+stdout)
				console.log('Standard Error: '+stderr)
				cb(command+".txt", stdout)
			})
	}
	else {
		console.log(`Invalid command received: ${command}. \n Commands available: \n\t--production \n\t--development`)
		process.exit(-1)
	}
}


