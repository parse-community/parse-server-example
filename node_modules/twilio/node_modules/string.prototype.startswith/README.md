# ES6 `String.prototype.startsWith` polyfill [![Build status](https://travis-ci.org/mathiasbynens/String.prototype.startsWith.svg?branch=master)](https://travis-ci.org/mathiasbynens/String.prototype.startsWith)

A robust & optimized ES3-compatible polyfill for [the `String.prototype.startsWith` method in ECMAScript 6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.startswith).

Other polyfills for `String.prototype.startsWith` are available:

* <https://github.com/paulmillr/es6-shim/blob/d8c4ec246a15e7df55da60b7f9b745af84ca9021/es6-shim.js#L166-L173> by [Paul Miller](http://paulmillr.com/) (~~fails some tests: [1](https://github.com/paulmillr/es6-shim/issues/167), [2](https://github.com/paulmillr/es6-shim/issues/175)~~ passes all tests)
* <https://github.com/google/traceur-compiler/blob/315bdad05d41de46d25337422d66686d63100d7a/src/runtime/polyfills/String.js#L19-L37> by Google (~~[fails a lot of tests](https://github.com/google/traceur-compiler/pull/554)~~ now uses this polyfill and passes all tests)

## Installation

In a browser:

```html
<script src="startswith.js"></script>
```

Via [npm](http://npmjs.org/):

```bash
npm install string.prototype.startswith
```

Then, in [Node.js](http://nodejs.org/):

```js
require('string.prototype.startswith');

// On Windows and on Mac systems with default settings, case doesn’t matter,
// which allows you to do this instead:
require('String.prototype.startsWith');
```

## Notes

Polyfills + test suites for [`String.prototype.endsWith`](http://mths.be/endswith) and [`String.prototype.contains`](http://mths.be/contains) are available, too.

## Author

| [![twitter/mathias](https://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](https://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](http://mathiasbynens.be/) |

## License

This polyfill is available under the [MIT](http://mths.be/mit) license.
