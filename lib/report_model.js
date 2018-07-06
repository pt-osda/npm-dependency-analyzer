'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkParams(ctorName, required = [], params = {}) {
  const missing = required.filter(param => !(param in params));

  if (missing.length) {
    throw new Error(`${ctorName}() Missing required parameter(s): ${missing.join(', ')}`);
  }
}

module.exports.Report = class Report {
  constructor(options) {
    checkParams('Report', ['id', 'name', 'version', 'description', 'timestamp'], options);
    Object.assign(this, options);
    this.dependencies = [];
  }

  insertDependencies(dependencies) {
    this.dependencies = dependencies;
  }
};

/**
 * Class representing the element Dependency on the report generated
 */
module.exports.Dependency = class Dependency {
  /**
   * Constructor for a Dependency. Initializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {Object} options This object can have 0 to 2 properties, them being title and main_version
   */
  constructor(options) {
    if (options) {
      checkParams('Dependency', ['title', 'main_version', 'direct'], options);
      this.initializeDependency(options);
    }
    this.private_versions = [];
    this.licenses = [];
    this.children = [];
    this.vulnerabilities = [];
    this.vulnerabilities_count = 0;
  }

  initializeDependency(options) {
    this.title = options.title;
    this.main_version = options.main_version;
    if (options.description) {
      this.description = options.description;
    }
    this.direct = options.direct;
  }

  initializeWithError(options) {
    checkParams('Dependency', ['title', 'error_info'], options);
    Object.assign(this, options);
  }

  insertChild(dependencyName, dependencyVersion) {
    this.children.push(`${dependencyName}:${dependencyVersion}`);
  }

  insertPrivateVersion(dependencyVersion) {
    const index = _lodash2.default.indexOf(this.private_versions, dependencyVersion);

    if (this.main_version !== dependencyVersion) {
      if (index === -1) {
        this.private_versions.push(dependencyVersion);
      } else {
        _lodash2.default.pullAt(this.private_versions, index);
      }
    }
  }

  insertLicense(license) {
    if (!this.licenses.some(elem => elem.spdx_id === license.spdx_id)) {
      this.licenses.push(license);
    }
  }
};

module.exports.Vulnerability = class Vulnerability {
  constructor(options) {
    if (options) {
      checkParams('Vulnerability', ['id', 'title', 'description', 'references', 'versions'], options);
      Object.assign(this, options);
    }
  }
};

module.exports.License = class License {
  constructor(title, origin) {
    this.spdx_id = title;
    this.source = origin;
    this.valid = true;
  }
};