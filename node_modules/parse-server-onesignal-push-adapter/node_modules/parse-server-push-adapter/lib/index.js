"use strict";
// ParsePushAdapter is the default implementation of
// PushAdapter, it uses GCM for android push and APNS
// for ios push.

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.GCM = exports.APNS = exports.ParsePushAdapter = undefined;

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

var _ParsePushAdapter = require('./ParsePushAdapter');

var _ParsePushAdapter2 = _interopRequireDefault(_ParsePushAdapter);

var _GCM = require('./GCM');

var _GCM2 = _interopRequireDefault(_GCM);

var _APNS = require('./APNS');

var _APNS2 = _interopRequireDefault(_APNS);

var _PushAdapterUtils = require('./PushAdapterUtils');

var utils = _interopRequireWildcard(_PushAdapterUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.VERBOSE || process.env.VERBOSE_PARSE_SERVER_PUSH_ADAPTER) {
  _npmlog2.default.level = 'verbose';
}exports.default = _ParsePushAdapter2.default;
exports.ParsePushAdapter = _ParsePushAdapter2.default;
exports.APNS = _APNS2.default;
exports.GCM = _GCM2.default;
exports.utils = utils;