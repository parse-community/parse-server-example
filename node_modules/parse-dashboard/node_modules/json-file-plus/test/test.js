'use strict';

var test = require('tape');
var path = require('path');
var jsonFile = require('../index');
var forEach = require('foreach');
var keys = require('object-keys');
var Promise = require('promiseback').Deferred.Promise;

var noNewlineFilename = 'test/no-trailing-newline.json';
var testFilename = 'test/test.json';
var testContents = {
	arr: [1, 2, 3],
	'false': false,
	foo: 'bar',
	'null': null,
	obj: {
		nested: {}
	},
	'true': true
};

var NODE_011_NOT_FOUND = -2;
var NODE_010_NOT_FOUND = 34;
var isFileNotFoundError = function (err) {
	return [NODE_010_NOT_FOUND, NODE_011_NOT_FOUND].indexOf(err.errno) > -1;
};

test('requires a callback when arg is provided', function (t) {
	t.plan(6);
	t['throws'](function () { jsonFile(testFilename, undefined); }, TypeError, 'requires a function');
	t['throws'](function () { jsonFile(testFilename, null); }, TypeError, 'requires a function');
	t['throws'](function () { jsonFile(testFilename, true); }, TypeError, 'requires a function');
	t['throws'](function () { jsonFile(testFilename, /a/g); }, TypeError, 'requires a function');
	t['throws'](function () { jsonFile(testFilename, []); }, TypeError, 'requires a function');
	t['throws'](function () { jsonFile(testFilename, {}); }, TypeError, 'requires a function');
	t.end();
});

test('returns a file', function (t) {
	t.plan(3);
	jsonFile(testFilename, function (err, file) {
		t.error(err, 'no error');
		t.ok(file instanceof jsonFile.JSONFile, 'file is instance of JSONFile');
		t.ok(file instanceof jsonFile.JSONData, 'file is instance of JSONData');
		t.end();
	});
});

test('returns an exception if the file is not found', function (t) {
	t.plan(4);
	jsonFile('NOT A REAL FILE', function (err, file) {
		t.ok(err, 'error is truthy');
		t.ok(isFileNotFoundError(err), 'error number is correct');
		var expectedError = {
			code: 'ENOENT',
			errno: err.errno,
			path: 'NOT A REAL FILE'
		};
		if (err.hasOwnProperty('syscall')) {
			expectedError.syscall = 'open';
		}
		t.deepEqual(err, expectedError, 'returns an error');
		t.equal(file, undefined, 'file is undefined');
		t.end();
	});
});

test('returns an exception if the file has invalid JSON', function (t) {
	t.plan(3);
	jsonFile(__filename, function (err, file) {
		t.ok(err instanceof SyntaxError, 'error is a SyntaxError');
		t.equal(err.message, 'Unexpected token \'', 'gives the expected error');
		t.equal(file, undefined, 'file is undefined');
		t.end();
	});
});

test('format', function (t) {
	t.plan(5);
	jsonFile(testFilename, function (err, file) {
		t.error(err, 'no error');
		t.equal(file.format.indent, '\t', 'reads tabs');
		t.equal(file.format.trailing, true, 'reads trailing newline');
		t.deepEqual(file.format, {
			indent: '\t',
			trailing: true
		}, 'entire format is properly read');

		t.test('no trailing newline', function (s1t) {
			s1t.plan(3);
			jsonFile(noNewlineFilename, function (noErr, noNewlineFile) {
				s1t.error(noErr, 'no error');
				s1t.notOk(noNewlineFile.format.trailing, 'reads no trailing newline');
				s1t.equal(noNewlineFile.format.indent, '   ', 'reads three spaces');
				s1t.end();
			});
		});
		t.end();
	});
});

test('#get(): file.data', function (st) {
	st.plan(3);
	jsonFile(testFilename, function (err, file) {
		st.error(err, 'no error');
		st.deepEqual(file.data, testContents, 'file.data matches expected');
		file.get('obj').then(function (value) {
			st.notEqual(value, file.data.obj, 'get(key)->object is not the same reference');
			st.end();
		});
	});
});

test('#get(): with key, promise', function (st) {
	st.plan(keys(testContents).length + 1);
	jsonFile(testFilename, function (err, file) {
		st.error(err, 'no error');
		forEach(testContents, function (keyContents, key) {
			file.get(key).then(function (value) {
				st.deepEqual(value, keyContents, 'data from get("' + key + '") matches');
			});
		});
	});
});

test('#get(): with key, callback', function (st) {
	st.plan(2 * keys(testContents).length + 1);
	jsonFile(testFilename, function (err, file) {
		st.error(err, 'no error');
		forEach(testContents, function (keyContents, key) {
			file.get(key, function (noError, data) {
				st.error(noError, 'no error');
				st.deepEqual(data, keyContents, 'data from callback get("' + key + '") matches');
			});
		});
	});
});

test('#get(): without key, promise', function (s2t) {
	s2t.plan(3);
	jsonFile(testFilename, function (err, file) {
		s2t.error(err, 'no error');
		file.get().then(function (getData) {
			s2t.deepEqual(getData, file.data, 'data from get() matches');
			s2t.notEqual(getData, file.data, 'data from get() is not the same reference');
			s2t.end();
		});
	});
});

