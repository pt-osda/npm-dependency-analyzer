'use strict';

const fs = require('fs');

function writeBuildFile(fileName, fileData) {
  fs.stat('./build', (err, stats) => {
    if (err) {
      fs.mkdir('./build', err => {
        if (err) {
          throw new Error(err);
        }
        fs.writeFileSync(`./build/${fileName}`, fileData);
      });
    } else {
      fs.writeFileSync(`./build/${fileName}`, fileData);
    }
  });
}

function readFile(filePath, cb) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      return cb(err);
    }
    if (stats.isFile) {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          return cb(err);
        }
        return cb(null, data);
      });
    }
  });
}

module.exports = {
  writeBuildFile,
  readFile
};