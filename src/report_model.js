'use strict'

import lodash from 'lodash'

function checkParams (ctorName, required = [], params = {}) {
  const missing = required.filter(param => !(param in params))

  if (missing.length) {
    throw new Error(`${ctorName}() Missing required parameter(s):
    ${missing.join(', ')}`)
  }
}

module.exports.Report = class Report {
  constructor (version, name, description, timestamp) {
    this.version = version
    this.name = name
    this.description = description
    this.timestamp = timestamp
    this.dependencies = []
  }
}

/**
 * Class representing the element Dependency on the report generated
 */
module.exports.Dependency = class Dependency {
  /**
   * Constructor for a Dependency. Initializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {Object} options This object can have 0 to 2 properties, them being title and main_version
   */
  constructor (options) {
    if (options) {
      checkParams('Dependency', ['title', 'main_version'], options)
      this.initializeDependency(options)
    }
    this.private_versions = []
    this.licenses = []
    this.parents = []
    this.vulnerabilities = []
  }

  initializeDependency (options) {
    this.title = options.title
    this.main_version = options.main_version
    if (options.description) {
      this.description = options.description
    }
  }

  insertParents (options) {
    this.parents.push(options.parents)

    const version = options.private_versions
    const index = lodash.indexOf(this.private_versions, options.private_versions)

    if (this.main_version !== version) {
      if (index === -1) {
        this.private_versions.push(options.private_versions)
      } else {
        lodash.pullAt(this.private_versions, index)
      }
    }
  }
}

module.exports.Vulnerability = class Vulnerability {
  constructor (options) {
    if (options) {
      checkParams('Vulnerability', ['id', 'title', 'description', 'references', 'versions'], options)
      Object.assign(this, options)
    }
  }
}

module.exports.License = class License {
  constructor (title, origin) {
    this.spdx_id = title
    this.source = origin
  }
}
