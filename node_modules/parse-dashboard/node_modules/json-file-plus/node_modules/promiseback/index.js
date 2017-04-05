'use strict';

var Deferred = require('promise-deferred');
var Promise = Deferred.Promise;
var isCallable = require('is-callable');

module.exports = function promiseback() {
	var promise, callback;
	if (arguments.length > 1) {
		promise = Promise.resolve(arguments[0]);
		callback = arguments[1];
	} else if (arguments.length > 0) {
		callback = arguments[0];
	}
	var callbackIsFn = isCallable(callback);

	// invalid callback
	if (callback != null && !callbackIsFn) {
		throw new TypeError('callback must be a function if present');
	}

	var promisebacked = new Deferred();

	if (callbackIsFn) {
		promisebacked.promise.nodeify(callback);
	}

	if (promise) {
		promise.then(promisebacked.resolve, promisebacked.reject);
	}
	return promise ? promisebacked.promise : promisebacked;
};
module.exports.Deferred = Deferred;

