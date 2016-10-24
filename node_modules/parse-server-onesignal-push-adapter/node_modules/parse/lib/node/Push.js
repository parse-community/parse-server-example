'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.send = send;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = _interopRequireDefault(_ParseQuery);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Contains functions to deal with Push in Parse.
 * @class Parse.Push
 * @static
 */

/**
 * Sends a push notification.
 * @method send
 * @param {Object} data -  The data of the push notification.  Valid fields
 * are:
 *   <ol>
 *     <li>channels - An Array of channels to push to.</li>
 *     <li>push_time - A Date object for when to send the push.</li>
 *     <li>expiration_time -  A Date object for when to expire
 *         the push.</li>
 *     <li>expiration_interval - The seconds from now to expire the push.</li>
 *     <li>where - A Parse.Query over Parse.Installation that is used to match
 *         a set of installations to push to.</li>
 *     <li>data - The data to send as part of the push</li>
 *   <ol>
 * @param {Object} options An object that has an optional success function,
 * that takes no arguments and will be called on a successful push, and
 * an error function that takes a Parse.Error and will be called if the push
 * failed.
 * @return {Parse.Promise} A promise that is fulfilled when the push request
 *     completes.
 */
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

function send(data, options) {
  options = options || {};

  if (data.where && data.where instanceof _ParseQuery2.default) {
    data.where = data.where.toJSON().where;
  }

  if (data.push_time && (0, _typeof3.default)(data.push_time) === 'object') {
    data.push_time = data.push_time.toJSON();
  }

  if (data.expiration_time && (0, _typeof3.default)(data.expiration_time) === 'object') {
    data.expiration_time = data.expiration_time.toJSON();
  }

  if (data.expiration_time && data.expiration_interval) {
    throw new Error('expiration_time and expiration_interval cannot both be set.');
  }

  return _CoreManager2.default.getPushController().send(data, {
    useMasterKey: options.useMasterKey
  })._thenRunCallbacks(options);
}

var DefaultController = {
  send: function (data, options) {
    var RESTController = _CoreManager2.default.getRESTController();

    var request = RESTController.request('POST', 'push', data, { useMasterKey: !!options.useMasterKey });

    return request._thenRunCallbacks(options);
  }
};

_CoreManager2.default.setPushController(DefaultController);