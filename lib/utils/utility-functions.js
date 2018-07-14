'use strict';

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

exports.checkParams = checkParams;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function checkParams(ctorName, required = [], params = {}) {
  const missing = required.filter(param => !(param in params));

  if (missing.length) {
    throw new Error(`${ctorName}() Missing required parameter(s): ${missing.join(', ')}`);
  }
}