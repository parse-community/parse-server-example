'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Installation = function (_ParseObject) {
  (0, _inherits3.default)(Installation, _ParseObject);

  function Installation(attributes) {
    (0, _classCallCheck3.default)(this, Installation);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Installation.__proto__ || (0, _getPrototypeOf2.default)(Installation)).call(this, '_Installation'));

    if (attributes && (typeof attributes === 'undefined' ? 'undefined' : (0, _typeof3.default)(attributes)) === 'object') {
      if (!_this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
    return _this;
  }

  return Installation;
}(_ParseObject3.default); /**
                           * Copyright (c) 2015-present, Parse, LLC.
                           * All rights reserved.
                           *
                           * This source code is licensed under the BSD-style license found in the
                           * LICENSE file in the root directory of this source tree. An additional grant
                           * of patent rights can be found in the PATENTS file in the same directory.
                           *
                           * 
                           */

exports.default = Installation;

_ParseObject3.default.registerSubclass('_Installation', Installation);