'use strict'

const {Dependency} = require('../report_model')
const licenseManager = require('./licenses')
const fileManager = require('./file-manager')

const rtp = require('read-package-tree')
const debug = require('debug')('Dependencies')

const semver = require('semver')

/**
 * Gets all dependencies and builds an object after filtering into a ReportDependency
 * @param {Function} cb callback called when an error occurs or after filtering all dependencies
 */
function getDependencies (cb) {
  debug('Get dependencies')
  const dependencies = {}
  const licensePromises = []

  rtp('./', (err, data) => {
    if (err) {
      debug('Error getting dependencies')
      return cb(err)
    }
    const modules = data.children
    for (let module in modules) {
      const pkg = modules[module].package
      const version = semver.coerce(pkg.version).raw

      let dependency
      if (dependencies[pkg.name]) {
        dependency = dependencies[pkg.name]
        dependency.initializeDependency({title: pkg.name, main_version: version})
      } else {
        dependency = new Dependency({title: pkg.name, main_version: version})
        dependencies[pkg.name] = dependency
      }

      licensePromises.push(licenseManager(dependency, pkg)) // This returns a promise. Before generating full report, need to check if all operations have ended

      insertHierarchies(dependencies, { children: modules[module].children, pkg })
    }

    debug('Finished filtering dependencies')
    fileManager.writeBuildFile('only-dependencies.json', JSON.stringify(dependencies))

    Promise.all(licensePromises)
      .then(() => {
        const nonOptionalDependencies = Object.values(dependencies).filter(val => { return val.title !== undefined })
        cb(null, { pkg: data.package, dependencies: nonOptionalDependencies })
      })
      .catch(err => {
        debug('Error getting licenses')
        throw new Error(err)
      })
  })
}

/**
 * Inserts all hierarchies of the received module. All the ones that it depends on are inserted in the property hierarchy with a new value
 * @param {Object} dependencies object to store all dependencies
 * @param {Object} module module to search for dependencies to insert hierarchy
 */
function insertHierarchies (dependencies, {children, pkg}) {
  const modules = { ...pkg.dependencies }
  const version = semver.coerce(pkg.version).raw

  for (let child in children) {
    const childPkg = children[child].package
    let dependency = dependencies[childPkg.name]

    if (modules && modules[childPkg.name]) {
      delete modules[childPkg.name]
    }

    if (!dependency) {
      dependency = new Dependency({title: pkg.name, main_version: version})

      dependency.private_versions.push(version)
      dependencies[childPkg.name] = dependency
    }

    dependency.insertParents({
      parents: pkg.name + '/v' + version,
      private_versions: childPkg.version })
  }

  for (let moduleName in modules) {
    let dependency = dependencies[moduleName]
    if (!dependencies[moduleName]) {
      dependency = new Dependency()
      dependencies[moduleName] = dependency
    }

    dependency.parents.push(pkg.name + '/v' + version)
  }
}

module.exports = {
  getDependencies
}
