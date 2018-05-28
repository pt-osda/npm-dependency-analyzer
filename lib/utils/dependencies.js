'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getDependencies;

var _report_model = require('../report_model');

var _licenses = require('./licenses');

var _licenses2 = _interopRequireDefault(_licenses);

var _fileManager = require('./file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _readPackageTree = require('read-package-tree');

var _readPackageTree2 = _interopRequireDefault(_readPackageTree);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import lodash from 'lodash'

const debug = (0, _debug2.default)('Dependencies');

/**
 * Gets all dependencies and builds an object after filtering into a ReportDependency
 * @param {Function} cb callback called when an error occurs or after filtering all dependencies
 */
function getDependencies(cb) {
  debug('Get dependencies');
  const dependencies = {};
  const licensePromises = [];

  (0, _readPackageTree2.default)('./', (err, data) => {
    if (err) {
      debug('Error getting dependencies');
      return cb(err);
    }
    const modules = data.children;
    for (let module in modules) {
      const pkg = modules[module].package;
      const version = _semver2.default.coerce(pkg.version).raw;

      let dependency;
      if (dependencies[pkg.name]) {
        dependency = dependencies[pkg.name];
        dependency.initializeDependency({ title: pkg.name, main_version: version, description: pkg.description });
      } else {
        dependency = new _report_model.Dependency({ title: pkg.name, main_version: version, description: pkg.description });
        dependencies[pkg.name] = dependency;
      }

      licensePromises.push((0, _licenses2.default)(dependency, pkg));

      insertHierarchies(dependencies, { children: modules[module].children, pkg });
    }

    debug('Finished filtering dependencies');
    _fileManager2.default.writeBuildFile('only-dependencies.json', JSON.stringify(dependencies));

    Promise.all(licensePromises).then(() => {
      const nonOptionalDependencies = Object.values(dependencies).filter(val => {
        return val.title !== undefined;
      });
      cb(null, { pkg: data.package, dependencies: nonOptionalDependencies });
    }).catch(err => {
      debug('Error getting licenses');
      throw new Error(err);
    });
  });
}

/**
 * Inserts all hierarchies of the received module. All the ones that it depends on are inserted in the property hierarchy with a new value
 * @param {Object} dependencies object to store all dependencies
 * @param {Object} module module to search for dependencies to insert hierarchy
 */
function insertHierarchies(dependencies, { children, pkg }) {
  const modules = pkg.dependencies;
  const version = _semver2.default.coerce(pkg.version).raw;

  for (let child in children) {
    const childPkg = children[child].package;
    let dependency = dependencies[childPkg.name];

    if (modules && modules[childPkg.name]) {
      delete modules[childPkg.name];
    }

    if (!dependency) {
      dependency = new _report_model.Dependency({ title: pkg.name, main_version: version, description: pkg.description });

      dependency.private_versions.push(version);
      dependencies[childPkg.name] = dependency;
    }

    dependency.insertParents({
      parents: pkg.name + '/v' + version,
      private_versions: childPkg.version });
  }

  for (let moduleName in modules) {
    let dependency = dependencies[moduleName];
    if (!dependencies[moduleName]) {
      dependency = new _report_model.Dependency();
      dependencies[moduleName] = dependency;
    }

    dependency.parents.push(pkg.name + '/v' + version);
  }
}