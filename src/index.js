'use strict'

module.exports = {
	getDependencyGraph,
	checkProject
}

const exec = require('executive')
const licenses = require('./utils/licenses')
const vulnerabilities = require('./utils/vulnerabilities')
const reportClass = require('./report_model')
const {openSync, writeFileSync, closeSync } = require('fs')

const debug = require('debug')('Dependencies')

const commands = {
	'--production': 'npm la --json --prod', //Display only the dependency tree for packages in dependencies.
	'--development': 'npm la --json --dev'  //Display only the dependency tree for packages in devDependencies.
}

const defaultCommand = 'npm la --json'

/**
 * Analyzes license and vulnerabilities from all dependencies 
 * @param {String} command npm CLI command to execute. values can be "--production" and --development or undefined
 */
function checkProject(command){
	debug('Getting all dependencies')

	function dependencyCb(dependencies) {
		licenses(dependencies)

		vulnerabilities( vulnerabilities => generateReport(dependencies, vulnerabilities) )
	}
	if(command == null){
		getDependencyGraph(defaultCommand, dependencyCb)
		return
	}

	const commandString = commands[command]
	if(commandString == null){
		debug(`Invalid command received: ${command}. \n Commands available: \n\t--production \n\t--development`)
		throw new Error('Invalid arguments')
	}

	getDependencyGraph(commandString, dependencyCb)
	
}

function generateReport(dependencies, vulnerabilities) {

	const report = new reportClass.Report('tag', dependencies.version, dependencies.name, dependencies.description)

	for(let dependency in dependencies['dependencies']){
		const currentDependency = dependencies['dependencies'][dependency]
		const dep = new reportClass.Dependency(currentDependency.name, '', currentDependency.license)
		
		const vul = vulnerabilities.find(obj => {
			obj.module == dep.name
		})
			
		if(vul){
			dep.vulnerabilities.push(
				new reportClass.Vulnerability(
					vul.title,vul.module, vul.overview, vul.recommendation,
					vul.advisory, vul.cvss_score, vul.vulnerable_versions
				)
			)
		}
		console.log('HELLO: ' + JSON.stringify(dep))
		report.dependencies.push(dep)
	}

	writeFile('report.json', JSON.stringify(report))
}

/**
 * Gets all dependencies of the current project and writes them to a file
 * @param {String} commandString npm CLI command to execute
 * @param {Function} cb callback to return all dependencies
 */
function getDependencyGraph(commandString, cb){
	debug('Executing command: "%s"', commandString)
	exec.quiet('npm la --json')
		.then(result => {
			if(result.error){
				throw new Error(result.stderr)
			}
			if(result.stdout === ''){
				throw new Error('Invalid command')
			}
			
			writeFile('dependencies.json', result.stdout)
			cb(JSON.parse(result.stdout))
		})
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}


