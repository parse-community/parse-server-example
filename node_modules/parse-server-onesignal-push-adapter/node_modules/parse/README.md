# Parse SDK for JavaScript
[![Build Status][build-status-svg]][build-status-link]
[![Test Coverage][coverage-status-svg]][coverage-status-link]
[![Npm Version][npm-svg]][npm-link]
[![License][license-svg]][license-link]

A library that gives you access to the powerful Parse cloud platform from your JavaScript app. For more information on Parse and its features, see [the website](https://parse.com) or [the JavaScript guide](https://parseplatform.github.io/docs/js/guide/).

## Getting Started

The easiest way to integrate the Parse SDK into your JavaScript project is through the [npm module](https://npmjs.org/parse).
However, if you want to use a pre-compiled file, you can fetch it from [npmcdn](https://npmcdn.com). The development version is available at [https://npmcdn.com/parse/dist/parse.js](https://npmcdn.com/parse/dist/parse.js), and the minified production version is at [https://npmcdn.com/parse/dist/parse.min.js](https://npmcdn.com/parse/dist/parse.min.js).

### Using Parse on Different Platforms

The JavaScript ecosystem is wide and incorporates a large number of platforms and execution environments. To handle this, the Parse npm module contains special versions of the SDK tailored to use in Node.js and [React Native](https://facebook.github.io/react-native/) environments. Not all features make sense in all environments, so using the appropriate package will ensure that items like local storage, user sessions, and HTTP requests use appropriate dependencies.

To use the npm modules for a browser based application, include it as you normally would:

```js
var Parse = require('parse');
```

For server-side applications or Node.js command line tools, include `'parse/node'`:

```js
// In a node.js environment
var Parse = require('parse/node');
```

For React Native applications, include `'parse/react-native'`:
```js
// In a React Native application
var Parse = require('parse/react-native');
```

## License

```
Copyright (c) 2015-present, Parse, LLC.
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree. An additional grant 
of patent rights can be found in the PATENTS file in the same directory.
```

 [build-status-svg]: https://travis-ci.org/ParsePlatform/Parse-SDK-JS.svg?branch=master
 [build-status-link]: https://travis-ci.org/ParsePlatform/Parse-SDK-JS
 [coverage-status-svg]: http://codecov.io/github/ParsePlatform/Parse-SDK-JS/coverage.svg?branch=master
 [coverage-status-link]: http://codecov.io/github/ParsePlatform/Parse-SDK-JS?branch=master
 [npm-svg]: https://badge.fury.io/js/parse.svg
 [npm-link]: https://npmjs.org/parse
 [license-svg]: https://img.shields.io/badge/license-BSD-lightgrey.svg
 [license-link]: https://github.com/ParsePlatform/Parse-SDK-JS/blob/master/LICENSE
