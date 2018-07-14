'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = writeBuildFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Writes into a file asynchronously
 * @param {String} fileName the name of the file to write to
 * @param {String} fileData the data to be written
 */
function writeBuildFile(fileName, fileData) {
  _fs2.default.stat('./build', (err, stats) => {
    if (err) {
      _fs2.default.mkdir('./build', err => {
        if (err) {
          throw new Error(err);
        }
        _fs2.default.writeFileSync(`./build/${fileName}`, fileData);
      });
    } else {
      _fs2.default.writeFileSync(`./build/${fileName}`, fileData);
    }
  });
}