'use strict';

var Promise = require('promise');

var Deferred = function Deferred() {
	if (!(this instanceof Deferred)) { return new Deferred(); }

	var self = this;
	self.promise = new Promise(function (resolve, reject) {
		self.resolve = resolve;
		self.reject = reject;
	});
	return self;
};
Deferred.Promise = Promise;

module.exports = Deferred;

