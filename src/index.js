'use strict'

import fetch from 'isomorphic-fetch'
import bunyan from 'bunyan'

import getVulnerabilities from './utils/vulnerabilities'
import getDependencies from './utils/dependencies'
import getLicenses from './utils/licenses'
import {Report} from './report_model'
import fileManager from './utils/file-manager'
import {catchifyPromise} from './utils/utility-functions'

const logger = bunyan.createLogger({name: 'Index'})

const getRequest = body => {
  return new Request('http://35.234.151.254/report', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CENTRAL_SERVER_TOKEN}`
    },
    method: 'POST',
    body: JSON.stringify(body)
  })
}

function generateReport (policyData, pkg, dependencies, error) {
  const reportOptions = {
    id: policyData.project_id,
    name: policyData.project_name,
    version: pkg.version,
    description: pkg.description,
    timestamp: new Date(Date.now()).toISOString(),
    organization: policyData.organization,
    repo: policyData.repo,
    repo_owner: policyData.repo_owner,
    admin: policyData.admin,
    error_info: error
  }

  const report = new Report(reportOptions)
  report.insertDependencies(dependencies)

  fileManager.writeBuildFile('report.json', JSON.stringify(report))
  logger.info('Generated report')

  return report
}

/**
 * Analyzes license and vulnerabilities from all dependencies
 */
export default async function (policyData) {
  logger.info('Started process')

  const [dependenciesError, {pkg, dependencies}] = await catchifyPromise(getDependencies(policyData.invalid_licenses || []))
  if (dependenciesError) {
    logger.error('Exiting with error getting dependencies')
    throw new Error(`DependenciesError: ${dependenciesError.message}`)
  }

  const [licenseError, dependenciesWithLicenses] = await catchifyPromise(getLicenses(dependencies, policyData.invalid_licenses || []))
  if (licenseError) {
    logger.error('Exiting with error getting dependencies')
    throw new Error(`LicensesError: ${dependenciesError.message}`)
  }

  const [vulnerabilitiesError, deps] = await catchifyPromise(getVulnerabilities(dependenciesWithLicenses, policyData.api_cache_time || 0))

  const report = generateReport(policyData, pkg, deps, vulnerabilitiesError)

  const [reportError, response] = await catchifyPromise(fetch(getRequest(report)))
  if (reportError) {
    logger.error('Exiting with error sending the report')
    throw new Error(`ReportError: ${vulnerabilitiesError}`)
  }

  if (response.status === 200 || response.status === 201) {
    logger.info('Report API request ended successfully')
  } else {
    logger.error(`Report API request ended unsuccessfully. Status code: ${response.status}`)
  }

  if (policyData.fail === true && report.dependencies.some(elem => elem.vulnerabilities_count > 0)) {
    logger.error('Process ended unsuccessfully')
    throw new Error('Project has vulnerabilities and has fail property on policy as true')
  } else {
    logger.info('Process ended successfully')
  }
}
