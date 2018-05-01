'use strict'

module.exports = getVulnerabilities

const fetch = require('isomorphic-fetch')
const fileManager = require('./file-manager')
const semver = require('semver')

const debug = require('debug')('Vulnerabilities')
const {Vulnerability} = require('../report_model')
const RequestBody = require('../oss-fetch-body')

const getRequest = body => {
  return new Request('https://ossindex.net/v2.0/package', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * Gets all vulnerabilities on the current project
 * Need to do POST and send all packages because sending a request for each dependency breaks the server for a bit
 */
async function getVulnerabilities (dependencies, cb) {
  debug('Checking Vulnerabilities')

  const requestBody = []

  for (let prop in dependencies) {
    const dependency = dependencies[prop]
    if (!dependency.title) { // In case it's a optional dependency and was not needed to install, it's not gonna have a name or version
      delete dependencies[prop]
      continue
    }

    const versions = [dependency.main_version, ...dependency.private_versions]
    const minVersion = versions.sort(semver.compare)[0]

    requestBody.push(new RequestBody('npm', dependency.title, minVersion))
  }

  const response = await fetch(getRequest(requestBody))
  if (response.status !== 200) {
    throw new Error('Vulnerabilities Request failed: Status-' + response.status)
  }
  const body = await response.json()

  for (let prop in body) {
    const vulnerability = body[prop]
    if (!vulnerability.vulnerabilities) { continue }

    const vulnerabilities = vulnerability.vulnerabilities.map(elem => {
      return new Vulnerability(
        {
          vulnerability_title: elem.title,
          module_title: vulnerability.name,
          description: elem.description,
          references: elem.references,
          versions: elem.versions
        })
    })

    dependencies.find(elem => { return elem.title === vulnerability.name })
      .vulnerabilities = vulnerabilities
  }

  fileManager.writeBuildFile('dependencies-vulnerabilities.json', JSON.stringify(dependencies))
  debug('End process')
  cb(null, dependencies)
}
