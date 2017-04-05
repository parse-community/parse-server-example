'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = escape;
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var encoded = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '/': '&#x2F;',
  '\'': '&#x27;',
  '"': '&quot;'
};

function escape(str) {
  return str.replace(/[&<>\/'"]/g, function (char) {
    return encoded[char];
  });
}