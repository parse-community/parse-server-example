#promiseback <sup>[![Version Badge][npm-version-svg]][npm-url]</sup>

[![Build Status][travis-svg]][travis-url]
[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]

[![npm badge][npm-badge-png]][npm-url]

[![browser support][testling-png]][testling-url]

Accept an optional node-style callback, and also return a spec-compliant Promise!

## API
```js
var promiseback = require('promiseback');
var callback = function (err, value) {};

/* without a promise: */
promiseback(callback);
	/*
		- will throw if `callback` is not a function
		- returns a "deferred"
		- has resolve/reject methods, and `promise` property
		- will call `callback` as expected when deferred is resolved
	*/

/* with a promise: */
promiseback(promise, callback);
	/*
		- will throw if `callback` is truthy and not a function
		- `promise` will be converted to a Promise, so you can pass a value as well
		- returns a Promise
		- will call `callback` as expected when the promise is fulfilled
	*/
```

## Examples

Using deferreds:
```js
var promiseback = require('promiseback');

module.exports = function doSomethingCool(thing, callback) {
	// If callback is not provided, this code will simply return a normal promise.
	// If callback is provided but is not a function, promiseback will immediately throw a TypeError.

	// "deferred" is an object with `reject/resolve` methods, and a `promise` property.
	var deferred = promiseback(callback);
	if (thing) {
		deferred.resolve(thing);
	} else {
		deferred.reject(thing);
	}
	return deferred.promise;
};
```

Using a straight promise, when you can get it from somewhere else:
```js
var promiseback = require('promiseback');

module.exports = function doSomethingCool(thing, callback) {
	// If callback is not provided, this code will simply return a normal promise.
	// If callback is provided but is not a function, promiseback will immediately throw a TypeError.

	var newThingPromise = makeNewThing(thing);
	return promiseback(newThingPromise, callback);
};
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[npm-url]: https://npmjs.org/package/promiseback
[npm-version-svg]: http://versionbadg.es/ljharb/promiseback.svg
[travis-svg]: https://travis-ci.org/ljharb/promiseback.svg
[travis-url]: https://travis-ci.org/ljharb/promiseback
[deps-svg]: https://david-dm.org/ljharb/promiseback.svg
[deps-url]: https://david-dm.org/ljharb/promiseback
[dev-deps-svg]: https://david-dm.org/ljharb/promiseback/dev-status.svg
[dev-deps-url]: https://david-dm.org/ljharb/promiseback#info=devDependencies
[testling-png]: https://ci.testling.com/ljharb/promiseback.png
[testling-url]: https://ci.testling.com/ljharb/promiseback
[npm-badge-png]: https://nodei.co/npm/promiseback.png?downloads=true&stars=true
