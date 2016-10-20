'use strict';

var fs = require('fs');
var extend = require('node.extend');
var is = require('is');
var promiseback = require('promiseback');
var Promise = promiseback.Deferred.Promise;

var checkKey = function checkKey(key) {
	if ((typeof key !== 'string' || key.length === 0) && typeof key !== 'symbol') {
		throw new TypeError('key must be a Symbol, or a nonempty string');
	}
};

var JSONData = function JSONData(raw) {
	var hasTrailingNewline = (/\n\n$/).test(raw);
	var indentMatch = String(raw).match(/^[ \t]+/m);
	var indent = indentMatch ? indentMatch[0] : 2;

	this.format = {
		indent: indent,
		trailing: hasTrailingNewline
	};
	if (raw) {
		this.data = JSON.parse(raw);
	}
};

JSONData.prototype.get = function (key, callback) {
	var data = extend({}, this.data);
	if (is.fn(key)) {
		callback = key;
		key = null;
	}
	var value = key ? data[key] : data;
	if (is.hash(value)) {
		value = extend({}, value);
	}
	var deferred = promiseback(callback);
	deferred.resolve(value);
	return deferred.promise;
};

JSONData.prototype.set = function (obj) {
	if (!is.hash(obj)) { throw new TypeError('object must be a plain object'); }
	extend(true, this.data, obj);
};

JSONData.prototype.remove = function (key, callback) {
	var data = this.data;
	var deletion = Promise.resolve().then(function () {
		checkKey(key);
		var status = delete data[key];
		if (!status) {
			return Promise.reject(new Error('deletion failed'));
		}
		return void 0;
	});
	return promiseback(deletion, callback);
};

JSONData.prototype.stringify = function stringify() {
	var endingNewlines = this.format.trailing ? '\n\n' : '\n';
	var indent = this.format.indent || 2;
	return new Buffer(JSON.stringify(this.data, null, indent) + endingNewlines);
};

var JSONFile = function JSONFile(filename, raw) {
	JSONData.call(this, raw);
	this.filename = filename;
};
JSONFile.prototype = new JSONData();

JSONFile.prototype.save = function (callback) {
	var deferred = promiseback(callback);
	fs.writeFile(this.filename, this.stringify(), function (err, result) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

JSONFile.prototype.saveSync = function () {
	fs.writeFileSync(this.filename, this.stringify());
};

var readJSON = function readJSON(filename) {
	var callback;
	if (arguments.length > 1) {
		callback = arguments[1];
		if (!is.fn(callback)) {
			throw new TypeError('callback must be a function if provided');
		}
	}
	var deferred = promiseback(callback);
	fs.readFile(filename, { encoding: 'utf8' }, function (err, raw) {
		var file;

		if (err) {
			deferred.reject(err);
		} else {
			try {
				file = new JSONFile(filename, raw);
				deferred.resolve(file);
			} catch (e) {
				deferred.reject(e);
			}
		}
	});
	return deferred.promise;
};

var readJSONSync = function readJSONSync(filename) {
	var raw = fs.readFileSync(filename, 'utf8');
	return new JSONFile(filename, raw);
};

readJSON.sync = readJSONSync;

readJSON.JSONFile = JSONFile;
readJSON.JSONData = JSONData;

module.exports = readJSON;
