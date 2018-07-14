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

function getLicenses(dependencies, invalidLicenses) {
  logger.info('Fetching licenses');
  return new Promise((resolve, reject) => {
    _licenseChecker2.default.init({ start: './' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const keys = Object.keys(data);
        dependencies.forEach(element => {
          const dataNames = keys.filter(e => e.split('@')[0] === element.title);
          dataNames.forEach(e => {
            const license = data[e].licenses;
            if (license) {
              insertLicenseinDependency(element, license, invalidLicenses);
            }
          });
        });
        logger.info('Finished fetching licenses');
        resolve(dependencies);
      }
    });
  });
}

function insertLicenseinDependency(dependency, license, invalidLicenses) {
  if (_lodash2.default.isArray(license)) {
    license.forEach(elem => {
      const l = new _report_model.License(elem, `Found in package.json file with version ${dependency.main_version}`);
      if (invalidLicenses.some(invalid => invalid === elem)) {
        l.valid = false;
      }
      dependency.insertLicense(l);
    });
  } else {
    const l = new _report_model.License(license, `Found in package.json file with version ${dependency.main_version}`);
    if (invalidLicenses.some(invalid => invalid === license)) {
      l.valid = false;
    }
    dependency.insertLicense(l);
  }
}