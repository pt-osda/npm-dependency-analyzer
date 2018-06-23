#!/usr/bin/env node

'use strict'

/*
 * Command that reads the package.json from the project this module is a dependency,
 * and writes it's content to a new file on a build folder. After this gets all vulnerabilities known and licenses.
 */
const checkProject = require('../lib/index').default
const debug = require('debug')('Main')
const fs = require('fs')

fs.readFile('.osda', 'UTF-8', (err, data) => {
  if (err) {
    debug('Error encountered trying to read .osda file - ' + err)
    throw err
  }
  checkProject(JSON.parse(data))
})
