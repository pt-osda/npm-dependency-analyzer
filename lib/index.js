'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vulnerabilities = require('./utils/vulnerabilities');

var _vulnerabilities2 = _interopRequireDefault(_vulnerabilities);

var _dependencies = require('./utils/dependencies');

var _dependencies2 = _interopRequireDefault(_dependencies);

var _report_model = require('./report_model');

var _fileManager = require('./utils/file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _utilityFunctions = require('./utils/utility-functions');

var _utilityFunctions2 = _interopRequireDefault(_utilityFunctions);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = _bunyan2.default.createLogger({ name: 'Index' });

const getRequest = body => {
  return new Request('http://35.234.147.77/report', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  });
};

function generateReport(policyData, pkg, dependencies) {
  const reportOptions = {
    id: policyData.project_id,
    name: policyData.project_name,
    version: pkg.version,
    description: pkg.description,
    timestamp: new Date(Date.now()).toISOString(),
    organization: policyData.organization,
    repo: policyData.repo,
    repo_owner: policyData.repo_owner
  };

  const report = new _report_model.Report(reportOptions);
  report.insertDependencies(dependencies);

  _fileManager2.default.writeBuildFile('report.json', JSON.stringify(report));
  logger.info('Generated report');

  return report;
}

/**
 * Analyzes license and vulnerabilities from all dependencies
 */

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (policyData) {
    logger.info('Started process');

    const [dependenciesError, { pkg, dependencies }] = yield (0, _utilityFunctions2.default)((0, _dependencies2.default)(policyData.invalid_licenses));
    if (dependenciesError) {
      logger.error('Exiting with error getting dependencies');
      throw new Error(`DependenciesError: ${dependenciesError.message}`);
    }

    const [vulnerabilitiesError, deps] = yield (0, _utilityFunctions2.default)((0, _vulnerabilities2.default)(dependencies, policyData.api_cache_time));
    if (vulnerabilitiesError) {
      logger.error('Exiting with error getting vulnerabilities');
      throw new Error(`VulnerabilityError: ${vulnerabilitiesError.message}`);
    }
    const report = generateReport(policyData, pkg, deps);

    const [reportError, response] = yield (0, _utilityFunctions2.default)((0, _isomorphicFetch2.default)(getRequest(report)));
    if (reportError) {
      logger.error('Exiting with error sending the report');
      throw new Error(`VulnerabilityError: ${vulnerabilitiesError}`);
    }

    if (response.status === 200 || response.status === 201) {
      logger.info('Report API request ended successfully');
      logger.info('Ended process successfully');
    } else {
      logger.warn(`Report API request ended unsuccessfully. Status code: ${response.status}`);
      logger.info('Ended process unsuccessfully');
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();