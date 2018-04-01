'use strict'

const assert = require('assert')
const fs = require('fs')

const npmValidator = require('./../lib/index')

describe('IO operations', function() {
	
	it('read', function(done){
		const packageContent = JSON.parse(npmValidator.readPackage())
		assert.equal(packageContent.license, 'BSD-3-Clause')
		assert.equal(packageContent.name, 'npm-dependency-analyzer')
		done()
	})

	it('write', function(done){
		const filePath = 'test/testFileWrite.txt'
		const packageContent = JSON.parse(npmValidator.readPackage())
		npmValidator.writePackage(filePath, JSON.stringify(packageContent))
		const newFileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
		assert.equal(packageContent.license, newFileContent.license)
		assert.equal(packageContent.name, newFileContent.name)
		done()
	})
	
})