'use strict'

module.exports = getVulnerabilities

const fetch = require('isomorphic-fetch')
const {openSync,writeFileSync,closeSync} = require('fs')

const debug = require('debug')('Vulnerabilities')
const {Vulnerability} = require('../report_model')
const RequestBody = require('../oss-fetch-body')

const getRequest = (body => {
	return new Request('https://ossindex.net/v2.0/package', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify(body)
	})
})

/**
 * Gets all vulnerabilities on the current project
 * Need to do POST and send all packages because sending a request for each dependency breaks the server for a bit
 */
function getVulnerabilities (dependencies, cb) {
	debug('Checking Vulnerabilities')

	const requestBody = []

	for(let prop in dependencies){
		const dependency = dependencies[prop]
		const versions = [dependency.main_version, ...dependency.private_versions]
		const minVersion = versions.sort(versionSorter)[0]

		requestBody.push(new RequestBody('npm', dependency.title, minVersion))

	}

	fetch(getRequest(requestBody))
		.then(response => {
			response.json()
				.then(body => {
					for(let prop in body){
						const vulnerability = body[prop]
						if(!vulnerability.vulnerabilities)
							continue
		
						const vulnerabilities = []
						for(let prop in vulnerability.vulnerabilities){
							const vulnerabilitiesResponse = vulnerability.vulnerabilities[prop]
							const vul = new Vulnerability(vulnerabilitiesResponse.title, vulnerability.name,
								vulnerabilitiesResponse.description, vulnerabilitiesResponse.references, 
								vulnerabilitiesResponse.versions)
							vulnerabilities.push(vul)
						}
		
						dependencies[vulnerability.name].vulnerabilities = vulnerabilities
					}
					writeToFile('dependenciesAndVulnerabilities.json', JSON.stringify(dependencies))
					debug('End process')
				})
		})
}

function versionSorter(v1, v2){
	const value1 = v1.replace('.','')
	const value2 = v2.replace('.','')

	if(value1 < value2)
		return -1
	if(value1 > value2)
		return 1
	return 0
}


function writeToFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}