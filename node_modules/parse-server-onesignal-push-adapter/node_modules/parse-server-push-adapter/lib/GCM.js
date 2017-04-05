"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _parse = require('parse');

var _parse2 = _interopRequireDefault(_parse);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

var _nodeGcm = require('node-gcm');

var _nodeGcm2 = _interopRequireDefault(_nodeGcm);

var _PushAdapterUtils = require('./PushAdapterUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LOG_PREFIX = 'parse-server-push-adapter GCM';
var GCMTimeToLiveMax = 4 * 7 * 24 * 60 * 60; // GCM allows a max of 4 weeks
var GCMRegistrationTokensMax = 1000;

function GCM(args) {
  if ((typeof args === 'undefined' ? 'undefined' : _typeof(args)) !== 'object' || !args.apiKey) {
    throw new _parse2.default.Error(_parse2.default.Error.PUSH_MISCONFIGURED, 'GCM Configuration is invalid');
  }
  this.sender = new _nodeGcm2.default.Sender(args.apiKey);
}

/**
 * Send gcm request.
 * @param {Object} data The data we need to send, the format is the same with api request body
 * @param {Array} devices A array of devices
 * @returns {Object} A promise which is resolved after we get results from gcm
 */
GCM.prototype.send = function (data, devices) {
  var _this = this;

  var pushId = (0, _PushAdapterUtils.randomString)(10);
  // Make a new array
  devices = new (Function.prototype.bind.apply(Array, [null].concat(_toConsumableArray(devices))))();
  var timestamp = Date.now();
  // For android, we can only have 1000 recepients per send, so we need to slice devices to
  // chunk if necessary
  var slices = sliceDevices(devices, GCMRegistrationTokensMax);
  if (slices.length > 1) {
    _npmlog2.default.verbose(LOG_PREFIX, 'the number of devices exceeds ' + GCMRegistrationTokensMax);
    // Make 1 send per slice
    var _promises = slices.reduce(function (memo, slice) {
      var promise = _this.send(data, slice, timestamp);
      memo.push(promise);
      return memo;
    }, []);
    return _parse2.default.Promise.when(_promises).then(function (results) {
      var allResults = results.reduce(function (memo, result) {
        return memo.concat(result);
      }, []);
      return _parse2.default.Promise.as(allResults);
    });
  }
  // get the devices back...
  devices = slices[0];

  var expirationTime = void 0;
  // We handle the expiration_time convertion in push.js, so expiration_time is a valid date
  // in Unix epoch time in milliseconds here
  if (data['expiration_time']) {
    expirationTime = data['expiration_time'];
  }
  // Generate gcm payload
  // PushId is not a formal field of GCM, but Parse Android SDK uses this field to deduplicate push notifications
  var gcmPayload = generateGCMPayload(data.data, pushId, timestamp, expirationTime);
  // Make and send gcm request
  var message = new _nodeGcm2.default.Message(gcmPayload);

  // Build a device map
  var devicesMap = devices.reduce(function (memo, device) {
    memo[device.deviceToken] = device;
    return memo;
  }, {});

  var deviceTokens = Object.keys(devicesMap);

  var promises = deviceTokens.map(function () {
    return new _parse2.default.Promise();
  });
  var registrationTokens = deviceTokens;
  var length = registrationTokens.length;
  _npmlog2.default.verbose(LOG_PREFIX, 'sending to ' + length + ' ' + (length > 1 ? 'devices' : 'device'));
  this.sender.send(message, { registrationTokens: registrationTokens }, 5, function (error, response) {
    // example response:
    /*
    {  "multicast_id":7680139367771848000,
      "success":0,
      "failure":4,
      "canonical_ids":0,
      "results":[ {"error":"InvalidRegistration"},
        {"error":"InvalidRegistration"},
        {"error":"InvalidRegistration"},
        {"error":"InvalidRegistration"}] }
    */
    if (error) {
      _npmlog2.default.error(LOG_PREFIX, 'send errored: %s', JSON.stringify(error, null, 4));
    } else {
      _npmlog2.default.verbose(LOG_PREFIX, 'GCM Response: %s', JSON.stringify(response, null, 4));
    }

    var _ref = response || {};

    var results = _ref.results;
    var multicast_id = _ref.multicast_id;

    registrationTokens.forEach(function (token, index) {
      var promise = promises[index];
      var result = results ? results[index] : undefined;
      var device = devicesMap[token];
      device.deviceType = 'android';
      var resolution = {
        device: device,
        multicast_id: multicast_id,
        response: error || result
      };
      if (!result || result.error) {
        resolution.transmitted = false;
      } else {
        resolution.transmitted = true;
      }
      promise.resolve(resolution);
    });
  });
  return _parse2.default.Promise.when(promises);
};

/**
 * Generate the gcm payload from the data we get from api request.
 * @param {Object} coreData The data field under api request body
 * @param {String} pushId A random string
 * @param {Number} timeStamp A number whose format is the Unix Epoch
 * @param {Number|undefined} expirationTime A number whose format is the Unix Epoch or undefined
 * @returns {Object} A promise which is resolved after we get results from gcm
 */
function generateGCMPayload(coreData, pushId, timeStamp, expirationTime) {
  var payloadData = {
    'time': new Date(timeStamp).toISOString(),
    'push_id': pushId,
    'data': JSON.stringify(coreData)
  };
  var payload = {
    priority: 'normal',
    data: payloadData
  };
  if (expirationTime) {
    // The timeStamp and expiration is in milliseconds but gcm requires second
    var timeToLive = Math.floor((expirationTime - timeStamp) / 1000);
    if (timeToLive < 0) {
      timeToLive = 0;
    }
    if (timeToLive >= GCMTimeToLiveMax) {
      timeToLive = GCMTimeToLiveMax;
    }
    payload.timeToLive = timeToLive;
  }
  return payload;
}

/**
 * Slice a list of devices to several list of devices with fixed chunk size.
 * @param {Array} devices An array of devices
 * @param {Number} chunkSize The size of the a chunk
 * @returns {Array} An array which contaisn several arries of devices with fixed chunk size
 */
function sliceDevices(devices, chunkSize) {
  var chunkDevices = [];
  while (devices.length > 0) {
    chunkDevices.push(devices.splice(0, chunkSize));
  }
  return chunkDevices;
}

GCM.generateGCMPayload = generateGCMPayload;

if (process.env.TESTING) {
  GCM.sliceDevices = sliceDevices;
}

module.exports = GCM;
exports.default = GCM;