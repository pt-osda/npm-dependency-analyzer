'use strict'

module.exports = {
	getDependencyGraph,
	checkProject
}

const licenses = require('./utils/licenses')
const vulnerabilities = require('./utils/vulnerabilities')
const dependencies = require('./utils/dependencies')
const report = require('./report_model')
const {openSync, writeFileSync, closeSync, readdir, readFileSync} = require('fs')

const debug = require('debug')('Index')
const async = require('async')
const rpt = require ('read-package-tree')

/**
 * Analyzes license and vulnerabilities from all dependencies 
 * @param {String} command npm CLI command to execute. values can be "--production" and --development or undefined
 */
function checkProject(command){
	debug('Getting all dependencies')

	dependencies.getDependencies((err, {pkg, dependencies}) => {
		if(err){
			debug('Exiting with error getting dependencies')
			throw new Error(err.message)
		}
		vulnerabilities(dependencies, ()=>{} ) //TODO: Make callback
	})

	/*function dependencyCb(dependencies) {
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

	getDependencyGraph(commandString, dependencyCb)*/
	
}

function generateReport(dependencies, vulnerabilities) {

	const report = new report.Report('tag', dependencies.version, dependencies.name, dependencies.description)

	for(let dependency in dependencies['dependencies']){
		const currentDependency = dependencies['dependencies'][dependency]
		const dep = new report.Dependency(currentDependency.name, '', currentDependency.license)
		
		const vul = vulnerabilities.find(obj => {
			obj.module == dep.name
		})
			
		if(vul){
			dep.vulnerabilities.push(
				new report.Vulnerability(
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
	const nodeModules = {}

	rpt('./', (err,data) => {
		if(err){
			throw new Error(err.message)
		}
	})

	readdir('./node_modules', 'utf-8', (err, files) => {
		if(err){
			throw new Error(err.message)
		}
		async.forEachOf(files, (fileName) => {
			if(fileName.includes('.'))
				return
			const fileContent = readFileSync(`./node_modules/${fileName}/package.json`, 'utf-8')
			nodeModules[fileName] = JSON.parse(fileContent)
			if(fileName === files[files.length - 1]){
				generateGraph(nodeModules)
			}
		})
	})
}

function writeFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}


