'use strict'

import vulnerabilities from './utils/vulnerabilities'
import getDependencies from './utils/dependencies'
import {Report} from './report_model'
import fileManager from './utils/file-manager'
import catchifyPromise from './utils/utility-functions'
import debugSetup from 'debug'
import fetch from 'isomorphic-fetch'
import licenseManager from './utils/licenses'

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

function generateReport (policyData, pkg, dependencies) {
  const reportOptions = {
    id: policyData.project_id,
    name: policyData.project_name,
    version: pkg.version,
    description: pkg.description,
    timestamp: new Date(Date.now()).toISOString(),
    organization: policyData.organization,
    repo: policyData.repo,
    repo_owner: policyData.repo_owner
  }

  const report = new Report(reportOptions)
  report.insertDependencies(dependencies)

  fileManager.writeBuildFile('report.json', JSON.stringify(report))

  return report
}

/**
 * Analyzes license and vulnerabilities from all dependencies
 */
export default async function (policyData) {
  debug('Getting all dependencies')

  const [dependenciesError, {pkg, dependencies}] = await catchifyPromise(getDependencies(policyData.invalid_licenses))
  if (dependenciesError) {
    debug('Exiting with error getting dependencies')
    throw new Error(`DependenciesError: ${dependenciesError.message}`)
  }

  const [vulnerabilitiesError, deps] = await catchifyPromise(vulnerabilities(dependencies))
  if (vulnerabilitiesError) {
    throw new Error(`VulnerabilityError: ${vulnerabilitiesError.message}`)
  }
  const report = generateReport(policyData, pkg, deps)

  const [reportError] = await catchifyPromise(fetch(getRequest(report)))
  if (reportError) {
    throw new Error(`VulnerabilityError: ${vulnerabilitiesError.message}`)
  }
}
