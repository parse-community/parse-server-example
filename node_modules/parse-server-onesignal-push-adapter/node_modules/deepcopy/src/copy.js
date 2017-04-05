import { isBuffer } from './polyfill';

const toString = Object.prototype.toString;

function copy(target, customizer) {
  const resultValue = copyValue(target);

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
    const source = String(target);

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
      return (new Function(`return ${source}`)());
    }
  }

  const targetClass = toString.call(target);

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
    const regexpText = String(target),
          slashIndex = regexpText.lastIndexOf('/');

    return new RegExp(
      regexpText.slice(1, slashIndex),
      regexpText.slice(slashIndex + 1)
    );
  }

  if (isBuffer(target)) {
    const buffer = new Buffer(target.length);

    target.copy(buffer);

    return buffer;
  }

  const customizerResult = customizer(target);

  if (customizerResult !== void 0) {
    return customizerResult;
  }

  return null;
}

function copyValue(target) {
  const targetType = typeof target;

  // copy String, Number, Boolean, undefined and Symbol
  // without null and Function
  if (target !== null && targetType !== 'object' && targetType !== 'function') {
    return target;
  }

  return null;
}

export {
  copy,
  copyCollection,
  copyValue,
};
