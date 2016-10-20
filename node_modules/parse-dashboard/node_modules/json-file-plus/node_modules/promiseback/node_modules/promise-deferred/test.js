'use strict';

var test = require('tape');
var Deferred = require('./');
var Promise = require('promise');

test('constructs', function (t) {
	t.ok(new Deferred() instanceof Deferred, 'constructs a new Deferred');
	t.ok(Deferred() instanceof Deferred, 'returns a new Deferred');
	t.notEqual(Deferred(), Deferred(), 'returns new instance each time');
	t.end();
});

test('Deferred has a reference to Promise', function (t) {
	t.equal(Deferred.Promise, Promise, 'Deferred.Promise === Promise');
	t.end();
});

test('has a promise', function (t) {
	var deferred = Deferred();
	t.ok(deferred.promise instanceof Promise, 'promise property is a Promise');
	t.end();
});

test('resolve', function (t) {
	var deferred = Deferred();
	t.plan(1);
	deferred.promise.then(function (value) {
		t.equal(value, 42, 'value is resolved properly');
	});
	deferred.resolve(42);
});

test('reject', function (t) {
	var deferred = Deferred();
	t.plan(1);
	deferred.promise.then(null, function (error) {
		t.equal(error, 'error', 'error is rejected properly');
	});
	deferred.reject('error');
});

