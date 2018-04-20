'use strict'

const {Dependency} = require('../report_model')

const rtp = require('read-package-tree')
const debug = require('debug')('Dependencies')

const {openSync, writeFileSync, closeSync} = require('fs')

module.exports = {
	getDependencies
}

/**
 * Gets all dependencies and builds an object after filtering into a ReportDependency
 * @param {Function} cb callback called when an error occurs or after filtering all dependencies
 */
function getDependencies(cb){
	debug('Get dependencies')
	const dependencies = {}

	rtp('./', (err, data) => {
		if(err){
			debug('Error getting dependencies')
			return cb(err)
		}
		const modules = data.children
		for(let module in modules) {
			const pkg = modules[module].package

			let dependency
			if(dependencies[pkg.name]){
				dependency = dependencies[pkg.name]
				dependency.title = pkg.name
				dependency.main_version = pkg.version
			}
			else{
				dependency = new Dependency(pkg.name, pkg.version)
				dependencies[pkg.name] = dependency
			}

			dependency.license.push(pkg.license)
			
			insertHierarchies(dependencies, { children: modules[module].children, pkg })
		}

		debug('Finished filtering dependencies')
		writeToFile('testing.json', JSON.stringify(dependencies))
		cb(null, { pkg: data.package, dependencies })
	})
}

/**
 * Inserts all hierarchies of the received module. All the ones that it depends on are inserted in the property hierarchy with a new value
 * @param {Object} dependencies object to store all dependencies
 * @param {Object} module module to search for dependencies to insert hierarchy
 */
function insertHierarchies(dependencies, module){
	const modules =  module.dependencies || module.devDependencies

	for(let child in module.children){
		if(modules && modules[child.name]){
			delete modules[child]
		}
		
		const childPkg = module.children[child].package

		if(!dependencies[childPkg.name]){
			dependencies[childPkg.name] = new Dependency()
			dependencies[childPkg.name].title = childPkg.name
			dependencies[childPkg.name].main_version = childPkg.version
		}
		
		dependencies[childPkg.name].hierarchy.push(module.pkg.name+'/v'+module.pkg.version)
		dependencies[childPkg.name].private_versions.push(childPkg.version)
	}

	for(let moduleName in modules){
		if(!dependencies[moduleName]){
			dependencies[moduleName] = new Dependency()
		}
		dependencies[moduleName].hierarchy.push(module.name+'/v'+module.version)
	}
}

function writeToFile(fileName, data){
	const fileDescriptor = openSync('build/'+fileName, 'w')
	writeFileSync(fileDescriptor, data, 'utf-8')
	closeSync(fileDescriptor)
}