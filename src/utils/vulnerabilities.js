'use strict'

import fetch from 'isomorphic-fetch'
import {flattenDeep} from 'lodash'
import bunyan from 'bunyan'

import {catchifyPromise} from './utility-functions'
import {Vulnerability} from '../report_model'
import RequestBody from '../oss-fetch-body'

const logger = bunyan.createLogger({name: 'Fetch-Vulnerabilities'})

const getRequest = (body, cacheTime) => {
  return new Request('http://35.234.151.254/npm/dependency/vulnerabilities', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `max-age=${cacheTime || 0}`,
      'Authorization': `Bearer ${process.env.CENTRAL_SERVER_TOKEN}`
    },
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * Gets all vulnerabilities on the current project
 * Need to do POST and send all packages because sending a request for each dependency breaks the server for a bit
 */
export default async function getVulnerabilities (dependencies, cacheTime) {
  logger.info('Fetching vulnerabilities')

  const notFlatRequestBody = dependencies.map(dependency => {
    const versions = [dependency.main_version, ...dependency.private_versions]

    return versions.map(version => {
      return new RequestBody('npm', dependency.title, version)
    })
  })

  const requestBody = flattenDeep(notFlatRequestBody)

  const [fetchError, response] = await catchifyPromise(fetch(getRequest(requestBody, cacheTime)))
  if (fetchError) {
    logger.warn(`Vulnerabilities Request failed: %O`, fetchError.message)
    throw new Error(fetchError)
  }

  const [jsonError, body] = await catchifyPromise(response.json())

  if (response.status !== 200) {
    logger.warn(`Vulnerabilities Request failed: Status - %s; Reason - %O`, response.status, body)
    throw new Error(body)
  }

  if (jsonError) {
    logger.warn(`Vulnerabilities Request failed: Status - %s; Reason - %O`, response.status, jsonError)
    throw new Error(jsonError.message)
  }

  dependencies.forEach(dependency => {
    const dependencyVulnerabilities = body.filter(elem => elem.title === dependency.title)

    dependencyVulnerabilities.forEach(elem => {
      if (!elem.vulnerabilities) {
        return
      }

      elem.vulnerabilities.forEach(vulnerability => {
        if (!dependency.vulnerabilities.some(depElem => depElem.id === vulnerability.id)) {
          dependency.vulnerabilities.push(new Vulnerability(vulnerability))
          dependency.vulnerabilities_count += 1
        }
      })
    })
  })

  logger.info('Finished fetching vulnerabilities')
  return dependencies
}
