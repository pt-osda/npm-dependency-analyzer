'use strict'

import vulnerabilities from './utils/vulnerabilities'
import getDependencies from './utils/dependencies'
import {Report} from './report_model'
import fileManager from './utils/file-manager'
import catchifyPromise from './utils/utility-functions'
import debugSetup from 'debug'
import fetch from 'isomorphic-fetch'

const debug = debugSetup('Index')

const getRequest = body => {
  return new Request('http://localhost:8080/report', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  })
}

function generateReport (pkg, dependencies) {
  const report = new Report(pkg.version, pkg.name, pkg.description, new Date(Date.now()).toISOString())
  let i = 0
  for (let prop in dependencies) {
    i += dependencies[prop].vulnerabilities.length
  }
  debug('Vulnerabilities: %d', i)
  report.dependencies = dependencies

  fileManager.writeBuildFile('report.json', JSON.stringify(report))

  return report
}

/**
 * Analyzes license and vulnerabilities from all dependencies
 */
export default function () {
  debug('Getting all dependencies')

  getDependencies(async (dependenciesError, {pkg, dependencies}) => {
    if (dependenciesError) {
      debug('Exiting with error getting dependencies')
      throw new Error(`DependenciesError: ${dependenciesError.message}`)
    }

    const [vulnerabilitiesError, deps] = await catchifyPromise(vulnerabilities(dependencies))
    if (vulnerabilitiesError) {
      throw new Error(`VulnerabilityError: ${vulnerabilitiesError.message}`)
    }
    const report = generateReport(pkg, deps)

    const [reportError, reportInfo] = await catchifyPromise(fetch(getRequest(report)))
    if (reportError) {
      throw new Error(`VulnerabilityError: ${vulnerabilitiesError.message}`)
    }
  })
}
