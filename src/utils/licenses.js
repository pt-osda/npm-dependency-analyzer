'use strict'

const fileManager = require('./file-manager')

const {License} = require('../report_model')

const debug = require('debug')('Licenses')
const parse = require('spdx-expression-parse')
const correct = require('spdx-correct')
const fetch = require('isomorphic-fetch')

const licenseFileRegex = /SEE LICENSE IN (.*?)$/i
const gitHubRegex = /github.com(.*?)$/i

const gitHubLicenseApiUrl = (owner, repo) => `https://api.github.com/repos/${owner}/${repo}/license`

const possibleOrigins = {
  packagePropertyLicense: 'Found in license property of package.json',
  fileLicense: 'Found in license file',
  githubLicense: 'Found using the Github API for the repository'
}

const licenses = {
  'http://www.apache.org/licenses/LICENSE-1.1': 'Apache Software License, Version 1.1',
  'http://www.apache.org/licenses/LICENSE-2.0': 'Apache Software License, Version 2.0',
  'https://opensource.org/licenses/BSD-2-Clause': 'The 2-Clause BSD License',
  'https://opensource.org/licenses/BSD-3-Clause': 'The 3-Clause BSD License',
  'http://repository.jboss.org/licenses/cc0-1.0.txt': 'Creative Commons Legal Code',
  'https://www.eclipse.org/legal/cpl-v10.html': 'Common Public License - v 1.0',
  'https://www.eclipse.org/legal/epl-v10.html': 'Eclipse Public License - v 1.0',
  'https://www.eclipse.org/org/documents/epl-2.0/EPL-2.0.txt': 'Eclipse Public License - v 2.0',
  'https://www.gnu.org/licenses/gpl-1.0': 'GNU GENERAL PUBLIC LICENSE, Version 1',
  'https://www.gnu.org/licenses/gpl-2.0': 'GNU GENERAL PUBLIC LICENSE, Version 2',
  'https://www.gnu.org/licenses/gpl-3.0': 'GNU GENERAL PUBLIC LICENSE, Version 3',
  'https://www.gnu.org/licenses/lgpl-2.1': 'GNU LESSER GENERAL PUBLIC LICENSE, Version 2.1',
  'https://www.gnu.org/licenses/lgpl-3.0': 'GNU LESSER GENERAL PUBLIC LICENSE, Version 3',
  'https://opensource.org/licenses/MIT': 'MIT License',
  'https://www.mozilla.org/en-US/MPL/1.1': 'Mozilla Public License Version 1.1',
  'https://www.mozilla.org/en-US/MPL/2.0': 'Mozilla Public License, Version 2.0'
}

function filterLicenseInFile (fileData) {
  for (let l in licenses) {
    if (fileData.includes(l)) {
      return licenses[l]
    }
  }

  return null
}

async function getGitHubLicense (pkg, cb) {
  const repository = pkg.repository
  if (repository !== undefined && repository.type === 'git') {
    const packageRepo = repository.url.match(gitHubRegex)
    if (packageRepo === null) {
      return null
    }
    const splitRepo = packageRepo[1].split('/')
    const owner = splitRepo[1]
    const repo = splitRepo[2].replace('.git', '')
    fetch(gitHubLicenseApiUrl(owner, repo))
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
              return new License(body.license.spdx_id, possibleOrigins['githubLicense'])
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
    return new License(licenseName, possibleOrigins['packagePropertyLicense'])
  }

  try {
    const correctedVersion = correct(licenseName)
    const parsedLicense = parse(correctedVersion).license
    return new License(parsedLicense, possibleOrigins['packagePropertyLicense'])
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
  if (Array.isArray(licenseObj)) {
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

      const licenseFile = pkg.license.match(licenseFileRegex)
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
    } else {
      const value = await getGitHubLicense(pkg)
      return resolve(value)
    }
  })
}

function getLicense (dependency, depPkg) {
  const prm = getLocalLicense(depPkg)
  prm
    .then(license => {
      if (license) {
        if (license.constructor === 'Array') {
          dependency.license.push(...license)
        } else {
          dependency.license.push(license)
        }
      }
    })
    .catch(err => {
      throw new Error(err.message)
    })

  return prm
}

module.exports = getLicense
