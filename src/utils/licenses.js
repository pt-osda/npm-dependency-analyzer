'use strict'

import {License} from '../report_model'
import lodash from 'lodash'
import licenseChecker from 'license-checker'
import bunyan from 'bunyan'

const logger = bunyan.createLogger({name: 'Fetch-Licenses'})

/**
 * Create a report license object based in the information available
 * @param {String} license the license title
 * @param {Object} dependency the current dependency
 * @param {String} depAndVersion the dependency and version
 * @param {Array} invalidLicenses array with all the invalid licenses
 */
function createLicense (license, dependency, depAndVersion, invalidLicenses) {
  if (license.includes('Custom')) {
    return
  }
  let depLicense
  if (license.includes('*')) {
    depLicense = new License(license.substring(1, license.length - 1), `Found in license file with version ${depAndVersion}`)
  } else {
    depLicense = new License(license, `Found in package.json file with version ${depAndVersion}`)
  }
  if (invalidLicenses.some(invalid => invalid === depLicense.spdx_id)) {
    depLicense.valid = false
  }
  dependency.insertLicense(depLicense)
}

/**
 * Inserts report license objects into the current dependency
 * @param {String} license the license title
 * @param {Object} dependency the current dependency
 * @param {String} depAndVersion the dependency and version
 * @param {Array} invalidLicenses array with all the invalid licenses
 */
function insertLicenseinDependency (dependency, depAndVersion, license, invalidLicenses) {
  if (lodash.isArray(license)) {
    license.forEach(elem => {
      createLicense(elem, dependency, depAndVersion, invalidLicenses)
    })
  } else {
    createLicense(license, dependency, depAndVersion, invalidLicenses)
  }
}

/**
 * Fetches licenses for all dependencies
 * @param {Array} dependencies array of dependencies
 * @param {Array} invalidLicenses array with invalid licenses
 */
export default function getLicenses (dependencies, invalidLicenses) {
  logger.info('Fetching licenses')
  return new Promise((resolve, reject) => {
    licenseChecker.init({start: './'}, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const keys = Object.keys(data)
        dependencies.forEach(element => {
          const dataNames = keys.filter(e => e.split('@')[0] === element.title)
          dataNames.forEach(e => {
            const license = data[e].licenses
            if (license) {
              insertLicenseinDependency(element, e, license, invalidLicenses)
            }
          })
        })
        logger.info('Finished fetching licenses')
        resolve(dependencies)
      }
    })
  })
}
