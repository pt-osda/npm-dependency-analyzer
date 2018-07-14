'use strict'

import lodash from 'lodash'

import {checkParams} from './utils/utility-functions'

export class Report {
  /**
   * nitializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {*} options object that holds all necessary infomation for a report
   */
  constructor (options) {
    checkParams('Report', ['id', 'name', 'version', 'description', 'timestamp', 'admin'], options)
    Object.assign(this, options)
    this.dependencies = []
  }

  insertDependencies (dependencies) {
    this.dependencies = dependencies
  }

  initializeWithError (errorInfo) {
    this.error_info = errorInfo
  }
}

/**
 * Class representing the element Dependency on the report generated
 */
export class Dependency {
  /**
   * Initializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {Object} options object that holds all necessary infomation for a dependency
   */
  constructor (options) {
    if (options) {
      checkParams('Dependency', ['title', 'main_version', 'direct'], options)
      this.initializeDependency(options)
    }
    this.private_versions = []
    this.licenses = []
    this.children = []
    this.vulnerabilities = []
    this.vulnerabilities_count = 0
  }

  initializeDependency (options) {
    this.title = options.title
    this.main_version = options.main_version
    if (options.description) {
      this.description = options.description
    }
    this.direct = options.direct
  }

  insertChild (dependencyName, dependencyVersion) {
    this.children.push(`${dependencyName}:${dependencyVersion}`)
  }

  insertPrivateVersion (dependencyVersion) {
    const index = lodash.indexOf(this.private_versions, dependencyVersion)

    if (index === -1) {
      this.private_versions.push(dependencyVersion)
    } else {
      lodash.pullAt(this.private_versions, index)
    }
  }

  insertLicense (license) {
    this.licenses.push(license)
  }
}

export class Vulnerability {
  /**
   * Initializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {Object} options object that holds all necessary infomation for a vulnerability
   */
  constructor (options) {
    if (options) {
      checkParams('Vulnerability', ['id', 'title', 'description', 'references', 'versions'], options)
      Object.assign(this, options)
    }
  }
}

export class License {
  /**
   * Initializes all properties of a license
   * @param {Object} title the title of the license
   * @param {Object} origin the origin of the license
   */
  constructor (title, origin) {
    this.spdx_id = title
    this.source = origin
    this.valid = true
  }
}
