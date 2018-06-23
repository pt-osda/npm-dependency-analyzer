'use strict'

import licenseUtility from './fetch-license-utility'
import fileManager from './file-manager'
import {License} from '../report_model'

import correct from 'spdx-correct'
import fetch from 'isomorphic-fetch'
import lodash from 'lodash'
import debugSetup from 'debug'

const debug = debugSetup('Licenses')

function filterLicenseInFile (fileData) {
  for (let l in licenseUtility.knownLicenses) {
    if (fileData.includes(l)) {
      return licenseUtility.knownLicenses[l]
    }
  }

  return null
}

async function getGitHubLicense (pkg, cb) {
  const repository = pkg.repository
  if (repository !== undefined && repository.type === 'git') {
    const packageRepo = repository.url.match(licenseUtility.gitHubRegex)
    if (packageRepo === null) {
      return null
    }

    const splitRepo = packageRepo[1].split('/')
    const owner = splitRepo[1]
    const repo = splitRepo[2].replace('.git', '')
    fetch(licenseUtility.gitHubLicenseApiUrl(owner, repo))
      .then(response => {
        if (response.headers.get('X-RateLimit-Remaining') === '0') {
          debug('No more requests available')
          return null
        }

        if (response.status !== 200) {
          debug(`No repo: owner- ${owner} | repo- ${repo}) \n\turl- ${repository.url}`)
          return null
        }

        response.json()
          .then(body => {
            if (body.license) {
              return new License(body.license.spdx_id, licenseUtility.possibleOrigins['githubLicense'])
            }
          })
          .catch(err => {
            debug('Error with response.json() license: ' + err)
          })
      })
      .catch(err => {
        debug('Error with fetch: ' + err)
      })
  }
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

export default function getLicense (dependency, depPkg) { // TODO: Use package license-checker to get license for each dependency
  return getLocalLicense(depPkg)
    .then(license => {
      if (license) {
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
