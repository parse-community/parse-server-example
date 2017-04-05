'use strict';

exports.__esModule = true;

var _copy = require('./copy');

var _polyfill = require('./polyfill');

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