'use strict'

import lodash from 'lodash'

function checkParams (ctorName, required = [], params = {}) {
  const missing = required.filter(param => !(param in params))

  if (missing.length) {
    throw new Error(`${ctorName}() Missing required parameter(s): ${missing.join(', ')}`)
  }
}

export class Report {
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
   * Constructor for a Dependency. Initializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {Object} options This object can have 0 to 2 properties, them being title and main_version
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
    if (!this.licenses.some(elem => elem.spdx_id === license.spdx_id)) {
      this.licenses.push(license)
    }
  }
}

export class Vulnerability {
  constructor (options) {
    if (options) {
      checkParams('Vulnerability', ['id', 'title', 'description', 'references', 'versions'], options)
      Object.assign(this, options)
    }
  }
}

export class License {
  constructor (title, origin) {
    this.spdx_id = title
    this.source = origin
    this.valid = true
  }
}
