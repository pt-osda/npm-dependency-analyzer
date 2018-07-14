'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _lodash = require('lodash');

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _utilityFunctions = require('./utility-functions');

var _report_model = require('../report_model');

var _ossFetchBody = require('../oss-fetch-body');

var _ossFetchBody2 = _interopRequireDefault(_ossFetchBody);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = _bunyan2.default.createLogger({ name: 'Fetch-Vulnerabilities' });

const getRequest = (body, cacheTime) => {
  return new Request('http://35.234.151.254/npm/dependency/vulnerabilities', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `max-age=${cacheTime || 0}`,
      'Authorization': `Bearer ${process.env.CENTRAL_SERVER_TOKEN}`
    },
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * Gets all vulnerabilities on the current project
 * Need to do POST and send all packages because sending a request for each dependency breaks the server for a bit
 */

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (dependencies, cacheTime) {
    logger.info('Fetching vulnerabilities');

    const notFlatRequestBody = dependencies.map(function (dependency) {
      const versions = [dependency.main_version, ...dependency.private_versions];

      return versions.map(function (version) {
        return new _ossFetchBody2.default('npm', dependency.title, version);
      });
    });

    const requestBody = (0, _lodash.flattenDeep)(notFlatRequestBody);

    const [fetchError, response] = yield (0, _utilityFunctions.catchifyPromise)((0, _isomorphicFetch2.default)(getRequest(requestBody, cacheTime)));
    if (fetchError) {
      logger.warn(`Vulnerabilities Request failed: %O`, fetchError.message);
      throw new Error(fetchError);
    }

    const [jsonError, body] = yield (0, _utilityFunctions.catchifyPromise)(response.json());

    if (response.status !== 200) {
      logger.warn(`Vulnerabilities Request failed: Status - %s; Reason - %O`, response.status, body);
      throw new Error(body);
    }

    if (jsonError) {
      logger.warn(`Vulnerabilities Request failed: Status - %s; Reason - %O`, response.status, jsonError);
      throw new Error(jsonError.message);
    }

    dependencies.forEach(function (dependency) {
      const dependencyVulnerabilities = body.filter(function (elem) {
        return elem.title === dependency.title;
      });

      dependencyVulnerabilities.forEach(function (elem) {
        if (!elem.vulnerabilities) {
          return;
        }

        elem.vulnerabilities.forEach(function (vulnerability) {
          if (!dependency.vulnerabilities.some(function (depElem) {
            return depElem.id === vulnerability.id;
          })) {
            dependency.vulnerabilities.push(new _report_model.Vulnerability(vulnerability));
            dependency.vulnerabilities_count += 1;
          }
        });
      });
    });

    logger.info('Finished fetching vulnerabilities');
    return dependencies;
  });

  function getVulnerabilities(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return getVulnerabilities;
})();