'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let getGitHubLicense = (() => {
  var _ref = _asyncToGenerator(function* (pkg, cb) {
    const repository = pkg.repository;
    if (repository !== undefined && repository.type === 'git') {
      const packageRepo = repository.url.match(_fetchLicenseUtility2.default.gitHubRegex);
      if (packageRepo === null) {
        return null;
      }

      const splitRepo = packageRepo[1].split('/');
      const owner = splitRepo[1];
      const repo = splitRepo[2].replace('.git', '');
      (0, _isomorphicFetch2.default)(_fetchLicenseUtility2.default.gitHubLicenseApiUrl(owner, repo)).then(function (response) {
        if (response.headers.get('X-RateLimit-Remaining') === '0') {
          debug('No more requests available');
          return null;
        }

        if (response.status !== 200) {
          debug(`No repo: owner- ${owner} | repo- ${repo}) \n\turl- ${repository.url}`);
          return null;
        }

        response.json().then(function (body) {
          if (body.license) {
            return new _report_model.License(body.license.spdx_id, _fetchLicenseUtility2.default.possibleOrigins['githubLicense']);
          }
        }).catch(function (err) {
          debug('Error with response.json() license: ' + err);
        });
      }).catch(function (err) {
        debug('Error with fetch: ' + err);
      });
    }
  });

  return function getGitHubLicense(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getLocalLicense = (() => {
  var _ref2 = _asyncToGenerator(function* (pkg) {
    return new Promise((() => {
      var _ref3 = _asyncToGenerator(function* (resolve, reject) {
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

      return function (_x4, _x5) {
        return _ref3.apply(this, arguments);
      };
    })());
  });

  return function getLocalLicense(_x3) {
    return _ref2.apply(this, arguments);
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

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

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

function getLicense(dependency, depPkg) {
  // TODO: Use package license-checker to get license for each dependency
  return getLocalLicense(depPkg).then(license => {
    if (license) {
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