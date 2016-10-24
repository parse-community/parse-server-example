'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _EventEmitter2 = require('./EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Creates a new LiveQuery Subscription.
 * Extends events.EventEmitter
 * <a href="https://nodejs.org/api/events.html#events_class_eventemitter">cloud functions</a>.
 * 
 * @constructor
 * @param {string} id - subscription id
 * @param {string} query - query to subscribe to
 * @param {string} sessionToken - optional session token
 *
 * <p>Open Event - When you call query.subscribe(), we send a subscribe request to 
 * the LiveQuery server, when we get the confirmation from the LiveQuery server,
 * this event will be emitted. When the client loses WebSocket connection to the
 * LiveQuery server, we will try to auto reconnect the LiveQuery server. If we
 * reconnect the LiveQuery server and successfully resubscribe the ParseQuery,
 * you'll also get this event.
 * 
 * <pre>
 * subscription.on('open', () => {
 * 
 * });</pre></p>
 *
 * <p>Create Event - When a new ParseObject is created and it fulfills the ParseQuery you subscribe,
 * you'll get this event. The object is the ParseObject which is created.
 * 
 * <pre>
 * subscription.on('create', (object) => {
 * 
 * });</pre></p>
 *
 * <p>Update Event - When an existing ParseObject which fulfills the ParseQuery you subscribe 
 * is updated (The ParseObject fulfills the ParseQuery before and after changes),
 * you'll get this event. The object is the ParseObject which is updated.
 * Its content is the latest value of the ParseObject.
 * 
 * <pre>
 * subscription.on('update', (object) => {
 * 
 * });</pre></p>
 * 
 * <p>Enter Event - When an existing ParseObject's old value doesn't fulfill the ParseQuery
 * but its new value fulfills the ParseQuery, you'll get this event. The object is the
 * ParseObject which enters the ParseQuery. Its content is the latest value of the ParseObject.
 * 
 * <pre>
 * subscription.on('enter', (object) => {
 * 
 * });</pre></p>
 *
 *
 * <p>Update Event - When an existing ParseObject's old value fulfills the ParseQuery but its new value
 * doesn't fulfill the ParseQuery, you'll get this event. The object is the ParseObject
 * which leaves the ParseQuery. Its content is the latest value of the ParseObject.
 * 
 * <pre>
 * subscription.on('leave', (object) => {
 * 
 * });</pre></p>
 *
 *
 * <p>Delete Event - When an existing ParseObject which fulfills the ParseQuery is deleted, you'll
 * get this event. The object is the ParseObject which is deleted.
 * 
 * <pre>
 * subscription.on('delete', (object) => {
 * 
 * });</pre></p>
 *
 *
 * <p>Close Event - When the client loses the WebSocket connection to the LiveQuery
 * server and we stop receiving events, you'll get this event.
 * 
 * <pre>
 * subscription.on('close', () => {
 * 
 * });</pre></p>
 *
 * 
 */
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var Subscription = function (_EventEmitter) {
  (0, _inherits3.default)(Subscription, _EventEmitter);

  function Subscription(id, query, sessionToken) {
    (0, _classCallCheck3.default)(this, Subscription);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (Subscription.__proto__ || (0, _getPrototypeOf2.default)(Subscription)).call(this));

    _this2.id = id;
    _this2.query = query;
    _this2.sessionToken = sessionToken;
    return _this2;
  }

  /**
   * @method unsubscribe
   */

  (0, _createClass3.default)(Subscription, [{
    key: 'unsubscribe',
    value: function () {
      var _this3 = this;

      var _this = this;
      _CoreManager2.default.getLiveQueryController().getDefaultLiveQueryClient().then(function (liveQueryClient) {
        liveQueryClient.unsubscribe(_this);
        _this.emit('close');
        _this3.resolve();
      });
    }
  }]);
  return Subscription;
}(_EventEmitter3.default);

exports.default = Subscription;