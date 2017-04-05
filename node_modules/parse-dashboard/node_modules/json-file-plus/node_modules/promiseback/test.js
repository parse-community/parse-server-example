'use strict';

var test = require('tape');
var promiseback = require('./');
var forEach = require('foreach');

var Deferred = promiseback.Deferred;
var Promise = Deferred.Promise;

var toStr = Object.prototype.toString;

test('without a promise', function (t) {
	t.test('no callback', function (st) {
		st.ok(promiseback() instanceof Deferred, 'returns a deferred');
		st.ok(promiseback(undefined) instanceof Deferred, 'returns a deferred');
		st.ok(promiseback(null) instanceof Deferred, 'returns a deferred');
		var notFunctions = [true, {}, [], /a/g, 42, 'foo'];
		forEach(notFunctions, function (notFunc) {
			var type = toStr.call(notFunc).slice(8, -1).toLowerCase();
			st.throws(function () { promiseback(notFunc); }, TypeError, type + ' is not a function');
		});
		st.end();
	});

	t.test('with a callback', function (st) {
		st.test('with a rejected promise', function (et) {
			et.plan(3);
			var deferred = promiseback(function (err, value) {
				et.equal(undefined, value, 'value is undefined');
				et.throws(function () { throw err; }, TypeError, 'calls the callback with an error');
			});
			et.ok(deferred instanceof Deferred, 'returns a deferred');
			deferred.reject(new TypeError('an error!'));
		});

		st.test('with a resolved promise', function (rpt) {
			rpt.plan(3);
			var deferred = promiseback(function (err, value) {
				rpt.error(err, 'no error');
				rpt.equal(value, 42, 'value is passed to the callback properly');
			});
			rpt.ok(deferred instanceof Deferred, 'returns a deferred');
			deferred.resolve(42);
		});

		st.end();
	});

	t.end();
});

test('with a promise', function (t) {
	t.test('no callback', function (st) {
		st.test('with a resolved promise', function (rpt) {
			rpt.plan(2);

			var fulfilled = Promise.resolve(42);
			var promisebacked = promiseback(fulfilled, null);

			rpt.ok(promisebacked instanceof Promise, 'returns a promise');
			promisebacked.then(function (value) {
				rpt.equal(value, 42, 'value is passed to the promise properly');
			});
		});

		st.test('with a rejected promise', function (et) {
			et.plan(2);

			var rejected = new Promise(function () { throw new Error(42); });
			var promisebacked = promiseback(rejected, null);

			et.ok(promisebacked instanceof Promise, 'returns a promise');
			promisebacked.then(null, function (reason) {
				et.throws(function () { throw reason; }, Error, 'error reason is passed');
			});
		});

		st.end();
	});

	t.test('with a callback', function (st) {
		st.test('with a resolved promise', function (rpt) {
			rpt.plan(4);

			var fulfilled = Promise.resolve(42);
			var promisebacked = promiseback(fulfilled, function (err, value) {
				rpt.error(err, 'no error');
				rpt.equal(value, 42, 'value is passed to the callback properly');
			});

			rpt.ok(promisebacked instanceof Promise, 'returns a promise');
			promisebacked.then(function (value) {
				rpt.equal(value, 42, 'value is passed to the promise properly');
			});
		});

		st.test('with a rejected promise', function (et) {
			et.plan(4);

			var rejected = new Promise(function () { throw new Error(42); });
			var promisebacked = promiseback(rejected, function (err, value) {
				et.equal(undefined, value, 'value is undefined');
				et.throws(function () { throw err; }, Error, 'calls the callback with an error');
			});

			et.ok(promisebacked instanceof Promise, 'returns a promise');
			promisebacked.then(null, function (reason) {
				et.throws(function () { throw reason; }, Error, 'error reason is passed');
			});
		});

		st.test('with a value', function (vt) {
			vt.plan(4);

			var promisebacked = promiseback(42, function (err, value) {
                vt.error(err, 'no error');
                vt.equal(value, 42, 'value is passed to the callback properly');
            });

            vt.ok(promisebacked instanceof Promise, 'returns a promise');
            promisebacked.then(function (value) {
                vt.equal(value, 42, 'value is passed to the promise properly');
            });
		});

		st.end();
	});

	t.end();
});
