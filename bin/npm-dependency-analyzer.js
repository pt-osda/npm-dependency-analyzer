#!/usr/bin/env node

'use strict'

/* 
 * Command that reads the package.json from the project this module is a dependency,
 * and writes it's content to a new file on a build folder. After this gets all vulnerabilities known and licenses.
 */

const index = require('../src/index')
const { exists, mkdir } = require('fs')

exists('./build', exists => {
	if(!exists){
		mkdir('./build', err => {
			if(err){
				throw new Error(err)
			}
			index.checkProject()
		})
	}
	else{
		index.checkProject()
	}
}) 