'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _escape2 = require('./escape');

var _escape3 = _interopRequireDefault(_escape2);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _Storage = require('./Storage');

var _Storage2 = _interopRequireDefault(_Storage);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Parse.Config is a local representation of configuration data that
 * can be set from the Parse dashboard.
 *
 * @class Parse.Config
 * @constructor
 */

var ParseConfig = function () {
  function ParseConfig() {
    (0, _classCallCheck3.default)(this, ParseConfig);

    this.attributes = {};
    this._escapedAttributes = {};
  }

  /**
   * Gets the value of an attribute.
   * @method get
   * @param {String} attr The name of an attribute.
   */

  (0, _createClass3.default)(ParseConfig, [{
    key: 'get',
    value: function (attr) {
      return this.attributes[attr];
    }

    /**
     * Gets the HTML-escaped value of an attribute.
     * @method escape
     * @param {String} attr The name of an attribute.
     */

  }, {
    key: 'escape',
    value: function (attr) {
      var html = this._escapedAttributes[attr];
      if (html) {
        return html;
      }
      var val = this.attributes[attr];
      var escaped = '';
      if (val != null) {
        escaped = (0, _escape3.default)(val.toString());
      }
      this._escapedAttributes[attr] = escaped;
      return escaped;
    }

    /**
     * Retrieves the most recently-fetched configuration object, either from
     * memory or from local storage if necessary.
     *
     * @method current
     * @static
     * @return {Config} The most recently-fetched Parse.Config if it
     *     exists, else an empty Parse.Config.
     */

  }], [{
    key: 'current',
    value: function () {
      var controller = _CoreManager2.default.getConfigController();
      return controller.current();
    }

    /**
     * Gets a new configuration object from the server.
     * @method get
     * @static
     * @param {Object} options A Backbone-style options object.
     * Valid options are:<ul>
     *   <li>success: Function to call when the get completes successfully.
     *   <li>error: Function to call when the get fails.
     * </ul>
     * @return {Parse.Promise} A promise that is resolved with a newly-created
     *     configuration object when the get completes.
     */

  }, {
    key: 'get',
    value: function (options) {
      options = options || {};

      var controller = _CoreManager2.default.getConfigController();
      return controller.get()._thenRunCallbacks(options);
    }
  }]);
  return ParseConfig;
}(); /**
      * Copyright (c) 2015-present, Parse, LLC.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      */

exports.default = ParseConfig;

var currentConfig = null;

var CURRENT_CONFIG_KEY = 'currentConfig';

function decodePayload(data) {
  try {
    var json = JSON.parse(data);
    if (json && (typeof json === 'undefined' ? 'undefined' : (0, _typeof3.default)(json)) === 'object') {
      return (0, _decode2.default)(json);
    }
  } catch (e) {
    return null;
  }
}

var DefaultController = {
  current: function () {
    if (currentConfig) {
      return currentConfig;
    }

    var config = new ParseConfig();
    var storagePath = _Storage2.default.generatePath(CURRENT_CONFIG_KEY);
    var configData;
    if (!_Storage2.default.async()) {
      configData = _Storage2.default.getItem(storagePath);

      if (configData) {
        var attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    }
    // Return a promise for async storage controllers
    return _Storage2.default.getItemAsync(storagePath).then(function (configData) {
      if (configData) {
        var attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    });
  },
  get: function () {
    var RESTController = _CoreManager2.default.getRESTController();

    return RESTController.request('GET', 'config', {}, {}).then(function (response) {
      if (!response || !response.params) {
        var error = new _ParseError2.default(_ParseError2.default.INVALID_JSON, 'Config JSON response invalid.');
        return _ParsePromise2.default.error(error);
      }

      var config = new ParseConfig();
      config.attributes = {};
      for (var attr in response.params) {
        config.attributes[attr] = (0, _decode2.default)(response.params[attr]);
      }
      currentConfig = config;
      return _Storage2.default.setItemAsync(_Storage2.default.generatePath(CURRENT_CONFIG_KEY), (0, _stringify2.default)(response.params)).then(function () {
        return config;
      });
    });
  }
};

_CoreManager2.default.setConfigController(DefaultController);