'use strict'

import catchifyPromise from './utility-functions'
import fileManager from './file-manager'

import fetch from 'isomorphic-fetch'
import semver from 'semver'
import {Vulnerability} from '../report_model'
import RequestBody from '../oss-fetch-body'
import debugSetup from 'debug'

const debug = debugSetup('Vulnerabilities')

const getRequest = body => {
  return new Request('http://localhost:8080/npm/dependency/vulnerabilities', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  })
}

// TODO: Need to check for error from the API. In case of error affect the Dependency property for error_info and not put vulnerabilitiesCount
/**
 * Gets all vulnerabilities on the current project
 * Need to do POST and send all packages because sending a request for each dependency breaks the server for a bit
 */
export default async function getVulnerabilities (dependencies) {
  debug('Checking Vulnerabilities')

  const requestBody = dependencies.map(dependency => {
    const versions = [dependency.main_version, ...dependency.private_versions]
    const minVersion = versions.sort(semver.compare)[0]

    return new RequestBody('npm', dependency.title, minVersion)
  })

  const [fetchError, response] = await catchifyPromise(fetch(getRequest(requestBody)))
  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (response.status !== 200) {
    throw new Error('Vulnerabilities Request failed: Status-' + response.status)
  }

  const [jsonError, body] = await catchifyPromise(response.json())
  if (jsonError) {
    throw new Error(jsonError.message)
  }

  fileManager.writeBuildFile('api-vulnerabilities.json', JSON.stringify(body))

  for (let prop in body) {
    const vulnerability = body[prop]
    if (!vulnerability.vulnerabilities) { continue }

    const vulnerabilities = vulnerability.vulnerabilities.map(elem => {
      return new Vulnerability(
        {
          id: elem.id,
          title: elem.title,
          description: elem.description,
          references: elem.references,
          versions: elem.versions
        })
    })

    const dependency = dependencies.find(elem => { return elem.title === vulnerability.title })
    dependency.vulnerabilities = vulnerabilities
    dependency.vulnerabilities_count = vulnerability.totalVulnerabilities
  }

  fileManager.writeBuildFile('dependencies-vulnerabilities.json', JSON.stringify(dependencies))
  debug('End process')
  return dependencies
}
