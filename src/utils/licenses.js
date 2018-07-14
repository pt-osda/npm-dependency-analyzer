'use strict'

import {License} from '../report_model'
import lodash from 'lodash'
import licenseChecker from 'license-checker'
import bunyan from 'bunyan'

const logger = bunyan.createLogger({name: 'Fetch-Licenses'})

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
              insertLicenseinDependency(element, license, invalidLicenses)
            }
          })
        })
        logger.info('Finished fetching licenses')
        resolve(dependencies)
      }
    })
  })
}

function insertLicenseinDependency (dependency, license, invalidLicenses) {
  if (lodash.isArray(license)) {
    license.forEach(elem => {
      const l = new License(elem, `Found in package.json file with version ${dependency.main_version}`)
      if (invalidLicenses.some(invalid => invalid === elem)) {
        l.valid = false
      }
      dependency.insertLicense(l)
    })
  } else {
    const l = new License(license, `Found in package.json file with version ${dependency.main_version}`)
    if (invalidLicenses.some(invalid => invalid === license)) {
      l.valid = false
    }
    dependency.insertLicense(l)
  }
}
