'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParsePushAdapter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parse = require('parse');

var _parse2 = _interopRequireDefault(_parse);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

var _APNS = require('./APNS');

var _APNS2 = _interopRequireDefault(_APNS);

var _GCM = require('./GCM');

var _GCM2 = _interopRequireDefault(_GCM);

var _PushAdapterUtils = require('./PushAdapterUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LOG_PREFIX = 'parse-server-push-adapter';

var ParsePushAdapter = exports.ParsePushAdapter = function () {
  function ParsePushAdapter() {
    var pushConfig = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, ParsePushAdapter);

    this.supportsPushTracking = true;

    this.validPushTypes = ['ios', 'android'];
    this.senderMap = {};
    // used in PushController for Dashboard Features
    this.feature = {
      immediatePush: true
    };
    var pushTypes = Object.keys(pushConfig);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = pushTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var pushType = _step.value;

        if (this.validPushTypes.indexOf(pushType) < 0) {
          throw new _parse2.default.Error(_parse2.default.Error.PUSH_MISCONFIGURED, 'Push to ' + pushTypes + ' is not supported');
        }
        switch (pushType) {
          case 'ios':
            this.senderMap[pushType] = new _APNS2.default(pushConfig[pushType]);
            break;
          case 'android':
            this.senderMap[pushType] = new _GCM2.default(pushConfig[pushType]);
            break;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _createClass(ParsePushAdapter, [{
    key: 'getValidPushTypes',
    value: function getValidPushTypes() {
      return this.validPushTypes;
    }
  }, {
    key: 'send',
    value: function send(data, installations) {
      var _this = this;

      var deviceMap = (0, _PushAdapterUtils.classifyInstallations)(installations, this.validPushTypes);
      var sendPromises = [];

      var _loop = function _loop(pushType) {
        var sender = _this.senderMap[pushType];
        var devices = deviceMap[pushType];
        if (Array.isArray(devices) && devices.length > 0) {
          if (!sender) {
            _npmlog2.default.verbose(LOG_PREFIX, 'Can not find sender for push type ' + pushType + ', ' + data);
            var results = devices.map(function (device) {
              return Promise.resolve({
                device: device,
                transmitted: false,
                response: { 'error': 'Can not find sender for push type ' + pushType + ', ' + data }
              });
            });
            sendPromises.push(Promise.all(results));
          } else {
            sendPromises.push(sender.send(data, devices));
          }
        }
      };

      for (var pushType in deviceMap) {
        _loop(pushType);
      }
      return Promise.all(sendPromises).then(function (promises) {
        // flatten all
        return [].concat.apply([], promises);
      });
    }
  }], [{
    key: 'classifyInstallations',
    value: function classifyInstallations(installations, validTypes) {
      return (0, _PushAdapterUtils.classifyInstallations)(installations, validTypes);
    }
  }]);

  return ParsePushAdapter;
}();

exports.default = ParsePushAdapter;

module.exports = ParsePushAdapter;