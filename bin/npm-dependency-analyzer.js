#!/usr/bin/env node

'use strict'

/*
 * Command that reads the package.json from the project this module is a dependency,
 * and writes it's content to a new file on a build folder. After this gets all vulnerabilities known and licenses.
 */
const checkProject = require('../lib/index').default
const logger = require('bunyan').createLogger({name: 'Main'})
const utils = require('../lib/utils/utility-functions')
const fs = require('fs')

fs.readFile('.osda', 'UTF-8', (err, data) => {
  if (err) {
    logger.error('Error encountered trying to read .osda file - ' + err)
    throw err
  }
  const policy = JSON.parse(data)
  utils.checkParams('Policy', ['project_id', 'project_name', 'admin'], policy)
  checkProject(policy)
})
