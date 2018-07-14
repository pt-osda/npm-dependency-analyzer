'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.License = exports.Vulnerability = exports.Dependency = exports.Report = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utilityFunctions = require('./utils/utility-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Report {
  constructor(options) {
    (0, _utilityFunctions.checkParams)('Report', ['id', 'name', 'version', 'description', 'timestamp', 'admin'], options);
    Object.assign(this, options);
    this.dependencies = [];
  }

  insertDependencies(dependencies) {
    this.dependencies = dependencies;
  }

  initializeWithError(errorInfo) {
    this.error_info = errorInfo;
  }
}

exports.Report = Report; /**
                          * Class representing the element Dependency on the report generated
                          */

class Dependency {
  /**
   * Constructor for a Dependency. Initializes all properties that cannot be null (are arrays) and verifies required properties
   * @param {Object} options This object can have 0 to 2 properties, them being title and main_version
   */
  constructor(options) {
    if (options) {
      (0, _utilityFunctions.checkParams)('Dependency', ['title', 'main_version', 'direct'], options);
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

  insertChild(dependencyName, dependencyVersion) {
    this.children.push(`${dependencyName}:${dependencyVersion}`);
  }

  insertPrivateVersion(dependencyVersion) {
    const index = _lodash2.default.indexOf(this.private_versions, dependencyVersion);

    if (index === -1) {
      this.private_versions.push(dependencyVersion);
    } else {
      _lodash2.default.pullAt(this.private_versions, index);
    }
  }

  insertLicense(license) {
    if (!this.licenses.some(elem => elem.spdx_id === license.spdx_id)) {
      this.licenses.push(license);
    }
  }
}

exports.Dependency = Dependency;
class Vulnerability {
  constructor(options) {
    if (options) {
      (0, _utilityFunctions.checkParams)('Vulnerability', ['id', 'title', 'description', 'references', 'versions'], options);
      Object.assign(this, options);
    }
  }
}

exports.Vulnerability = Vulnerability;
class License {
  constructor(title, origin) {
    this.spdx_id = title;
    this.source = origin;
    this.valid = true;
  }
}
exports.License = License;