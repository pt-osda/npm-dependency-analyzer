'use strict'

/**
 * Catchifies a promise
 * @param {Promise} promise promise to catchify
 */
export async function catchifyPromise (promise) {
  return new Promise((resolve, reject) => {
    promise.then(data => {
      resolve([null, data])
    })
      .catch(err => {
        resolve([err])
      })
  })
}

/**
 * Checks all properties in an object
 * @param {String} name the name related to the object
 * @param {Array} required an array with all the names of the required properties
 * @param {Object} params object with the parameters to check
 */
export function checkParams (name, required = [], params = {}) {
  const missing = required.filter(param => !(param in params))

  if (missing.length) {
    throw new Error(`${name}() Missing required parameter(s): ${missing.join(', ')}`)
  }
}
