'use strict'

import rpt from 'read-package-tree'
import bunyan from 'bunyan'

import {Dependency} from '../report_model'

const logger = bunyan.createLogger({name: 'Fetch-Dependencies'})

/**
 * Gets all dependencies and builds an object after filtering into a ReportDependency
*/
export default function getDependencies () {
  logger.info('Fetching dependencies')
  return new Promise((resolve, reject) => {
    const dependencies = {}

    rpt('./', (err, data) => {
      if (err) {
        logger.error('Error fetching dependencies')
        return reject(err)
      }
      const modules = data.children
      const directDependencies = { ...data.package.dependencies, ...data.package.devDependencies }

      modules.forEach(element => {
        const pkg = element.package
        const version = pkg.version

        let dependency
        const direct = directDependencies[pkg.name] !== undefined
        if (dependencies[pkg.name]) {
          dependency = dependencies[pkg.name]
          dependency.initializeDependency({title: pkg.name, main_version: version, description: pkg.description, direct})
        } else {
          dependency = new Dependency({title: pkg.name, main_version: version, description: pkg.description, direct})
          dependencies[pkg.name] = dependency
        }

        insertHierarchies(dependencies, { currentDependency: dependency, rptDependency: element, rootDependencies: modules })
      })

      logger.info('Finished fetching dependencies')

      resolve({ pkg: data.package, dependencies: Object.values(dependencies) })
    })
  })
}

/**
 * Inserts all hierarchies of the received module. All the ones that it depends on are inserted in the property hierarchy with a new value
 * @param {Object} dependencies object to store all dependencies
 * @param {Object} relatedDependencies object that holds the current report dependency object,
 *                                      its equivalent returned by the read-package-tree module and
 *                                      an array of all dependencies installed in the root node_modules folder
*/
function insertHierarchies (dependencies, {currentDependency, rptDependency, rootDependencies}) {
  const children = rptDependency.children
  const modules = rptDependency.package.dependencies

  for (let child in children) {
    const childPkg = children[child].package
    const childVersion = childPkg.version
    let dependency = dependencies[childPkg.name]

    if (modules && modules[childPkg.name]) {
      delete modules[childPkg.name]
    }

    if (!dependency) {
      dependency = new Dependency({title: childPkg.name, main_version: childVersion, description: childPkg.description, direct: false})

      dependencies[childPkg.name] = dependency
    }
    currentDependency.insertChild(childPkg.name, childVersion)
    dependency.insertPrivateVersion(childVersion)
  }

  for (let moduleName in modules) {
    let version = ''
    const rootDependency = rootDependencies.find(elem => elem.package.name === moduleName)
    const parentDependency = rptDependency.parent.children.find(elem => elem.package.name === moduleName)
    if (parentDependency) {
      version = parentDependency.package.version
    } else if (rootDependency) {
      version = rootDependency.package.version
    }

    currentDependency.insertChild(moduleName, version)
  }
}
