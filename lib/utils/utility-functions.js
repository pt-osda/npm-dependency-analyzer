'use strict';

/**
 * Catchifies a promise
 * @param {Promise} promise promise to catchify
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

let catchifyPromise = exports.catchifyPromise = (() => {
  var _ref = _asyncToGenerator(function* (promise) {
    return new Promise(function (resolve, reject) {
      promise.then(function (data) {
        resolve([null, data]);
      }).catch(function (err) {
        resolve([err]);
      });
    });
  });

  return function catchifyPromise(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Checks all properties in an object
 * @param {String} name the name related to the object
 * @param {Array} required an array with all the names of the required properties
 * @param {Object} params object with the parameters to check
 */


exports.checkParams = checkParams;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function checkParams(name, required = [], params = {}) {
  const missing = required.filter(param => !(param in params));

  if (missing.length) {
    throw new Error(`${name}() Missing required parameter(s): ${missing.join(', ')}`);
  }
}