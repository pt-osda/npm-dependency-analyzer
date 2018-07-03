'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let getLocalLicense = (() => {
  var _ref = _asyncToGenerator(function* (pkg) {
    return new Promise((() => {
      var _ref2 = _asyncToGenerator(function* (resolve, reject) {
        if (pkg.licenses) {
          const license = getPackageLicense(pkg.licenses);
          if (license !== null) {
            return resolve(license);
          }
        }

        if (pkg.license !== undefined) {
          const license = getPackageLicense(pkg.license);
          if (license !== null) {
            return resolve(license);
          }

          const licenseFile = pkg.license.match(_fetchLicenseUtility2.default.licenseFileRegex);
          if (licenseFile != null) {
            _fileManager2.default.readFile('./node_modules/' + pkg._location + '/' + licenseFile, function (err, data) {
              if (err) {
                debug(`Error reading file with ${pkg.name} module`);
                return reject(new Error('Error reading license file'));
              }
              const fileLicense = filterLicenseInFile(data);
              if (fileLicense !== null) {
                return resolve(fileLicense);
              }
            });

            return resolve(null);
          }

          return resolve(parseLicense(pkg.license));
        }
        return resolve();
      });

      return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
      };
    })());
  });

  return function getLocalLicense(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = getLicense;

var _fetchLicenseUtility = require('./fetch-license-utility');

var _fetchLicenseUtility2 = _interopRequireDefault(_fetchLicenseUtility);

var _fileManager = require('./file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _report_model = require('../report_model');

var _spdxCorrect = require('spdx-correct');

var _spdxCorrect2 = _interopRequireDefault(_spdxCorrect);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _nlf = require('nlf');

var _nlf2 = _interopRequireDefault(_nlf);

var _licenseChecker = require('license-checker');

var _licenseChecker2 = _interopRequireDefault(_licenseChecker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('Licenses');

function filterLicenseInFile(fileData) {
  for (let l in _fetchLicenseUtility2.default.knownLicenses) {
    if (fileData.includes(l)) {
      return _fetchLicenseUtility2.default.knownLicenses[l];
    }
  }

  return null;
}

function parseLicense(licenseName, pkg) {
  if (licenseName === 'Public Domain') {
    return new _report_model.License(licenseName, _fetchLicenseUtility2.default.possibleOrigins['packagePropertyLicense']);
  }

  try {
    const correctedVersion = (0, _spdxCorrect2.default)(licenseName);
    return new _report_model.License(correctedVersion, _fetchLicenseUtility2.default.possibleOrigins['packagePropertyLicense']);
  } catch (err) {
    throw new Error('Invalid license name: ' + licenseName);
  }
}

function getPackageParsedLicense(license, pkg) {
  if (license.type) {
    return parseLicense(license.type, pkg);
  } else {
    return parseLicense(license, pkg);
  }
}

function getPackageLicense(licenseObj) {
  if (_lodash2.default.isArray(licenseObj)) {
    return licenseObj.map(value => {
      return getPackageParsedLicense(value);
    });
  } else {
    return getPackageParsedLicense(licenseObj);
  }
}

function getLicense(dependency, depPkg, invalidLicenses) {
  // TODO: Use package license-checker to get license for each dependency
  return getLocalLicense(depPkg).then(license => {
    if (license) {
      if (invalidLicenses.some(elem => elem === license.spdx_id)) {
        license.valid = false;
      }
      if (_lodash2.default.isArray(license)) {
        dependency.licenses.push(...license);
      } else {
        dependency.licenses.push(license);
      }
    }
  }).catch(err => {
    throw new Error(err.message);
  });
}