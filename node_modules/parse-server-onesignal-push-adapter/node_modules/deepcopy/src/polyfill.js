const toString = Object.prototype.toString;

const isBuffer = (typeof Buffer !== 'undefined') ?
  function isBuffer(obj) {
    return Buffer.isBuffer(obj);
  } :
  function isBuffer() {
    // always return false in browsers
    return false;
  };

const getKeys = (typeof Object.keys === 'function') ?
  function getKeys(obj) {
    return Object.keys(obj);
  } :
  function getKeys(obj) {
    const objType = typeof obj;

    if (obj === null || (objType !== 'function' && objType !== 'object')) {
      throw new TypeError('obj must be an Object');
    }

    let resultKeys = [],
        key;

    for (key in obj) {
      Object.prototype.hasOwnProperty.call(obj, key) && resultKeys.push(key);
    }

    return resultKeys;
  };

const getSymbols = (typeof Symbol === 'function') ?
  function getSymbols(obj) {
    return Object.getOwnPropertySymbols(obj);
  } :
  function getSymbols() {
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

  let i, len, value;

  for (i = 0, len = array.length; i < len; ++i) {
    value = array[i];

    // NOTE:
    //
    //   it is SameValue algorithm
    //   http://stackoverflow.com/questions/27144277/comparing-a-variable-with-itself
    //
    // eslint-disable-next-line no-self-compare
    if (value === s || (value !== value && s !== s)) {
      return i;
    }
  }

  return -1;
}

export {
  getKeys,
  getSymbols,
  indexOf,
  isBuffer,
};
