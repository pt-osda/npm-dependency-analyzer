'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  debug('Getting all dependencies');

  (0, _dependencies2.default)((() => {
    var _ref = _asyncToGenerator(function* (dependenciesError, { pkg, dependencies }) {
      if (dependenciesError) {
        debug('Exiting with error getting dependencies');
        throw new Error(`DependenciesError: ${dependenciesError.message}`);
      }

      const [vulnerabilitiesError, deps] = yield (0, _utilityFunctions2.default)((0, _vulnerabilities2.default)(dependencies));
      if (vulnerabilitiesError) {
        throw new Error(`VulnerabilityError: ${vulnerabilitiesError.message}`);
      }
      generateReport(pkg, deps);
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })());
};

var _vulnerabilities = require('./utils/vulnerabilities');

var _vulnerabilities2 = _interopRequireDefault(_vulnerabilities);

var _dependencies = require('./utils/dependencies');

var _dependencies2 = _interopRequireDefault(_dependencies);

var _report_model = require('./report_model');

var _fileManager = require('./utils/file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _utilityFunctions = require('./utils/utility-functions');

var _utilityFunctions2 = _interopRequireDefault(_utilityFunctions);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('Index');

function generateReport(pkg, dependencies) {
  const report = new _report_model.Report('tag', pkg.version, pkg.name, pkg.description);
  let i = 0;
  for (let prop in dependencies) {
    i += dependencies[prop].vulnerabilities.length;
  }
  debug('Vulnerabilities: %d', i);
  report.dependencies = dependencies;

  _fileManager2.default.writeBuildFile('report.json', JSON.stringify(report));
}

/**
 * Analyzes license and vulnerabilities from all dependencies
 */