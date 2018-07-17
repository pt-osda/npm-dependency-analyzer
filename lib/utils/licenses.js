'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getLicenses;

var _report_model = require('../report_model');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _licenseChecker = require('license-checker');

var _licenseChecker2 = _interopRequireDefault(_licenseChecker);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _bunyan2.default.createLogger({ name: 'Fetch-Licenses' });

/**
 * Create a report license object based in the information available
 * @param {String} license the license title
 * @param {Object} dependency the current dependency
 * @param {String} depAndVersion the dependency and version
 * @param {Array} invalidLicenses array with all the invalid licenses
 */
function createLicense(license, dependency, depAndVersion, invalidLicenses) {
  if (license.includes('Custom')) {
    return;
  }
  let depLicense;
  if (license.includes('*')) {
    depLicense = new _report_model.License(license.substring(1, license.length - 1), `Found in license file with version ${depAndVersion}`);
  } else {
    depLicense = new _report_model.License(license, `Found in package.json file with version ${depAndVersion}`);
  }
  if (invalidLicenses.some(invalid => invalid === depLicense.spdx_id)) {
    depLicense.valid = false;
  }
  dependency.insertLicense(depLicense);
}

/**
 * Inserts report license objects into the current dependency
 * @param {String} license the license title
 * @param {Object} dependency the current dependency
 * @param {String} depAndVersion the dependency and version
 * @param {Array} invalidLicenses array with all the invalid licenses
 */
function insertLicenseinDependency(dependency, depAndVersion, license, invalidLicenses) {
  if (_lodash2.default.isArray(license)) {
    license.forEach(elem => {
      createLicense(elem, dependency, depAndVersion, invalidLicenses);
    });
  } else {
    createLicense(license, dependency, depAndVersion, invalidLicenses);
  }
}

/**
 * Fetches licenses for all dependencies
 * @param {Array} dependencies array of dependencies
 * @param {Array} invalidLicenses array with invalid licenses
 */
function getLicenses(dependencies, invalidLicenses) {
  logger.info('Fetching licenses');
  return new Promise((resolve, reject) => {
    _licenseChecker2.default.init({ start: './' }, (err, allLicenses) => {
      if (err) {
        reject(err);
      } else {
        const licenseKeys = Object.keys(allLicenses);
        dependencies.forEach(element => {
          const licenses = licenseKeys.filter(licenseKey => licenseKey.split('@')[0] === element.title);
          licenses.forEach(e => {
            const license = allLicenses[e].licenses;
            if (license) {
              insertLicenseinDependency(element, e, license, invalidLicenses);
            }
          });
        });
        logger.info('Finished fetching licenses');
        resolve(dependencies);
      }
    });
  });
}