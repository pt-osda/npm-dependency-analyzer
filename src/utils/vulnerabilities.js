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
export default async function getVulnerabilities (dependencies) {
  debug('Checking Vulnerabilities')

  // const requestBody = []

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
  return dependencies
}
