'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getDependencies;

var _report_model = require('../report_model');

var _licenses = require('./licenses');

var _licenses2 = _interopRequireDefault(_licenses);

var _fileManager = require('./file-manager');

var _fileManager2 = _interopRequireDefault(_fileManager);

var _readPackageTree = require('read-package-tree');

var _readPackageTree2 = _interopRequireDefault(_readPackageTree);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _bunyan2.default.createLogger({ name: 'Fetch-Dependencies' });

/**
 * Gets all dependencies and builds an object after filtering into a ReportDependency
 * @param {Function} cb callback called when an error occurs or after filtering all dependencies
*/
function getDependencies(invalidLicenses) {
  logger.info('Fetching dependencies');
  return new Promise((resolve, reject) => {
    const dependencies = {};
    const licensePromises = [];

    (0, _readPackageTree2.default)('./', (err, data) => {
      if (err) {
        logger.error('Error fetching dependencies');
        return reject(err);
      }
      const modules = data.children;
      const directDependencies = _extends({}, data.package.dependencies, data.package.devDependencies);

      modules.forEach(element => {
        const pkg = element.package;
        const version = pkg.version;

        let dependency;
        const direct = directDependencies[pkg.name] !== undefined;
        if (dependencies[pkg.name]) {
          dependency = dependencies[pkg.name];
          dependency.initializeDependency({ title: pkg.name, main_version: version, description: pkg.description, direct });
        } else {
          dependency = new _report_model.Dependency({ title: pkg.name, main_version: version, description: pkg.description, direct });
          dependencies[pkg.name] = dependency;
        }

        licensePromises.push((0, _licenses2.default)(dependency, element.package, invalidLicenses));

        insertHierarchies(dependencies, licensePromises, invalidLicenses, { currentDependency: dependency, rptDependency: element, rootDependencies: modules });
      });

      logger.info('Finished fetching dependencies');

      Promise.all(licensePromises).then(() => {
        logger.info('Finished filtering dependencies'); // Object.values needs at least version 8 of node
        const dependenciesArray = Object.values(dependencies);
        _fileManager2.default.writeBuildFile('only-dependencies.json', JSON.stringify(dependenciesArray));
        resolve({ pkg: data.package, dependencies: dependenciesArray });
      }).catch(err => {
        logger.error('Error getting licenses');
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
function insertHierarchies(dependencies, licensePromises, invalidLicenses, { currentDependency, rptDependency, rootDependencies }) {
  const children = rptDependency.children;
  const modules = rptDependency.package.dependencies;

  for (let child in children) {
    const childPkg = children[child].package;
    const childVersion = childPkg.version;
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

    licensePromises.push((0, _licenses2.default)(dependency, rptDependency.package, invalidLicenses));
  }

  for (let moduleName in modules) {
    let version = '';
    const rootDependency = rootDependencies.find(elem => elem.package.name === moduleName);
    const parentDependency = rptDependency.parent.children.find(elem => elem.package.name === moduleName);
    if (parentDependency) {
      version = parentDependency.package.version;
    } else if (rootDependency) {
      version = rootDependency.package.version;
    }

    currentDependency.insertChild(moduleName, version);
  }
}