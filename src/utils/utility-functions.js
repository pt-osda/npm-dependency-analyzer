'use strict'

export default async function catchifyPromise (promise) {
  return new Promise((resolve, reject) => {
    promise.then(data => {
      resolve([null, data])
    })
      .catch(err => {
        resolve([err])
      })
  })
}
