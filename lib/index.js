'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _vulnerabilities = require('./utils/vulnerabilities');

var _vulnerabilities2 = _interopRequireDefault(_vulnerabilities);

var _dependencies = require('./utils/dependencies');

var _dependencies2 = _interopRequireDefault(_dependencies);

var _licenses = require('./utils/licenses');

var _licenses2 = _interopRequireDefault(_licenses);

var _report_model = require('./report_model');

var _fileManager = require('./utils/file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _utilityFunctions = require('./utils/utility-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = _bunyan2.default.createLogger({ name: 'Index' });

/**
 * Creates a request for the report
 * @param {Object} body body of the request
 */
const getRequest = body => {
  return new Request('http://35.234.151.254/report', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CENTRAL_SERVER_TOKEN}`
    },
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * Generates the Report Object
 * @param {Object} policyData information in the policy file
 * @param {Object} pkg the package related information of the project
 * @param {Array} dependencies the project dependencies
 * @param {Object} error object holding error about the vulnerabilities fetch
 */
function generateReport(policyData, pkg, dependencies, error) {
  const reportOptions = {
    id: policyData.project_id,
    name: policyData.project_name,
    version: pkg.version,
    description: pkg.description,
    timestamp: new Date(Date.now()).toISOString(),
    organization: policyData.organization,
    repo: policyData.repo,
    repo_owner: policyData.repo_owner,
    admin: policyData.admin,
    error_info: error
  };

  const report = new _report_model.Report(reportOptions);
  report.insertDependencies(dependencies);

  (0, _fileManager2.default)('report.json', JSON.stringify(report));
  logger.info('Generated report');

  return report;
}

/**
 * Main function for the plugin. Handles the calls to every needed part.
 * @param {Object} policyData information in the policy file
 */

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (policyData) {
    logger.info('Started process');

    const [dependenciesError, { pkg, dependencies }] = yield (0, _utilityFunctions.catchifyPromise)((0, _dependencies2.default)(policyData.invalid_licenses || []));
    if (dependenciesError) {
      logger.error('Exiting with error getting dependencies');
      throw new Error(`DependenciesError: ${dependenciesError.message}`);
    }

    const [licenseError, dependenciesWithLicenses] = yield (0, _utilityFunctions.catchifyPromise)((0, _licenses2.default)(dependencies, policyData.invalid_licenses || []));
    if (licenseError) {
      logger.error('Exiting with error getting dependencies');
      throw new Error(`LicensesError: ${dependenciesError.message}`);
    }

    const [vulnerabilitiesError, deps] = yield (0, _utilityFunctions.catchifyPromise)((0, _vulnerabilities2.default)(dependenciesWithLicenses, policyData.api_cache_time || 0));

    const report = generateReport(policyData, pkg, deps, vulnerabilitiesError);

    const [reportError, response] = yield (0, _utilityFunctions.catchifyPromise)((0, _isomorphicFetch2.default)(getRequest(report)));
    if (reportError) {
      logger.error('Exiting with error sending the report');
      throw new Error(`ReportError: ${vulnerabilitiesError}`);
    }

    if (response.status === 200 || response.status === 201) {
      logger.info('Report API request ended successfully');
    } else {
      logger.error(`Report API request ended unsuccessfully. Status code: ${response.status}`);
    }

    if (policyData.fail === true && report.dependencies.some(function (elem) {
      return elem.vulnerabilities_count > 0;
    })) {
      logger.error('Process ended unsuccessfully');
      throw new Error('Project has vulnerabilities and has fail property on policy as true');
    } else {
      logger.info('Process ended successfully');
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();