'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utilityFunctions = require('./utility-functions');

var _utilityFunctions2 = _interopRequireDefault(_utilityFunctions);

var _fileManager = require('./file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _report_model = require('../report_model');

var _ossFetchBody = require('../oss-fetch-body');

var _ossFetchBody2 = _interopRequireDefault(_ossFetchBody);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('Vulnerabilities');

const getRequest = body => {
  return new Request('http://localhost:8080/npm/dependency/vulnerabilities', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  });
};

// TODO: Need to check for error from the API. In case of error affect the Dependency property for error_info and not put vulnerabilitiesCount
/**
 * Gets all vulnerabilities on the current project
 * Need to do POST and send all packages because sending a request for each dependency breaks the server for a bit
 */

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (dependencies) {
    debug('Checking Vulnerabilities');

    const requestBody = dependencies.map(function (dependency) {
      const versions = [dependency.main_version, ...dependency.private_versions];
      const minVersion = versions.sort(_semver2.default.compare)[0];

      return new _ossFetchBody2.default('npm', dependency.title, minVersion);
    });

    const [fetchError, response] = yield (0, _utilityFunctions2.default)((0, _isomorphicFetch2.default)(getRequest(requestBody)));
    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (response.status !== 200) {
      throw new Error('Vulnerabilities Request failed: Status-' + response.status);
    }

    const [jsonError, body] = yield (0, _utilityFunctions2.default)(response.json());
    if (jsonError) {
      throw new Error(jsonError.message);
    }

    for (let prop in body) {
      const vulnerability = body[prop];
      if (!vulnerability.vulnerabilities) {
        continue;
      }

      const vulnerabilities = vulnerability.vulnerabilities.map(function (elem) {
        return new _report_model.Vulnerability({
          id: elem.id,
          title: elem.title,
          description: elem.description,
          references: elem.references,
          versions: elem.versions
        });
      });

      const dependency = dependencies.find(function (elem) {
        return elem.title === vulnerability.title;
      });
      dependency.vulnerabilities = vulnerabilities;
      dependency.vulnerabilities_count = vulnerability.totalVulnerabilities;
    }

    _fileManager2.default.writeBuildFile('dependencies-vulnerabilities.json', JSON.stringify(dependencies));
    debug('End process');
    return dependencies;
  });

  function getVulnerabilities(_x) {
    return _ref.apply(this, arguments);
  }

  return getVulnerabilities;
})();