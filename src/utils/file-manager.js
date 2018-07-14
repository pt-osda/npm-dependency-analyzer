'use strict'

import fs from 'fs'

/**
 * Writes into a file asynchronously
 * @param {String} fileName the name of the file to write to
 * @param {String} fileData the data to be written
 */
export default function writeBuildFile (fileName, fileData) {
  fs.stat('./build', (err, stats) => {
    if (err) {
      fs.mkdir('./build', err => {
        if (err) {
          throw new Error(err)
        }
        fs.writeFileSync(`./build/${fileName}`, fileData)
      })
    } else {
      fs.writeFileSync(`./build/${fileName}`, fileData)
    }
  })
}
