'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (promise) {
    return new Promise(function (resolve, reject) {
      promise.then(function (data) {
        resolve([null, data]);
      }).catch(function (err) {
        resolve([err]);
      });
    });
  });

  function catchifyPromise(_x) {
    return _ref.apply(this, arguments);
  }

  return catchifyPromise;
})();