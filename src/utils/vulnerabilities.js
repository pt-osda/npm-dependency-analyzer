'use strict'

import catchifyPromise from './utility-functions'
import fileManager from './file-manager'

import fetch from 'isomorphic-fetch'
import lodash from 'lodash'
// import semver from 'semver'
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

  const notFlatRequestBody = dependencies.map(dependency => {
    const versions = [dependency.main_version, ...dependency.private_versions]

    return versions.map(version => {
      return new RequestBody('npm', dependency.title, version)
    })
  })

  const requestBody = lodash.flattenDeep(notFlatRequestBody)

  const [fetchError, response] = await catchifyPromise(fetch(getRequest(requestBody)))
  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const [jsonError, body] = await catchifyPromise(response.json())

  if (response.status !== 200) {
    // throw new Error('Vulnerabilities Request failed: Status-' + response.status)
    debug('API failed to fetch vulnerabilities: %O', body)
    dependencies.forEach(elem => {
      elem.error_info = 'Failed to fetch vulnerabilities'
    })
    return dependencies
  }

  if (jsonError) {
    throw new Error(jsonError.message)
  }

  fileManager.writeBuildFile('api-vulnerabilities.json', JSON.stringify(body))

  dependencies.forEach(dependency => {
    const dependencyVulnerabilities = body.filter(elem => elem.title === dependency.title)

    dependencyVulnerabilities.forEach(elem => {
      if (!elem.vulnerabilities) {
        return
      }

      elem.vulnerabilities.forEach(vulnerability => {
        if (!dependency.vulnerabilities.some(depElem => depElem.id === vulnerability.id)) {
          dependency.vulnerabilities.push(
            new Vulnerability({
              id: vulnerability.id,
              title: vulnerability.title,
              description: vulnerability.description,
              references: vulnerability.references,
              versions: vulnerability.versions
            }))
          dependency.vulnerabilities_count += 1
        }
      })
    })
  })

  fileManager.writeBuildFile('dependencies-vulnerabilities.json', JSON.stringify(dependencies))
  debug('End process')
  return dependencies
}
