'use strict'

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

export function checkParams (ctorName, required = [], params = {}) {
  const missing = required.filter(param => !(param in params))

  if (missing.length) {
    throw new Error(`${ctorName}() Missing required parameter(s): ${missing.join(', ')}`)
  }
}
