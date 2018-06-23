'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
// import lodash from 'lodash'

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

const debug = (0, _debug2.default)('Dependencies');

/**
 * Gets all dependencies and builds an object after filtering into a ReportDependency
 * @param {Function} cb callback called when an error occurs or after filtering all dependencies
*/
function getDependencies() {
  debug('Get dependencies');
  return new Promise((resolve, reject) => {
    const dependencies = {};
    const licensePromises = [];

    (0, _readPackageTree2.default)('./', (err, data) => {
      if (err) {
        debug('Error getting dependencies');
        return reject(err);
      }
      const modules = data.children;
      const directDependencies = _extends({}, data.package.dependencies, data.package.devDependencies);
      for (let module in modules) {
        const pkg = modules[module].package;
        const version = _semver2.default.coerce(pkg.version).raw;

        let dependency;
        const direct = directDependencies[pkg.name] !== undefined;
        if (dependencies[pkg.name]) {
          dependency = dependencies[pkg.name];
          dependency.initializeDependency({ title: pkg.name, main_version: version, description: pkg.description, direct });
        } else {
          dependency = new _report_model.Dependency({ title: pkg.name, main_version: version, description: pkg.description, direct });
          dependencies[pkg.name] = dependency;
        }

        licensePromises.push((0, _licenses2.default)(dependency, pkg));

        insertHierarchies(dependencies, licensePromises, { currentDependency: dependency, rptDependency: modules[module], rootDependencies: modules });
      }

      debug('Finished filtering dependencies');

      Promise.all(licensePromises).then(() => {
        const nonOptionalDependencies = Object.values(dependencies).filter(val => {
          return val.title !== undefined;
        });
        _fileManager2.default.writeBuildFile('only-dependencies.json', JSON.stringify(nonOptionalDependencies));
        resolve({ pkg: data.package, dependencies: nonOptionalDependencies });
      }).catch(err => {
        debug('Error getting licenses');
        reject(err);
      });
    });
  });
}

/**
 * Inserts all hierarchies of the received module. All the ones that it depends on are inserted in the property hierarchy with a new value
 * @param {Object} dependencies object to store all dependencies
 * @param {Object} module module to search for dependencies to insert hierarchy
*/
function insertHierarchies(dependencies, licensePromises, { currentDependency, rptDependency, rootDependencies }) {
  const pkg = rptDependency.package;
  const children = rptDependency.children;
  const modules = pkg.dependencies;
  const version = _semver2.default.coerce(pkg.version).raw;

  for (let child in children) {
    const childPkg = children[child].package;
    const childVersion = _semver2.default.coerce(childPkg.version).raw;
    let dependency = dependencies[childPkg.name];

    if (modules && modules[childPkg.name]) {
      delete modules[childPkg.name];
    }

    if (!dependency) {
      dependency = new _report_model.Dependency({ title: childPkg.name, main_version: childVersion, description: childPkg.description, direct: false });

      dependencies[childPkg.name] = dependency;
    }

    currentDependency.insertChild(childPkg.name, childVersion);
    dependency.insertPrivateVersion(childVersion);

    licensePromises.push((0, _licenses2.default)(dependency, childPkg));
  }

  for (let moduleName in modules) {
    const simpleVersion = rootDependencies.find(elem => elem.package.name === moduleName).package.version;
    const version = _semver2.default.coerce(simpleVersion).raw;
    currentDependency.insertChild(moduleName, version);
  }
}