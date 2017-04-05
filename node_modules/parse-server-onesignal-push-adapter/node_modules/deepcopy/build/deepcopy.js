/*!
 * @license deepcopy.js Copyright(c) 2013 sasa+1
 * https://github.com/sasaplus1/deepcopy.js
 * Released under the MIT license.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["deepcopy"] = factory();
	else
		root["deepcopy"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(3);

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	var toString = Object.prototype.toString;

	var isBuffer = typeof Buffer !== 'undefined' ? function isBuffer(obj) {
	  return Buffer.isBuffer(obj);
	} : function isBuffer() {
	  // always return false in browsers
	  return false;
	};

	var getKeys = typeof Object.keys === 'function' ? function getKeys(obj) {
	  return Object.keys(obj);
	} : function getKeys(obj) {
	  var objType = typeof obj;

	  if (obj === null || objType !== 'function' && objType !== 'object') {
	    throw new TypeError('obj must be an Object');
	  }

	  var resultKeys = [],
	      key = void 0;

	  for (key in obj) {
	    Object.prototype.hasOwnProperty.call(obj, key) && resultKeys.push(key);
	  }

	  return resultKeys;
	};

	var getSymbols = typeof Symbol === 'function' ? function getSymbols(obj) {
	  return Object.getOwnPropertySymbols(obj);
	} : function getSymbols() {
	  // always return empty Array when Symbol is not supported
	  return [];
	};

	// NOTE:
	//
	//   Array.prototype.indexOf is cannot find NaN (in Chrome)
	//   Array.prototype.includes is can find NaN (in Chrome)
	//
	//   this function can find NaN, because use SameValue algorithm
	function indexOf(array, s) {
	  if (toString.call(array) !== '[object Array]') {
	    throw new TypeError('array must be an Array');
	  }

	  var i = void 0,
	      len = void 0,
	      value = void 0;

	  for (i = 0, len = array.length; i < len; ++i) {
	    value = array[i];

	    // NOTE:
	    //
	    //   it is SameValue algorithm
	    //   http://stackoverflow.com/questions/27144277/comparing-a-variable-with-itself
	    //
	    // eslint-disable-next-line no-self-compare
	    if (value === s || value !== value && s !== s) {
	      return i;
	    }
	  }

	  return -1;
	}

	exports.getKeys = getKeys;
	exports.getSymbols = getSymbols;
	exports.indexOf = indexOf;
	exports.isBuffer = isBuffer;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.copyValue = exports.copyCollection = exports.copy = void 0;

	var _polyfill = __webpack_require__(1);

	var toString = Object.prototype.toString;

	function copy(target, customizer) {
	  var resultValue = copyValue(target);

	  if (resultValue !== null) {
	    return resultValue;
	  }

	  return copyCollection(target, customizer);
	}

	function copyCollection(target, customizer) {
	  if (typeof customizer !== 'function') {
	    throw new TypeError('customizer is must be a Function');
	  }

	  if (typeof target === 'function') {
	    var source = String(target);

	    // NOTE:
	    //
	    //   https://gist.github.com/jdalton/5e34d890105aca44399f
	    //
	    //   - https://gist.github.com/jdalton/5e34d890105aca44399f#gistcomment-1283831
	    //   - http://es5.github.io/#x15
	    //
	    //   native functions does not have prototype:
	    //
	    //       Object.toString.prototype  // => undefined
	    //       (function() {}).prototype  // => {}
	    //
	    //   but cannot detect native constructor:
	    //
	    //       typeof Object     // => 'function'
	    //       Object.prototype  // => {}
	    //
	    //   and cannot detect null binded function:
	    //
	    //       String(Math.abs)
	    //         // => 'function abs() { [native code] }'
	    //
	    //     Firefox, Safari:
	    //       String((function abs() {}).bind(null))
	    //         // => 'function abs() { [native code] }'
	    //
	    //     Chrome:
	    //       String((function abs() {}).bind(null))
	    //         // => 'function () { [native code] }'
	    if (/^\s*function\s*\S*\([^\)]*\)\s*{\s*\[native code\]\s*}/.test(source)) {
	      // native function
	      return target;
	    } else {
	      // user defined function
	      return new Function('return ' + String(source))();
	    }
	  }

	  var targetClass = toString.call(target);

	  if (targetClass === '[object Array]') {
	    return [];
	  }

	  if (targetClass === '[object Object]' && target.constructor === Object) {
	    return {};
	  }

	  if (targetClass === '[object Date]') {
	    // NOTE:
	    //
	    //   Firefox need to convert
	    //
	    //   Firefox:
	    //     var date = new Date;
	    //     +date;            // 1420909365967
	    //     +new Date(date);  // 1420909365000
	    //     +new Date(+date); // 1420909365967
	    //
	    //   Chrome:
	    //     var date = new Date;
	    //     +date;            // 1420909757913
	    //     +new Date(date);  // 1420909757913
	    //     +new Date(+date); // 1420909757913
	    return new Date(target.getTime());
	  }

	  if (targetClass === '[object RegExp]') {
	    // NOTE:
	    //
	    //   Chrome, Safari:
	    //     (new RegExp).source => "(?:)"
	    //
	    //   Firefox:
	    //     (new RegExp).source => ""
	    //
	    //   Chrome, Safari, Firefox:
	    //     String(new RegExp) => "/(?:)/"
	    var regexpText = String(target),
	        slashIndex = regexpText.lastIndexOf('/');

	    return new RegExp(regexpText.slice(1, slashIndex), regexpText.slice(slashIndex + 1));
	  }

	  if ((0, _polyfill.isBuffer)(target)) {
	    var buffer = new Buffer(target.length);

	    target.copy(buffer);

	    return buffer;
	  }

	  var customizerResult = customizer(target);

	  if (customizerResult !== void 0) {
	    return customizerResult;
	  }

	  return null;
	}

	function copyValue(target) {
	  var targetType = typeof target;

	  // copy String, Number, Boolean, undefined and Symbol
	  // without null and Function
	  if (target !== null && targetType !== 'object' && targetType !== 'function') {
	    return target;
	  }

	  return null;
	}

	exports.copy = copy;
	exports.copyCollection = copyCollection;
	exports.copyValue = copyValue;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _copy = __webpack_require__(2);

	var _polyfill = __webpack_require__(1);

	function defaultCustomizer(target) {
	  return void 0;
	}

	function deepcopy(target) {
	  var customizer = arguments.length <= 1 || arguments[1] === void 0 ? defaultCustomizer : arguments[1];

	  if (target === null) {
	    // copy null
	    return null;
	  }

	  var resultValue = (0, _copy.copyValue)(target);

	  if (resultValue !== null) {
	    // copy some primitive types
	    return resultValue;
	  }

	  var resultCollection = (0, _copy.copyCollection)(target, customizer),
	      clone = resultCollection !== null ? resultCollection : target;

	  var visited = [target],
	      reference = [clone];

	  // recursively copy from collection
	  return recursiveCopy(target, customizer, clone, visited, reference);
	}

	function recursiveCopy(target, customizer, clone, visited, reference) {
	  if (target === null) {
	    // copy null
	    return null;
	  }

	  var resultValue = (0, _copy.copyValue)(target);

	  if (resultValue !== null) {
	    // copy some primitive types
	    return resultValue;
	  }

	  var keys = (0, _polyfill.getKeys)(target).concat((0, _polyfill.getSymbols)(target));

	  var i = void 0,
	      len = void 0;

	  var key = void 0,
	      value = void 0,
	      index = void 0,
	      resultCopy = void 0,
	      result = void 0,
	      ref = void 0;

	  for (i = 0, len = keys.length; i < len; ++i) {
	    key = keys[i];
	    value = target[key];
	    index = (0, _polyfill.indexOf)(visited, value);

	    resultCopy = void 0;
	    result = void 0;
	    ref = void 0;

	    if (index === -1) {
	      resultCopy = (0, _copy.copy)(value, customizer);
	      result = resultCopy !== null ? resultCopy : value;

	      if (value !== null && /^(?:function|object)$/.test(typeof value)) {
	        visited.push(value);
	        reference.push(result);
	      }
	    } else {
	      // circular reference
	      ref = reference[index];
	    }

	    clone[key] = ref || recursiveCopy(value, customizer, result, visited, reference);
	  }

	  return clone;
	}

	exports['default'] = deepcopy;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;