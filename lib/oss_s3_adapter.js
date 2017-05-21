'use strict';
// OSS_S3Adapter
//
// Stores Parse files in AWS S3 and OSS.

var OSSAdapter = require('parse-server-oss-adapter');
var S3Adapter = require('parse-server-s3-adapter');


function OSS_S3Adapter(s3Adapter, ossAdapter) {
  this.s3Adapter = s3Adapter;
  this.ossAdapter = ossAdapter;

}

// For a given config object, filename, and data, store a file in S3 and OSS
// Returns a promise containing the S3  and OSS object creation response
OSS_S3Adapter.prototype.createFile = function(filename, data, contentType) {
  return Promise.all([
  this.ossAdapter.createFile(filename, data, contentType),
  this.s3Adapter.createFile(filename, data, contentType)
  ]);
}

OSS_S3Adapter.prototype.deleteFile = function(filename) {
return Promise.all([
  this.ossAdapter.deleteFile(filename),
  this.s3Adapter.deleteFile(filename)
  ]);
}

// Search for and return a file if found by filename
// Returns a promise that succeeds with the buffer result from OSS
OSS_S3Adapter.prototype.getFileData = function(filename) {
  return this.ossAdapter.getFileData(filename);
}

// Generates and returns the location of a file stored in OSS for the given request and filename
// The location is the direct S3 link if the option is set, otherwise we serve the file through parse-server
OSS_S3Adapter.prototype.getFileLocation = function(config, filename) {
  return this.ossAdapter.getFileLocation(config, filename);
}

module.exports = OSS_S3Adapter;
module.exports.default = OSS_S3Adapter;
