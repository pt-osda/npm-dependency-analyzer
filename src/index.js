'use strict'

import vulnerabilities from './utils/vulnerabilities'
import getDependencies from './utils/dependencies'
import {Report} from './report_model'
import fileManager from './utils/file-manager'
import catchifyPromise from './utils/utility-functions'
import debugSetup from 'debug'

const debug = debugSetup('Index')

function generateReport (pkg, dependencies) {
  const report = new Report('tag', pkg.version, pkg.name, pkg.description)
  let i = 0
  for (let prop in dependencies) {
    i += dependencies[prop].vulnerabilities.length
  }
  debug('Vulnerabilities: %d', i)
  report.dependencies = dependencies

  fileManager.writeBuildFile('report.json', JSON.stringify(report))
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
    generateReport(pkg, deps)
  })
}
