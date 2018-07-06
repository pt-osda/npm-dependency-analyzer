'use strict'

import licenseUtility from './fetch-license-utility'
import fileManager from './file-manager'
import {License} from '../report_model'

import correct from 'spdx-correct'
import lodash from 'lodash'
import debugSetup from 'debug'
import nlf from 'nlf'
import licenseChecker from 'license-checker'

const debug = debugSetup('Licenses')

function filterLicenseInFile (fileData) {
  for (let l in licenseUtility.knownLicenses) {
    if (fileData.includes(l)) {
      return licenseUtility.knownLicenses[l]
    }
  }

  return null
}

function parseLicense (licenseName, pkg) {
  if (licenseName === 'Public Domain') {
    return new License(licenseName, licenseUtility.possibleOrigins['packagePropertyLicense'])
  }

  try {
    const correctedVersion = correct(licenseName)
    return new License(correctedVersion, licenseUtility.possibleOrigins['packagePropertyLicense'])
  } catch (err) {
    throw new Error('Invalid license name: ' + licenseName)
  }
}

function getPackageParsedLicense (license, pkg) {
  if (license.type) {
    return parseLicense(license.type, pkg)
  } else {
    return parseLicense(license, pkg)
  }
}

function getPackageLicense (licenseObj) {
  if (lodash.isArray(licenseObj)) {
    return licenseObj.map(value => {
      return getPackageParsedLicense(value)
    })
  } else {
    return getPackageParsedLicense(licenseObj)
  }
}

async function getLocalLicense (pkg) {
  return new Promise(async (resolve, reject) => {
    if (pkg.licenses) {
      const license = getPackageLicense(pkg.licenses)
      if (license !== null) {
        return resolve(license)
      }
    }

    if (pkg.license !== undefined) {
      const license = getPackageLicense(pkg.license)
      if (license !== null) {
        return resolve(license)
      }

      const licenseFile = pkg.license.match(licenseUtility.licenseFileRegex)
      if (licenseFile != null) {
        fileManager.readFile('./node_modules/' + pkg._location + '/' + licenseFile, (err, data) => {
          if (err) {
            debug(`Error reading file with ${pkg.name} module`)
            return reject(new Error('Error reading license file'))
          }
          const fileLicense = filterLicenseInFile(data)
          if (fileLicense !== null) {
            return resolve(fileLicense)
          }
        })

        return resolve(null)
      }

      return resolve(parseLicense(pkg.license))
    }
    return resolve()
  })
}

export default function getLicense (dependency, depPkg, invalidLicenses) { // TODO: Use package license-checker to get license for each dependency
  return getLocalLicense(depPkg)
    .then(license => {
      if (license) {
        if (invalidLicenses.some(elem => elem === license.spdx_id)) {
          license.valid = false
        }
        if (lodash.isArray(license)) {
          dependency.licenses.push(...license)
        } else {
          dependency.licenses.push(license)
        }
      }
    })
    .catch(err => {
      throw new Error(err.message)
    })
}

/*
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

export default function getLicense (dependency, rptDependency, invalidLicenses) { // TODO: Use package license-checker to get license for each dependency
  return new Promise((resolve, reject) => {
    const pkg = rptDependency.package
    licenseChecker.init({start: rptDependency.path}, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const license = data[`${pkg.name}@${pkg.version}`].licenses
        if (!license) {
          return resolve()
        }
        insertLicenseinDependency(dependency, license, invalidLicenses)
        resolve()
      }
    })
  })
}
*/
