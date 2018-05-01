'use strict'

module.exports = {
  checkProject
}

const vulnerabilities = require('./utils/vulnerabilities')
const dependencies = require('./utils/dependencies')
const {Report} = require('./report_model')
const fileManager = require('./utils/file-manager')

const debug = require('debug')('Index')

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
 * @param {String} command npm CLI command to execute. values can be "--production" and --development or undefined
 */
function checkProject (command) {
  debug('Getting all dependencies')

  dependencies.getDependencies((err, {pkg, dependencies}) => {
    if (err) {
      debug('Exiting with error getting dependencies')
      throw new Error(err.message)
    }
    vulnerabilities(dependencies, (err, data) => {
      if (err) {
        throw new Error(err.message)
      }
      generateReport(pkg, data)
    })
  })
}