test('#get(): without key, callback', function (s2t) {
	s2t.plan(4);
	jsonFile(testFilename, function (noLoadError, file) {
		s2t.error(noLoadError, 'no error');
		file.get(function (noError, data) {
			s2t.error(noError, 'no error');
			s2t.deepEqual(data, file.data, 'data from async get() matches');
			s2t.notEqual(data, file.data, 'data from async get() is not the same reference');
			s2t.end();
		});
	});
});

test('#remove()', function (st) {
	st.test('with key, callback', function (s2t) {
		s2t.plan(4);
		jsonFile(testFilename, function (noLoadError, file) {
			s2t.ifError(noLoadError, 'no error');
			file.remove('arr', function (noError, result) {
				s2t.ifError(noError, 'no error');
				s2t.equal(result, undefined, 'deletion successful');
				s2t.equal('arr' in file.data, false, 'key removed from data');
				s2t.end();
			});
		});
	});

	st.test('with key, promise', function (s2t) {
		s2t.plan(2);
		jsonFile(testFilename).then(function (file) {
			return Promise.all([file, file.remove('arr')]);
		}).then(function (results) {
			var file = results[0];
			var result = results[1];
			s2t.equal(result, undefined, 'deletion successful');
			s2t.equal('arr' in file.data, false, 'key removed from data');
			s2t.end();
		})['catch'](s2t.fail);
	});

	st.test('with an empty key', function (s2t) {
		s2t.plan(1);
		jsonFile(testFilename).then(function (file) {
			return file.remove('');
		}).then(s2t.fail)['catch'](function (err) {
			s2t.equal(err instanceof TypeError, true, 'err is TypeError');
			s2t.end();
		});
	});

	st.end();
});

test('#set()', function (t) {
	t.plan(4);
	jsonFile(testFilename, function (err, file) {
		t.error(err, 'no error');
		t.equal(undefined, file.data.foobar, 'foo starts undefined');
		var data = {
			foobar: {
				bar: 'baz',
				quux: true
			}
		};
		file.set(data);
		t.deepEqual(file.data.foobar, data.foobar, 'expected data is set');
		t.notEqual(file.data.foobar, data.foobar, 'data is not the same reference');

		t.end();
	});
});

test('#set(): setting invalid data', function (st) {
	st.plan(7);
	jsonFile(testFilename, function (err, file) {
		st.error(err, 'no error');
		var error = new TypeError('object must be a plain object');
		st['throws'](function () { return file.set(null); }, error, 'throws when given non-object');
		st['throws'](function () { return file.set(true); }, error, 'throws when given non-object');
		st['throws'](function () { return file.set([]); }, error, 'throws when given non-object');
		st['throws'](function () { return file.set(function () {}); }, error, 'throws when given non-object');
		st['throws'](function () { return file.set('foo'); }, error, 'throws when given non-object');
		st['throws'](function () { return file.set(/f/); }, error, 'throws when given non-object');
		st.end();
	});
});

test('returns an error when no file', function (t) {
	t.plan(4);
	var filename = path.join(process.cwd(), 'does not exist.json');
	jsonFile(filename, function (err, file) {
		t.ok(err, 'error is truthy');
		t.notOk(file, 'file is falsy');
		t.ok(isFileNotFoundError(err), 'error number is correct');
		var expectedError = {
			code: 'ENOENT',
			errno: err.errno,
			path: filename
		};
		if (err.hasOwnProperty('syscall')) {
			expectedError.syscall = 'open';
		}
		t.deepEqual(err, expectedError, 'returned an error');
		t.end();
	});
});

test('remembers filename', function (t) {
	t.plan(1);
	jsonFile(testFilename, function (err, file) {
		t.equal(file.filename, testFilename, 'filename equals ' + testFilename);
		t.end();
	});
});

test('saves properly', function (t) {
	t.plan(6);
	jsonFile(testFilename, function (noLoadError, file) {
		t.error(noLoadError, 'no error');
		t.equal(file.filename, testFilename, 'filename equals ' + testFilename);
		file.set({ foo: !testContents.foo });
		file.save(function (noError) {
			t.error(noError, 'no error');
			jsonFile(testFilename, function (err, file2) {
				file2.get('foo').then(function (value) {
					t.equal(value, !testContents.foo, 'value was properly saved');
					file2.set({ foo: testContents.foo }); // restore original value
					file2.save(function (noSaveError) {
						t.error(noSaveError, 'save callback: no error');
					}).then(function () {
						t.ok(true, 'save promise: success');
					})['catch'](function () {
						t.fail('save promise: error. should not be here.');
					});
				});
			});
		});
	});
});

test('#saveSync', function (t) {
	var file = jsonFile.sync(testFilename);
	file.set({ foo: !testContents.foo });
	try {
		file.saveSync();
		t.ok(true, 'saveSync: success');
	} finally {
		file.set({ foo: testContents.foo });
		file.saveSync();
		t.ok(true, 'saveSync, restore original: success');
		t.end();
	}
});

test('sync', function (t) {
	t['throws'](function () { jsonFile.sync('not a filename'); }, 'nonexistent filename throws');
	var file = jsonFile.sync(testFilename);
	t.deepEqual(file.data, testContents, 'sync file data is expected data');
	t.equal(true, file instanceof jsonFile.JSONFile, 'file is JSONFile');
	t.equal(true, file instanceof jsonFile.JSONData, 'file is JSONData');
	t.end();
});
