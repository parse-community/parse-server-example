/*! 3.14.5 / parse */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("crypto"), require("buffer"));
	else if(typeof define === 'function' && define.amd)
		define(["crypto", "buffer"], factory);
	else if(typeof exports === 'object')
		exports["PUBNUB"] = factory(require("crypto"), require("buffer"));
	else
		root["PUBNUB"] = factory(root["crypto"], root["buffer"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* globals 'Parse', Parse */
	/* eslint camelcase: 0 */

	/* ---------------------------------------------------------------------------
	 WAIT! - This file depends on instructions from the PUBNUB Cloud.
	 http://www.pubnub.com/account
	 --------------------------------------------------------------------------- */

	/* ---------------------------------------------------------------------------
	 PubNub Real-time Cloud-Hosted Push API and Push Notification Client Frameworks
	 Copyright (c) 2016 PubNub Inc.
	 http://www.pubnub.com/
	 http://www.pubnub.com/terms
	 --------------------------------------------------------------------------- */

	/* ---------------------------------------------------------------------------
	 Permission is hereby granted, free of charge, to any person obtaining a copy
	 of this software and associated documentation files (the 'Software'), to deal
	 in the Software without restriction, including without limitation the rights
	 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 copies of the Software, and to permit persons to whom the Software is
	 furnished to do so, subject to the following conditions:

	 The above copyright notice and this permission notice shall be included in
	 all copies or substantial portions of the Software.

	 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 THE SOFTWARE.
	 --------------------------------------------------------------------------- */

	var crypto = __webpack_require__(1);
	var Buffer = __webpack_require__(2).Buffer;
	var packageJSON = __webpack_require__(3);
	var pubNubCore = __webpack_require__(4);

	var PNSDK = 'PubNub-JS-' + 'Parse' + '/' + packageJSON.version;

	/**
	 * UTIL LOCALS
	 */
	function get_hmac_SHA256(data, key) {
	  return crypto.createHmac('sha256', new Buffer(key, 'utf8')).update(data).digest('base64');
	}

	/**
	 * ERROR
	 * ===
	 * error('message');
	 */
	function error(message) {
	  console.error(message); // eslint-disable-line no-console
	}

	/**
	 * Request
	 * =======
	 *  xdr({
	 *     url     : ['http://www.blah.com/url'],
	 *     success : function(response) {},
	 *     fail    : function() {}
	 *  });
	 */
	function xdr(setup) {
	  var success = setup.success || function () {};
	  var fail = setup.fail || function () {};
	  var mode = setup.mode || 'GET';
	  var data = setup.data || {};
	  var options = {};
	  var payload;
	  var origin;
	  var url;

	  data.pnsdk = PNSDK;

	  if (mode === 'POST') {
	    payload = decodeURIComponent(setup.url.pop());
	  }

	  url = pubNubCore.build_url(setup.url, data);
	  url = '/' + url.split('/').slice(3).join('/');

	  origin = setup.url[0].split('//')[1];

	  options.url = 'http://' + origin + url;
	  options.method = mode;
	  options.body = payload;

	  function invokeFail(message, payload) {
	    fail({
	      message: message,
	      payload: payload
	    });
	  }

	  Parse.Cloud.httpRequest(options)
	    .then(function (httpResponse) {
	      var result;

	      try {
	        result = JSON.parse(httpResponse.text);
	      } catch (e) {
	        invokeFail('Bad JSON response', httpResponse.text);
	        return;
	      }

	      success(result);
	    }, function (httpResponse) {
	      var response;

	      try {
	        response = JSON.parse(httpResponse.text);

	        if (typeof response === 'object' && 'error' in response && response.error === true) {
	          fail(response);
	        } else {
	          invokeFail('Network error', httpResponse.text);
	        }
	      } catch (e) {
	        invokeFail('Network error', httpResponse.text);
	      }
	    });
	}

	/**
	 * LOCAL STORAGE
	 */
	var db = (function () {
	  var store = {};

	  return {
	    get: function (key) {
	      return store[key];
	    },
	    set: function (key, value) {
	      store[key] = value;
	    }
	  };
	})();

	function crypto_obj() {
	  var iv = '0123456789012345';

	  function get_padded_key(key) {
	    return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
	  }

	  return {
	    encrypt: function (input, key) {
	      if (!key) return input;
	      var plain_text = JSON['stringify'](input);
	      var cipher = crypto.createCipheriv('aes-256-cbc', get_padded_key(key), iv);
	      var base_64_encrypted = cipher.update(plain_text, 'utf8', 'base64') + cipher.final('base64');
	      return base_64_encrypted || input;
	    },
	    decrypt: function (input, key) {
	      var decrypted;

	      if (!key) return input;
	      var decipher = crypto.createDecipheriv('aes-256-cbc', get_padded_key(key), iv);
	      try {
	        decrypted = decipher.update(input, 'base64', 'utf8') + decipher.final('utf8');
	      } catch (e) {
	        return null;
	      }
	      return JSON.parse(decrypted);
	    }
	  };
	}

	var CREATE_PUBNUB = function (setup) {
	  setup['xdr'] = xdr;
	  setup['db'] = db;
	  setup['error'] = setup['error'] || error;
	  setup['hmac_SHA256'] = get_hmac_SHA256;
	  setup['crypto_obj'] = crypto_obj();
	  setup['params'] = { pnsdk: PNSDK };

	  var SELF = function (setup) {
	    return CREATE_PUBNUB(setup);
	  };

	  var PN = pubNubCore.PN_API(setup);

	  for (var prop in PN) {
	    if (PN.hasOwnProperty(prop)) {
	      SELF[prop] = PN[prop];
	    }
	  }

	  SELF.init = SELF;
	  SELF.secure = SELF;

	  SELF.subscribe = function () {
	    throw Error('#subscribe() method is disabled in Parse.com environment');
	  };

	  SELF.ready();

	  return SELF;
	};

	CREATE_PUBNUB.init = CREATE_PUBNUB;
	CREATE_PUBNUB.unique = pubNubCore.unique;
	CREATE_PUBNUB.secure = CREATE_PUBNUB;

	module.exports = CREATE_PUBNUB;
	module.exports.PNmessage = pubNubCore.PNmessage;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
		"name": "pubnub",
		"preferGlobal": false,
		"version": "3.14.5",
		"author": "PubNub <support@pubnub.com>",
		"description": "Publish & Subscribe Real-time Messaging with PubNub",
		"contributors": [
			{
				"name": "Stephen Blum",
				"email": "stephen@pubnub.com"
			}
		],
		"bin": {},
		"scripts": {
			"test": "grunt test --force"
		},
		"main": "./node.js/pubnub.js",
		"browser": "./modern/dist/pubnub.js",
		"repository": {
			"type": "git",
			"url": "git://github.com/pubnub/javascript.git"
		},
		"keywords": [
			"cloud",
			"publish",
			"subscribe",
			"websockets",
			"comet",
			"bosh",
			"xmpp",
			"real-time",
			"messaging"
		],
		"dependencies": {
			"agentkeepalive": "~0.2",
			"lodash": "^4.1.0"
		},
		"noAnalyze": false,
		"devDependencies": {
			"chai": "^3.5.0",
			"eslint": "2.4.0",
			"eslint-config-airbnb": "^6.0.2",
			"eslint-plugin-flowtype": "^2.1.0",
			"eslint-plugin-mocha": "^2.0.0",
			"eslint-plugin-react": "^4.1.0",
			"flow-bin": "^0.22.0",
			"grunt": "^0.4.5",
			"grunt-contrib-clean": "^1.0.0",
			"grunt-contrib-copy": "^0.8.2",
			"grunt-contrib-uglify": "^0.11.1",
			"grunt-env": "^0.4.4",
			"grunt-eslint": "^18.0.0",
			"grunt-flow": "^1.0.3",
			"grunt-karma": "^0.12.1",
			"grunt-mocha-istanbul": "^3.0.1",
			"grunt-text-replace": "^0.4.0",
			"grunt-webpack": "^1.0.11",
			"imports-loader": "^0.6.5",
			"isparta": "^4.0.0",
			"json-loader": "^0.5.4",
			"karma": "^0.13.21",
			"karma-chai": "^0.1.0",
			"karma-mocha": "^0.2.1",
			"karma-phantomjs-launcher": "^1.0.0",
			"karma-spec-reporter": "0.0.24",
			"load-grunt-tasks": "^3.4.0",
			"mocha": "^2.4.5",
			"nock": "^1.1.0",
			"node-uuid": "^1.4.7",
			"nodeunit": "^0.9.0",
			"phantomjs-prebuilt": "^2.1.4",
			"proxyquire": "^1.7.4",
			"sinon": "^1.17.2",
			"uglify-js": "^2.6.1",
			"underscore": "^1.7.0",
			"webpack": "^1.12.13",
			"webpack-dev-server": "^1.14.1"
		},
		"bundleDependencies": [],
		"license": "MIT",
		"engine": {
			"node": ">=0.8"
		},
		"files": [
			"core",
			"node.js",
			"modern",
			"CHANGELOG",
			"FUTURE.md",
			"LICENSE",
			"README.md"
		]
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint camelcase: 0, no-use-before-define: 0, no-unused-expressions: 0  */
	/* eslint eqeqeq: 0, one-var: 0 */
	/* eslint no-redeclare: 0 */
	/* eslint guard-for-in: 0 */
	/* eslint block-scoped-var: 0 space-return-throw-case: 0, no-unused-vars: 0 */

	var packageJSON = __webpack_require__(3);
	var defaultConfiguration = __webpack_require__(5);
	var utils = __webpack_require__(6);

	var NOW = 1;
	var READY = false;
	var READY_BUFFER = [];
	var PRESENCE_SUFFIX = '-pnpres';
	var DEF_WINDOWING = 10; // MILLISECONDS.
	var DEF_TIMEOUT = 15000; // MILLISECONDS.
	var DEF_SUB_TIMEOUT = 310; // SECONDS.
	var DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).
	var SECOND = 1000; // A THOUSAND MILLISECONDS.
	var PRESENCE_HB_THRESHOLD = 5;
	var PRESENCE_HB_DEFAULT = 30;
	var SDK_VER = packageJSON.version;

	/**
	 * UTILITIES
	 */
	function unique() {
	  return 'x' + ++NOW + '' + (+new Date);
	}

	/**
	 * NEXTORIGIN
	 * ==========
	 * var next_origin = nextorigin();
	 */
	var nextorigin = (function () {
	  var max = 20;
	  var ori = Math.floor(Math.random() * max);
	  return function (origin, failover) {
	    return origin.indexOf('pubsub.') > 0
	      && origin.replace(
	        'pubsub', 'ps' + (
	          failover ? utils.generateUUID().split('-')[0] :
	            (++ori < max ? ori : ori = 1)
	        )) || origin;
	  };
	})();


	/**
	 * Generate Subscription Channel List
	 * ==================================
	 * generate_channel_list(channels_object);
	 */
	function generate_channel_list(channels, nopresence) {
	  var list = [];
	  utils.each(channels, function (channel, status) {
	    if (nopresence) {
	      if (channel.search('-pnpres') < 0) {
	        if (status.subscribed) list.push(channel);
	      }
	    } else {
	      if (status.subscribed) list.push(channel);
	    }
	  });
	  return list.sort();
	}

	/**
	 * Generate Subscription Channel Groups List
	 * ==================================
	 * generate_channel_group_list(channels_groups object);
	 */
	function generate_channel_group_list(channel_groups, nopresence) {
	  var list = [];
	  utils.each(channel_groups, function (channel_group, status) {
	    if (nopresence) {
	      if (channel_group.search('-pnpres') < 0) {
	        if (status.subscribed) list.push(channel_group);
	      }
	    } else {
	      if (status.subscribed) list.push(channel_group);
	    }
	  });
	  return list.sort();
	}

	// PUBNUB READY TO CONNECT
	function ready() {
	  if (READY) return;
	  READY = 1;
	  utils.each(READY_BUFFER, function (connect) {
	    connect();
	  });
	}

	function PNmessage(args) {
	  var msg = args || { apns: {} };

	  msg['getPubnubMessage'] = function () {
	    var m = {};

	    if (Object.keys(msg['apns']).length) {
	      m['pn_apns'] = {
	        aps: {
	          alert: msg['apns']['alert'],
	          badge: msg['apns']['badge']
	        }
	      };
	      for (var k in msg['apns']) {
	        m['pn_apns'][k] = msg['apns'][k];
	      }
	      var exclude1 = ['badge', 'alert'];
	      for (var k in exclude1) {
	        delete m['pn_apns'][exclude1[k]];
	      }
	    }

	    if (msg['gcm']) {
	      m['pn_gcm'] = {
	        data: msg['gcm']
	      };
	    }

	    for (var k in msg) {
	      m[k] = msg[k];
	    }
	    var exclude = ['apns', 'gcm', 'publish', 'channel', 'callback', 'error'];
	    for (var k in exclude) {
	      delete m[exclude[k]];
	    }

	    return m;
	  };
	  msg['publish'] = function () {
	    var m = msg.getPubnubMessage();

	    if (msg['pubnub'] && msg['channel']) {
	      msg['pubnub'].publish({
	        message: m,
	        channel: msg['channel'],
	        callback: msg['callback'],
	        error: msg['error']
	      });
	    }
	  };
	  return msg;
	}

	function PN_API(setup) {
	  var SUB_WINDOWING = +setup['windowing'] || DEF_WINDOWING;
	  var SUB_TIMEOUT = (+setup['timeout'] || DEF_SUB_TIMEOUT) * SECOND;
	  var KEEPALIVE = (+setup['keepalive'] || DEF_KEEPALIVE) * SECOND;
	  var TIME_CHECK = setup['timecheck'] || 0;
	  var NOLEAVE = setup['noleave'] || 0;
	  var PUBLISH_KEY = setup['publish_key'];
	  var SUBSCRIBE_KEY = setup['subscribe_key'];
	  var AUTH_KEY = setup['auth_key'] || '';
	  var SECRET_KEY = setup['secret_key'] || '';
	  var hmac_SHA256 = setup['hmac_SHA256'];
	  var SSL = setup['ssl'] ? 's' : '';
	  var ORIGIN = 'http' + SSL + '://' + (setup['origin'] || 'pubsub.pubnub.com');
	  var STD_ORIGIN = nextorigin(ORIGIN);
	  var SUB_ORIGIN = nextorigin(ORIGIN);
	  var CONNECT = function () {
	  };
	  var PUB_QUEUE = [];
	  var CLOAK = true;
	  var TIME_DRIFT = 0;
	  var SUB_CALLBACK = 0;
	  var SUB_CHANNEL = 0;
	  var SUB_RECEIVER = 0;
	  var SUB_RESTORE = setup['restore'] || 0;
	  var SUB_BUFF_WAIT = 0;
	  var TIMETOKEN = 0;
	  var RESUMED = false;
	  var CHANNELS = {};
	  var CHANNEL_GROUPS = {};
	  var SUB_ERROR = function () {
	  };
	  var STATE = {};
	  var PRESENCE_HB_TIMEOUT = null;
	  var PRESENCE_HB = validate_presence_heartbeat(
	    setup['heartbeat'] || setup['pnexpires'] || 0, setup['error']
	  );
	  var PRESENCE_HB_INTERVAL = setup['heartbeat_interval'] || (PRESENCE_HB / 2) - 1;
	  var PRESENCE_HB_RUNNING = false;
	  var NO_WAIT_FOR_PENDING = setup['no_wait_for_pending'];
	  var COMPATIBLE_35 = setup['compatible_3.5'] || false;
	  var xdr = setup['xdr'];
	  var params = setup['params'] || {};
	  var error = setup['error'] || function () {};
	  var _is_online = setup['_is_online'] || function () { return 1;};
	  var jsonp_cb = setup['jsonp_cb'] || function () { return 0; };
	  var db = setup['db'] || { get: function () {}, set: function () {} };
	  var CIPHER_KEY = setup['cipher_key'];
	  var UUID = setup['uuid'] || (!setup['unique_uuid'] && db && db['get'](SUBSCRIBE_KEY + 'uuid') || '');
	  var USE_INSTANCEID = setup['instance_id'] || false;
	  var INSTANCEID = '';
	  var shutdown = setup['shutdown'];
	  var use_send_beacon = (typeof setup['use_send_beacon'] != 'undefined') ? setup['use_send_beacon'] : true;
	  var sendBeacon = (use_send_beacon) ? setup['sendBeacon'] : null;
	  var _poll_timer;
	  var _poll_timer2;

	  if (PRESENCE_HB === 2) PRESENCE_HB_INTERVAL = 1;

	  var crypto_obj = setup['crypto_obj'] || {
	    encrypt: function (a, key) {
	      return a;
	    },
	    decrypt: function (b, key) {
	      return b;
	    }
	  };

	  function _get_url_params(data) {
	    if (!data) data = {};
	    utils.each(params, function (key, value) {
	      if (!(key in data)) data[key] = value;
	    });
	    return data;
	  }

	  function _object_to_key_list(o) {
	    var l = [];
	    utils.each(o, function (key, value) {
	      l.push(key);
	    });
	    return l;
	  }

	  function _object_to_key_list_sorted(o) {
	    return _object_to_key_list(o).sort();
	  }

	  function _get_pam_sign_input_from_params(params) {
	    var si = '';
	    var l = _object_to_key_list_sorted(params);

	    for (var i in l) {
	      var k = l[i];
	      si += k + '=' + utils.pamEncode(params[k]);
	      if (i != l.length - 1) si += '&';
	    }
	    return si;
	  }

	  function validate_presence_heartbeat(heartbeat, cur_heartbeat, error) {
	    var err = false;

	    if (typeof heartbeat === 'undefined') {
	      return cur_heartbeat;
	    }

	    if (typeof heartbeat === 'number') {
	      if (heartbeat > PRESENCE_HB_THRESHOLD || heartbeat == 0) {
	        err = false;
	      } else {
	        err = true;
	      }
	    } else if (typeof heartbeat === 'boolean') {
	      if (!heartbeat) {
	        return 0;
	      } else {
	        return PRESENCE_HB_DEFAULT;
	      }
	    } else {
	      err = true;
	    }

	    if (err) {
	      error && error('Presence Heartbeat value invalid. Valid range ( x > ' + PRESENCE_HB_THRESHOLD + ' or x = 0). Current Value : ' + (cur_heartbeat || PRESENCE_HB_THRESHOLD));
	      return cur_heartbeat || PRESENCE_HB_THRESHOLD;
	    } else return heartbeat;
	  }

	  function encrypt(input, key) {
	    return crypto_obj['encrypt'](input, key || CIPHER_KEY) || input;
	  }

	  function decrypt(input, key) {
	    return crypto_obj['decrypt'](input, key || CIPHER_KEY) ||
	      crypto_obj['decrypt'](input, CIPHER_KEY) ||
	      input;
	  }

	  function error_common(message, callback) {
	    callback && callback({ error: message || 'error occurred' });
	    error && error(message);
	  }

	  function _presence_heartbeat() {
	    clearTimeout(PRESENCE_HB_TIMEOUT);

	    if (!PRESENCE_HB_INTERVAL || PRESENCE_HB_INTERVAL >= 500 ||
	      PRESENCE_HB_INTERVAL < 1 ||
	      (!generate_channel_list(CHANNELS, true).length && !generate_channel_group_list(CHANNEL_GROUPS, true).length)) {
	      PRESENCE_HB_RUNNING = false;
	      return;
	    }

	    PRESENCE_HB_RUNNING = true;
	    SELF['presence_heartbeat']({
	      callback: function (r) {
	        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, (PRESENCE_HB_INTERVAL) * SECOND);
	      },
	      error: function (e) {
	        error && error('Presence Heartbeat unable to reach Pubnub servers.' + JSON.stringify(e));
	        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, (PRESENCE_HB_INTERVAL) * SECOND);
	      }
	    });
	  }

	  function start_presence_heartbeat() {
	    !PRESENCE_HB_RUNNING && _presence_heartbeat();
	  }

	  function publish(next) {
	    if (NO_WAIT_FOR_PENDING) {
	      if (!PUB_QUEUE.length) return;
	    } else {
	      if (next) PUB_QUEUE.sending = 0;
	      if (PUB_QUEUE.sending || !PUB_QUEUE.length) return;
	      PUB_QUEUE.sending = 1;
	    }

	    xdr(PUB_QUEUE.shift());
	  }

	  function each_channel_group(callback) {
	    var count = 0;

	    utils.each(generate_channel_group_list(CHANNEL_GROUPS), function (channel_group) {
	      var chang = CHANNEL_GROUPS[channel_group];

	      if (!chang) return;

	      count++;
	      (callback || function () {
	      })(chang);
	    });

	    return count;
	  }

	  function each_channel(callback) {
	    var count = 0;

	    utils.each(generate_channel_list(CHANNELS), function (channel) {
	      var chan = CHANNELS[channel];

	      if (!chan) return;

	      count++;
	      (callback || function () {
	      })(chan);
	    });

	    return count;
	  }

	  function _invoke_callback(response, callback, err) {
	    if (typeof response == 'object') {
	      if (response['error']) {
	        var callback_data = {};

	        if (response['message']) {
	          callback_data['message'] = response['message'];
	        }

	        if (response['payload']) {
	          callback_data['payload'] = response['payload'];
	        }

	        err && err(callback_data);
	        return;
	      }
	      if (response['payload']) {
	        if (response['next_page']) {
	          callback && callback(response['payload'], response['next_page']);
	        } else {
	          callback && callback(response['payload']);
	        }
	        return;
	      }
	    }
	    callback && callback(response);
	  }

	  function _invoke_error(response, err) {
	    if (typeof response == 'object' && response['error']) {
	      var callback_data = {};

	      if (response['message']) {
	        callback_data['message'] = response['message'];
	      }

	      if (response['payload']) {
	        callback_data['payload'] = response['payload'];
	      }

	      err && err(callback_data);
	      return;
	    } else {
	      err && err(response);
	    }
	  }

	  function CR(args, callback, url1, data) {
	    var callback = args['callback'] || callback;
	    var err = args['error'] || error;
	    var jsonp = jsonp_cb();

	    data = data || {};

	    if (!data['auth']) {
	      data['auth'] = args['auth_key'] || AUTH_KEY;
	    }

	    var url = [
	      STD_ORIGIN, 'v1', 'channel-registration',
	      'sub-key', SUBSCRIBE_KEY
	    ];

	    url.push.apply(url, url1);

	    if (jsonp) data['callback'] = jsonp;

	    xdr({
	      callback: jsonp,
	      data: _get_url_params(data),
	      success: function (response) {
	        _invoke_callback(response, callback, err);
	      },
	      fail: function (response) {
	        _invoke_error(response, err);
	      },
	      url: url
	    });
	  }

	  // Announce Leave Event
	  var SELF = {
	    LEAVE: function (channel, blocking, auth_key, callback, error) {
	      var data = { uuid: UUID, auth: auth_key || AUTH_KEY };
	      var origin = nextorigin(ORIGIN);
	      var callback = callback || function () {};
	      var err = error || function () {};
	      var url;
	      var params;
	      var jsonp = jsonp_cb();

	      // Prevent Leaving a Presence Channel
	      if (channel.indexOf(PRESENCE_SUFFIX) > 0) return true;


	      if (COMPATIBLE_35) {
	        if (!SSL) return false;
	        if (jsonp == '0') return false;
	      }

	      if (NOLEAVE) return false;

	      if (jsonp != '0') data['callback'] = jsonp;

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      url = [
	        origin, 'v2', 'presence', 'sub_key',
	        SUBSCRIBE_KEY, 'channel', utils.encode(channel), 'leave'
	      ];

	      params = _get_url_params(data);


	      if (sendBeacon) {
	        var url_string = utils.buildURL(url, params);
	        if (sendBeacon(url_string)) {
	          callback && callback({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
	          return true;
	        }
	      }


	      xdr({
	        blocking: blocking || SSL,
	        callback: jsonp,
	        data: params,
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: url
	      });
	      return true;
	    },

	    LEAVE_GROUP: function (channel_group, blocking, auth_key, callback, error) {
	      var data = { uuid: UUID, auth: auth_key || AUTH_KEY };
	      var origin = nextorigin(ORIGIN);
	      var url;
	      var params;
	      var callback = callback || function () {};
	      var err = error || function () {};
	      var jsonp = jsonp_cb();

	      // Prevent Leaving a Presence Channel Group
	      if (channel_group.indexOf(PRESENCE_SUFFIX) > 0) return true;

	      if (COMPATIBLE_35) {
	        if (!SSL) return false;
	        if (jsonp == '0') return false;
	      }

	      if (NOLEAVE) return false;

	      if (jsonp != '0') data['callback'] = jsonp;

	      if (channel_group && channel_group.length > 0) data['channel-group'] = channel_group;

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      url = [
	        origin, 'v2', 'presence', 'sub_key',
	        SUBSCRIBE_KEY, 'channel', utils.encode(','), 'leave'
	      ];

	      params = _get_url_params(data);

	      if (sendBeacon) {
	        var url_string = utils.buildURL(url, params);
	        if (sendBeacon(url_string)) {
	          callback && callback({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
	          return true;
	        }
	      }

	      xdr({
	        blocking: blocking || SSL,
	        callback: jsonp,
	        data: params,
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: url
	      });
	      return true;
	    },

	    set_resumed: function (resumed) {
	      RESUMED = resumed;
	    },

	    get_cipher_key: function () {
	      return CIPHER_KEY;
	    },

	    set_cipher_key: function (key) {
	      CIPHER_KEY = key;
	    },

	    raw_encrypt: function (input, key) {
	      return encrypt(input, key);
	    },

	    raw_decrypt: function (input, key) {
	      return decrypt(input, key);
	    },

	    get_heartbeat: function () {
	      return PRESENCE_HB;
	    },

	    set_heartbeat: function (heartbeat, heartbeat_interval) {
	      PRESENCE_HB = validate_presence_heartbeat(heartbeat, PRESENCE_HB, error);
	      PRESENCE_HB_INTERVAL = heartbeat_interval || (PRESENCE_HB / 2) - 1;
	      if (PRESENCE_HB == 2) {
	        PRESENCE_HB_INTERVAL = 1;
	      }
	      CONNECT();
	      _presence_heartbeat();
	    },

	    get_heartbeat_interval: function () {
	      return PRESENCE_HB_INTERVAL;
	    },

	    set_heartbeat_interval: function (heartbeat_interval) {
	      PRESENCE_HB_INTERVAL = heartbeat_interval;
	      _presence_heartbeat();
	    },

	    get_version: function () {
	      return SDK_VER;
	    },

	    getGcmMessageObject: function (obj) {
	      return {
	        data: obj
	      };
	    },

	    getApnsMessageObject: function (obj) {
	      var x = {
	        aps: { badge: 1, alert: '' }
	      };
	      for (var k in obj) {
	        k[x] = obj[k];
	      }
	      return x;
	    },

	    _add_param: function (key, val) {
	      params[key] = val;
	    },

	    channel_group: function (args, callback) {
	      var ns_ch = args['channel_group'];
	      var callback = callback || args['callback'];
	      var channels = args['channels'] || args['channel'];
	      var cloak = args['cloak'];
	      var namespace;
	      var channel_group;
	      var url = [];
	      var data = {};
	      var mode = args['mode'] || 'add';


	      if (ns_ch) {
	        var ns_ch_a = ns_ch.split(':');

	        if (ns_ch_a.length > 1) {
	          namespace = (ns_ch_a[0] === '*') ? null : ns_ch_a[0];

	          channel_group = ns_ch_a[1];
	        } else {
	          channel_group = ns_ch_a[0];
	        }
	      }

	      namespace && url.push('namespace') && url.push(utils.encode(namespace));

	      url.push('channel-group');

	      if (channel_group && channel_group !== '*') {
	        url.push(channel_group);
	      }

	      if (channels) {
	        if (utils.isArray(channels)) {
	          channels = channels.join(',');
	        }
	        data[mode] = channels;
	        data['cloak'] = (CLOAK) ? 'true' : 'false';
	      } else {
	        if (mode === 'remove') url.push('remove');
	      }

	      if (typeof cloak != 'undefined') data['cloak'] = (cloak) ? 'true' : 'false';

	      CR(args, callback, url, data);
	    },

	    channel_group_list_groups: function (args, callback) {
	      var namespace;

	      namespace = args['namespace'] || args['ns'] || args['channel_group'] || null;
	      if (namespace) {
	        args['channel_group'] = namespace + ':*';
	      }

	      SELF['channel_group'](args, callback);
	    },

	    channel_group_list_channels: function (args, callback) {
	      if (!args['channel_group']) return error('Missing Channel Group');
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_remove_channel: function (args, callback) {
	      if (!args['channel_group']) return error('Missing Channel Group');
	      if (!args['channel'] && !args['channels']) return error('Missing Channel');

	      args['mode'] = 'remove';
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_remove_group: function (args, callback) {
	      if (!args['channel_group']) return error('Missing Channel Group');
	      if (args['channel']) return error('Use channel_group_remove_channel if you want to remove a channel from a group.');

	      args['mode'] = 'remove';
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_add_channel: function (args, callback) {
	      if (!args['channel_group']) return error('Missing Channel Group');
	      if (!args['channel'] && !args['channels']) return error('Missing Channel');
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_cloak: function (args, callback) {
	      if (typeof args['cloak'] == 'undefined') {
	        callback(CLOAK);
	        return;
	      }
	      CLOAK = args['cloak'];
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_list_namespaces: function (args, callback) {
	      var url = ['namespace'];
	      CR(args, callback, url);
	    },

	    channel_group_remove_namespace: function (args, callback) {
	      var url = ['namespace', args['namespace'], 'remove'];
	      CR(args, callback, url);
	    },

	    /*
	     PUBNUB.history({
	     channel  : 'my_chat_channel',
	     limit    : 100,
	     callback : function(history) { }
	     });
	     */
	    history: function (args, callback) {
	      var callback = args['callback'] || callback;
	      var count = args['count'] || args['limit'] || 100;
	      var reverse = args['reverse'] || 'false';
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var cipher_key = args['cipher_key'];
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var start = args['start'];
	      var end = args['end'];
	      var include_token = args['include_token'];
	      var string_msg_token = args['string_message_token'] || false;
	      var params = {};
	      var jsonp = jsonp_cb();

	      // Make sure we have a Channel
	      if (!channel && !channel_group) return error('Missing Channel');
	      if (!callback) return error('Missing Callback');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      params['stringtoken'] = 'true';
	      params['count'] = count;
	      params['reverse'] = reverse;
	      params['auth'] = auth_key;

	      if (channel_group) {
	        params['channel-group'] = channel_group;
	        if (!channel) {
	          channel = ',';
	        }
	      }
	      if (jsonp) params['callback'] = jsonp;
	      if (start) params['start'] = start;
	      if (end) params['end'] = end;
	      if (include_token) params['include_token'] = 'true';
	      if (string_msg_token) params['string_message_token'] = 'true';

	      // Send Message
	      xdr({
	        callback: jsonp,
	        data: _get_url_params(params),
	        success: function (response) {
	          if (typeof response == 'object' && response['error']) {
	            err({ message: response['message'], payload: response['payload'] });
	            return;
	          }
	          var messages = response[0];
	          var decrypted_messages = [];
	          for (var a = 0; a < messages.length; a++) {
	            if (include_token) {
	              var new_message = decrypt(messages[a]['message'], cipher_key);
	              var timetoken = messages[a]['timetoken'];
	              try {
	                decrypted_messages['push']({ message: JSON['parse'](new_message), timetoken: timetoken });
	              } catch (e) {
	                decrypted_messages['push'](({ message: new_message, timetoken: timetoken }));
	              }
	            } else {
	              var new_message = decrypt(messages[a], cipher_key);
	              try {
	                decrypted_messages['push'](JSON['parse'](new_message));
	              } catch (e) {
	                decrypted_messages['push']((new_message));
	              }
	            }
	          }
	          callback([decrypted_messages, response[1], response[2]]);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: [
	          STD_ORIGIN, 'v2', 'history', 'sub-key',
	          SUBSCRIBE_KEY, 'channel', utils.encode(channel)
	        ]
	      });
	    },

	    /*
	     PUBNUB.replay({
	     source      : 'my_channel',
	     destination : 'new_channel'
	     });
	     */
	    replay: function (args, callback) {
	      var callback = callback || args['callback'] || function () {};
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var source = args['source'];
	      var destination = args['destination'];
	      var err = args['error'] || args['error'] || function () {};
	      var stop = args['stop'];
	      var start = args['start'];
	      var end = args['end'];
	      var reverse = args['reverse'];
	      var limit = args['limit'];
	      var jsonp = jsonp_cb();
	      var data = {};
	      var url;

	      // Check User Input
	      if (!source) return error('Missing Source Channel');
	      if (!destination) return error('Missing Destination Channel');
	      if (!PUBLISH_KEY) return error('Missing Publish Key');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      // Setup URL Params
	      if (jsonp != '0') data['callback'] = jsonp;
	      if (stop) data['stop'] = 'all';
	      if (reverse) data['reverse'] = 'true';
	      if (start) data['start'] = start;
	      if (end) data['end'] = end;
	      if (limit) data['count'] = limit;

	      data['auth'] = auth_key;

	      // Compose URL Parts
	      url = [
	        STD_ORIGIN, 'v1', 'replay',
	        PUBLISH_KEY, SUBSCRIBE_KEY,
	        source, destination
	      ];

	      // Start (or Stop) Replay!
	      xdr({
	        callback: jsonp,
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function () {
	          callback([0, 'Disconnected']);
	        },
	        url: url,
	        data: _get_url_params(data)
	      });
	    },

	    /*
	     PUBNUB.auth('AJFLKAJSDKLA');
	     */
	    auth: function (auth) {
	      AUTH_KEY = auth;
	      CONNECT();
	    },

	    /*
	     PUBNUB.time(function(time){ });
	     */
	    time: function (callback) {
	      var jsonp = jsonp_cb();

	      var data = { uuid: UUID, auth: AUTH_KEY };

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        url: [STD_ORIGIN, 'time', jsonp],
	        success: function (response) {
	          callback(response[0]);
	        },
	        fail: function () {
	          callback(0);
	        }
	      });
	    },

	    /*
	     PUBNUB.publish({
	     channel : 'my_chat_channel',
	     message : 'hello!'
	     });
	     */
	    publish: function (args, callback) {
	      var msg = args['message'];
	      if (!msg) return error('Missing Message');

	      var callback = callback || args['callback'] || msg['callback'] || args['success'] || function () {};
	      var channel = args['channel'] || msg['channel'];
	      var meta = args['meta'] || args['metadata'];
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var cipher_key = args['cipher_key'];
	      var err = args['error'] || msg['error'] || function () {};
	      var post = args['post'] || false;
	      var store = ('store_in_history' in args) ? args['store_in_history'] : true;
	      var jsonp = jsonp_cb();
	      var add_msg = 'push';
	      var params;
	      var url;

	      if (args['prepend']) add_msg = 'unshift';

	      if (!channel) return error('Missing Channel');
	      if (!PUBLISH_KEY) return error('Missing Publish Key');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      if (msg['getPubnubMessage']) {
	        msg = msg['getPubnubMessage']();
	      }

	      // If trying to send Object
	      msg = JSON['stringify'](encrypt(msg, cipher_key));

	      // Create URL
	      url = [
	        STD_ORIGIN, 'publish',
	        PUBLISH_KEY, SUBSCRIBE_KEY,
	        0, utils.encode(channel),
	        jsonp, utils.encode(msg)
	      ];

	      params = { uuid: UUID, auth: auth_key };

	      if (meta && typeof meta === 'object') {
	        params['meta'] = JSON.stringify(meta);
	      }

	      if (!store) params['store'] = '0';

	      if (USE_INSTANCEID) params['instanceid'] = INSTANCEID;

	      // Queue Message Send
	      PUB_QUEUE[add_msg]({
	        callback: jsonp,
	        url: url,
	        data: _get_url_params(params),
	        fail: function (response) {
	          _invoke_error(response, err);
	          publish(1);
	        },
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	          publish(1);
	        },
	        mode: (post) ? 'POST' : 'GET'
	      });

	      // Send Message
	      publish();
	    },

	    /*
	     PUBNUB.unsubscribe({ channel : 'my_chat' });
	     */
	    unsubscribe: function (args, callback) {
	      var channelArg = args['channel'];
	      var channelGroupArg = args['channel_group'];
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var callback = callback || args['callback'] || function () {};
	      var err = args['error'] || function () {};

	      TIMETOKEN = 0;
	      SUB_RESTORE = 1;   // REVISIT !!!!

	      if (!channelArg && !channelGroupArg) return error('Missing Channel or Channel Group');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      if (channelArg) {
	        var channels = utils.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
	        var existingChannels = [];
	        var presenceChannels = [];

	        utils.each(channels, function (channel) {
	          if (CHANNELS[channel]) existingChannels.push(channel);
	        });

	        // if we do not have any channels to unsubscribe from, trigger a callback.
	        if (existingChannels.length == 0) {
	          callback({ action: 'leave' });
	          return;
	        }

	        // Prepare presence channels
	        utils.each(existingChannels, function (channel) {
	          presenceChannels.push(channel + PRESENCE_SUFFIX);
	        });

	        utils.each(existingChannels.concat(presenceChannels), function (channel) {
	          if (channel in CHANNELS) CHANNELS[channel] = 0;
	          if (channel in STATE) delete STATE[channel];
	        });

	        var CB_CALLED = true;
	        if (READY) {
	          CB_CALLED = SELF['LEAVE'](existingChannels.join(','), 0, auth_key, callback, err);
	        }
	        if (!CB_CALLED) callback({ action: 'leave' });
	      }

	      if (channelGroupArg) {
	        var channelGroups = utils.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
	        var existingChannelGroups = [];
	        var presenceChannelGroups = [];

	        utils.each(channelGroups, function (channelGroup) {
	          if (CHANNEL_GROUPS[channelGroup]) existingChannelGroups.push(channelGroup);
	        });

	        // if we do not have any channel groups to unsubscribe from, trigger a callback.
	        if (existingChannelGroups.length == 0) {
	          callback({ action: 'leave' });
	          return;
	        }

	        // Prepare presence channels
	        utils.each(existingChannelGroups, function (channelGroup) {
	          presenceChannelGroups.push(channelGroup + PRESENCE_SUFFIX);
	        });

	        utils.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
	          if (channelGroup in CHANNEL_GROUPS) CHANNEL_GROUPS[channelGroup] = 0;
	          if (channelGroup in STATE) delete STATE[channelGroup];
	        });

	        var CB_CALLED = true;
	        if (READY) {
	          CB_CALLED = SELF['LEAVE_GROUP'](existingChannelGroups.join(','), 0, auth_key, callback, err);
	        }
	        if (!CB_CALLED) callback({ action: 'leave' });
	      }

	      // Reset Connection if Count Less
	      CONNECT();
	    },

	    /*
	     PUBNUB.subscribe({
	     channel  : 'my_chat'
	     callback : function(message) { }
	     });
	     */
	    subscribe: function (args, callback) {
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var callback = callback || args['callback'];
	      var callback = callback || args['message'];
	      var connect = args['connect'] || function () {};
	      var reconnect = args['reconnect'] || function () {};
	      var disconnect = args['disconnect'] || function () {};
	      var SUB_ERROR = args['error'] || SUB_ERROR || function () {};
	      var idlecb = args['idle'] || function () {};
	      var presence = args['presence'] || 0;
	      var noheresync = args['noheresync'] || 0;
	      var backfill = args['backfill'] || 0;
	      var timetoken = args['timetoken'] || 0;
	      var sub_timeout = args['timeout'] || SUB_TIMEOUT;
	      var windowing = args['windowing'] || SUB_WINDOWING;
	      var state = args['state'];
	      var heartbeat = args['heartbeat'] || args['pnexpires'];
	      var heartbeat_interval = args['heartbeat_interval'];
	      var restore = args['restore'] || SUB_RESTORE;

	      AUTH_KEY = args['auth_key'] || AUTH_KEY;

	      // Restore Enabled?
	      SUB_RESTORE = restore;

	      // Always Reset the TT
	      TIMETOKEN = timetoken;

	      // Make sure we have a Channel
	      if (!channel && !channel_group) {
	        return error('Missing Channel');
	      }

	      if (!callback) return error('Missing Callback');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      if (heartbeat || heartbeat === 0 || heartbeat_interval || heartbeat_interval === 0) {
	        SELF['set_heartbeat'](heartbeat, heartbeat_interval);
	      }

	      // Setup Channel(s)
	      if (channel) {
	        utils.each((channel.join ? channel.join(',') : '' + channel).split(','),
	          function (channel) {
	            var settings = CHANNELS[channel] || {};

	            // Store Channel State
	            CHANNELS[SUB_CHANNEL = channel] = {
	              name: channel,
	              connected: settings.connected,
	              disconnected: settings.disconnected,
	              subscribed: 1,
	              callback: SUB_CALLBACK = callback,
	              cipher_key: args['cipher_key'],
	              connect: connect,
	              disconnect: disconnect,
	              reconnect: reconnect
	            };

	            if (state) {
	              if (channel in state) {
	                STATE[channel] = state[channel];
	              } else {
	                STATE[channel] = state;
	              }
	            }

	            // Presence Enabled?
	            if (!presence) return;

	            // Subscribe Presence Channel
	            SELF['subscribe']({
	              channel: channel + PRESENCE_SUFFIX,
	              callback: presence,
	              restore: restore
	            });

	            // Presence Subscribed?
	            if (settings.subscribed) return;

	            // See Who's Here Now?
	            if (noheresync) return;
	            SELF['here_now']({
	              channel: channel,
	              data: _get_url_params({ uuid: UUID, auth: AUTH_KEY }),
	              callback: function (here) {
	                utils.each('uuids' in here ? here['uuids'] : [], function (uid) {
	                  presence({
	                    action: 'join',
	                    uuid: uid,
	                    timestamp: Math.floor(utils.rnow() / 1000),
	                    occupancy: here['occupancy'] || 1
	                  }, here, channel);
	                });
	              }
	            });
	          });
	      }

	      // Setup Channel Groups
	      if (channel_group) {
	        utils.each((channel_group.join ? channel_group.join(',') : '' + channel_group).split(','),
	          function (channel_group) {
	            var settings = CHANNEL_GROUPS[channel_group] || {};

	            CHANNEL_GROUPS[channel_group] = {
	              name: channel_group,
	              connected: settings.connected,
	              disconnected: settings.disconnected,
	              subscribed: 1,
	              callback: SUB_CALLBACK = callback,
	              cipher_key: args['cipher_key'],
	              connect: connect,
	              disconnect: disconnect,
	              reconnect: reconnect
	            };

	            // Presence Enabled?
	            if (!presence) return;

	            // Subscribe Presence Channel
	            SELF['subscribe']({
	              channel_group: channel_group + PRESENCE_SUFFIX,
	              callback: presence,
	              restore: restore,
	              auth_key: AUTH_KEY
	            });

	            // Presence Subscribed?
	            if (settings.subscribed) return;

	            // See Who's Here Now?
	            if (noheresync) return;
	            SELF['here_now']({
	              channel_group: channel_group,
	              data: _get_url_params({ uuid: UUID, auth: AUTH_KEY }),
	              callback: function (here) {
	                utils.each('uuids' in here ? here['uuids'] : [], function (uid) {
	                  presence({
	                    action: 'join',
	                    uuid: uid,
	                    timestamp: Math.floor(utils.rnow() / 1000),
	                    occupancy: here['occupancy'] || 1
	                  }, here, channel_group);
	                });
	              }
	            });
	          });
	      }


	      // Test Network Connection
	      function _test_connection(success) {
	        if (success) {
	          // Begin Next Socket Connection
	          utils.timeout(CONNECT, windowing);
	        } else {
	          // New Origin on Failed Connection
	          STD_ORIGIN = nextorigin(ORIGIN, 1);
	          SUB_ORIGIN = nextorigin(ORIGIN, 1);

	          // Re-test Connection
	          utils.timeout(function () {
	            SELF['time'](_test_connection);
	          }, SECOND);
	        }

	        // Disconnect & Reconnect
	        each_channel(function (channel) {
	          // Reconnect
	          if (success && channel.disconnected) {
	            channel.disconnected = 0;
	            return channel.reconnect(channel.name);
	          }

	          // Disconnect
	          if (!success && !channel.disconnected) {
	            channel.disconnected = 1;
	            channel.disconnect(channel.name);
	          }
	        });

	        // Disconnect & Reconnect for channel groups
	        each_channel_group(function (channel_group) {
	          // Reconnect
	          if (success && channel_group.disconnected) {
	            channel_group.disconnected = 0;
	            return channel_group.reconnect(channel_group.name);
	          }

	          // Disconnect
	          if (!success && !channel_group.disconnected) {
	            channel_group.disconnected = 1;
	            channel_group.disconnect(channel_group.name);
	          }
	        });
	      }

	      // Evented Subscribe
	      function _connect() {
	        var jsonp = jsonp_cb();
	        var channels = generate_channel_list(CHANNELS).join(',');
	        var channel_groups = generate_channel_group_list(CHANNEL_GROUPS).join(',');

	        // Stop Connection
	        if (!channels && !channel_groups) return;

	        if (!channels) channels = ',';

	        // Connect to PubNub Subscribe Servers
	        _reset_offline();

	        var data = _get_url_params({ uuid: UUID, auth: AUTH_KEY });

	        if (channel_groups) {
	          data['channel-group'] = channel_groups;
	        }


	        var st = JSON.stringify(STATE);
	        if (st.length > 2) data['state'] = JSON.stringify(STATE);

	        if (PRESENCE_HB) data['heartbeat'] = PRESENCE_HB;

	        if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	        start_presence_heartbeat();
	        SUB_RECEIVER = xdr({
	          timeout: sub_timeout,
	          callback: jsonp,
	          fail: function (response) {
	            if (response && response['error'] && response['service']) {
	              _invoke_error(response, SUB_ERROR);
	              _test_connection(false);
	            } else {
	              SELF['time'](function (success) {
	                !success && (_invoke_error(response, SUB_ERROR));
	                _test_connection(success);
	              });
	            }
	          },
	          data: _get_url_params(data),
	          url: [
	            SUB_ORIGIN, 'subscribe',
	            SUBSCRIBE_KEY, utils.encode(channels),
	            jsonp, TIMETOKEN
	          ],
	          success: function (messages) {
	            // Check for Errors
	            if (!messages || (typeof messages == 'object' && 'error' in messages && messages['error'])) {
	              SUB_ERROR(messages);
	              return utils.timeout(CONNECT, SECOND);
	            }

	            // User Idle Callback
	            idlecb(messages[1]);

	            // Restore Previous Connection Point if Needed
	            TIMETOKEN = !TIMETOKEN && SUB_RESTORE && db['get'](SUBSCRIBE_KEY) || messages[1];

	            /*
	             // Connect
	             each_channel_registry(function(registry){
	             if (registry.connected) return;
	             registry.connected = 1;
	             registry.connect(channel.name);
	             });
	             */

	            // Connect
	            each_channel(function (channel) {
	              if (channel.connected) return;
	              channel.connected = 1;
	              channel.connect(channel.name);
	            });

	            // Connect for channel groups
	            each_channel_group(function (channel_group) {
	              if (channel_group.connected) return;
	              channel_group.connected = 1;
	              channel_group.connect(channel_group.name);
	            });

	            if (RESUMED && !SUB_RESTORE) {
	              TIMETOKEN = 0;
	              RESUMED = false;
	              // Update Saved Timetoken
	              db['set'](SUBSCRIBE_KEY, 0);
	              utils.timeout(_connect, windowing);
	              return;
	            }

	            // Invoke Memory Catchup and Receive Up to 100
	            // Previous Messages from the Queue.
	            if (backfill) {
	              TIMETOKEN = 10000;
	              backfill = 0;
	            }

	            // Update Saved Timetoken
	            db['set'](SUBSCRIBE_KEY, messages[1]);

	            // Route Channel <---> Callback for Message
	            var next_callback = (function () {
	              var channels = '';
	              var channels2 = '';

	              if (messages.length > 3) {
	                channels = messages[3];
	                channels2 = messages[2];
	              } else if (messages.length > 2) {
	                channels = messages[2];
	              } else {
	                channels = utils.map(
	                  generate_channel_list(CHANNELS), function (chan) {
	                    return utils.map(
	                      Array(messages[0].length)
	                        .join(',').split(','),
	                      function () {
	                        return chan;
	                      }
	                    );
	                  }).join(',');
	              }

	              var list = channels.split(',');
	              var list2 = (channels2) ? channels2.split(',') : [];

	              return function () {
	                var channel = list.shift() || SUB_CHANNEL;
	                var channel2 = list2.shift();

	                var chobj = {};

	                if (channel2) {
	                  if (channel && channel.indexOf('-pnpres') >= 0
	                    && channel2.indexOf('-pnpres') < 0) {
	                    channel2 += '-pnpres';
	                  }
	                  chobj = CHANNEL_GROUPS[channel2] || CHANNELS[channel2] || { callback: function () {} };
	                } else {
	                  chobj = CHANNELS[channel];
	                }

	                var r = [
	                  chobj
	                    .callback || SUB_CALLBACK,
	                  channel.split(PRESENCE_SUFFIX)[0]
	                ];
	                channel2 && r.push(channel2.split(PRESENCE_SUFFIX)[0]);
	                return r;
	              };
	            })();

	            var latency = detect_latency(+messages[1]);
	            utils.each(messages[0], function (msg) {
	              var next = next_callback();
	              var decrypted_msg = decrypt(msg,
	                (CHANNELS[next[1]]) ? CHANNELS[next[1]]['cipher_key'] : null);
	              next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
	            });

	            utils.timeout(_connect, windowing);
	          }
	        });
	      }

	      CONNECT = function () {
	        _reset_offline();
	        utils.timeout(_connect, windowing);
	      };

	      // Reduce Status Flicker
	      if (!READY) return READY_BUFFER.push(CONNECT);

	      // Connect Now
	      CONNECT();
	    },

	    /*
	     PUBNUB.here_now({ channel : 'my_chat', callback : fun });
	     */
	    here_now: function (args, callback) {
	      var callback = args['callback'] || callback;
	      var debug = args['debug'];
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var jsonp = jsonp_cb();
	      var uuids = ('uuids' in args) ? args['uuids'] : true;
	      var state = args['state'];
	      var data = { uuid: UUID, auth: auth_key };

	      if (!uuids) data['disable_uuids'] = 1;
	      if (state) data['state'] = 1;

	      // Make sure we have a Channel
	      if (!callback) return error('Missing Callback');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      var url = [
	        STD_ORIGIN, 'v2', 'presence',
	        'sub_key', SUBSCRIBE_KEY
	      ];

	      channel && url.push('channel') && url.push(utils.encode(channel));

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (channel_group) {
	        data['channel-group'] = channel_group;
	        !channel && url.push('channel') && url.push(',');
	      }

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        debug: debug,
	        url: url
	      });
	    },

	    /*
	     PUBNUB.current_channels_by_uuid({ channel : 'my_chat', callback : fun });
	     */
	    where_now: function (args, callback) {
	      var callback = args['callback'] || callback;
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var jsonp = jsonp_cb();
	      var uuid = args['uuid'] || UUID;
	      var data = { auth: auth_key };

	      // Make sure we have a Channel
	      if (!callback) return error('Missing Callback');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: [
	          STD_ORIGIN, 'v2', 'presence',
	          'sub_key', SUBSCRIBE_KEY,
	          'uuid', utils.encode(uuid)
	        ]
	      });
	    },

	    state: function (args, callback) {
	      var callback = args['callback'] || callback || function (r) {};
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var jsonp = jsonp_cb();
	      var state = args['state'];
	      var uuid = args['uuid'] || UUID;
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var url;
	      var data = _get_url_params({ auth: auth_key });

	      // Make sure we have a Channel
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
	      if (!uuid) return error('Missing UUID');
	      if (!channel && !channel_group) return error('Missing Channel');

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (typeof channel != 'undefined'
	        && CHANNELS[channel] && CHANNELS[channel].subscribed) {
	        if (state) STATE[channel] = state;
	      }

	      if (typeof channel_group != 'undefined'
	        && CHANNEL_GROUPS[channel_group]
	        && CHANNEL_GROUPS[channel_group].subscribed
	      ) {
	        if (state) STATE[channel_group] = state;
	        data['channel-group'] = channel_group;

	        if (!channel) {
	          channel = ',';
	        }
	      }

	      data['state'] = JSON.stringify(state);

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      if (state) {
	        url = [
	          STD_ORIGIN, 'v2', 'presence',
	          'sub-key', SUBSCRIBE_KEY,
	          'channel', channel,
	          'uuid', uuid, 'data'
	        ];
	      } else {
	        url = [
	          STD_ORIGIN, 'v2', 'presence',
	          'sub-key', SUBSCRIBE_KEY,
	          'channel', channel,
	          'uuid', utils.encode(uuid)
	        ];
	      }

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: url

	      });
	    },

	    /*
	     PUBNUB.grant({
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     ttl      : 24 * 60, // Minutes
	     read     : true,
	     write    : true,
	     auth_key : '3y8uiajdklytowsj'
	     });
	     */
	    grant: function (args, callback) {
	      var callback = args['callback'] || callback;
	      var err = args['error'] || function () {};
	      var channel = args['channel'] || args['channels'];
	      var channel_group = args['channel_group'];
	      var jsonp = jsonp_cb();
	      var ttl = args['ttl'];
	      var r = (args['read']) ? '1' : '0';
	      var w = (args['write']) ? '1' : '0';
	      var m = (args['manage']) ? '1' : '0';
	      var auth_key = args['auth_key'] || args['auth_keys'];

	      if (!callback) return error('Missing Callback');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
	      if (!PUBLISH_KEY) return error('Missing Publish Key');
	      if (!SECRET_KEY) return error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = SUBSCRIBE_KEY + '\n' + PUBLISH_KEY + '\n' + 'grant' + '\n';

	      var data = { w: w, r: r, timestamp: timestamp };

	      if (args['manage']) {
	        data['m'] = m;
	      }
	      if (utils.isArray(channel)) {
	        channel = channel['join'](',');
	      }
	      if (utils.isArray(auth_key)) {
	        auth_key = auth_key['join'](',');
	      }
	      if (typeof channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
	      if (typeof channel_group != 'undefined' && channel_group != null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }
	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }
	      if (ttl || ttl === 0) data['ttl'] = ttl;

	      if (auth_key) data['auth'] = auth_key;

	      data = _get_url_params(data);

	      if (!auth_key) delete data['auth'];

	      sign_input += _get_pam_sign_input_from_params(data);

	      var signature = hmac_SHA256(sign_input, SECRET_KEY);

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data['signature'] = signature;

	      xdr({
	        callback: jsonp,
	        data: data,
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: [
	          STD_ORIGIN, 'v1', 'auth', 'grant',
	          'sub-key', SUBSCRIBE_KEY
	        ]
	      });
	    },

	    /*
	     PUBNUB.mobile_gw_provision ({
	     device_id: 'A655FBA9931AB',
	     op       : 'add' | 'remove',
	     gw_type  : 'apns' | 'gcm',
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     });
	     */

	    mobile_gw_provision: function (args) {
	      var callback = args['callback'] || function () {};
	      var auth_key = args['auth_key'] || AUTH_KEY;
	      var err = args['error'] || function () {};
	      var jsonp = jsonp_cb();
	      var channel = args['channel'];
	      var op = args['op'];
	      var gw_type = args['gw_type'];
	      var device_id = args['device_id'];
	      var params;
	      var url;

	      if (!device_id) return error('Missing Device ID (device_id)');
	      if (!gw_type) return error('Missing GW Type (gw_type: gcm or apns)');
	      if (!op) return error('Missing GW Operation (op: add or remove)');
	      if (!channel) return error('Missing gw destination Channel (channel)');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

	      // Create URL
	      url = [
	        STD_ORIGIN, 'v1/push/sub-key',
	        SUBSCRIBE_KEY, 'devices', device_id
	      ];

	      params = { uuid: UUID, auth: auth_key, type: gw_type };

	      if (op == 'add') {
	        params['add'] = channel;
	      } else if (op == 'remove') {
	        params['remove'] = channel;
	      }

	      if (USE_INSTANCEID) params['instanceid'] = INSTANCEID;

	      xdr({
	        callback: jsonp,
	        data: params,
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: url
	      });
	    },

	    /*
	     PUBNUB.audit({
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     read     : true,
	     write    : true,
	     auth_key : '3y8uiajdklytowsj'
	     });
	     */
	    audit: function (args, callback) {
	      var callback = args['callback'] || callback;
	      var err = args['error'] || function () {};
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var auth_key = args['auth_key'];
	      var jsonp = jsonp_cb();

	      // Make sure we have a Channel
	      if (!callback) return error('Missing Callback');
	      if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
	      if (!PUBLISH_KEY) return error('Missing Publish Key');
	      if (!SECRET_KEY) return error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = SUBSCRIBE_KEY + '\n' + PUBLISH_KEY + '\n' + 'audit' + '\n';

	      var data = { timestamp: timestamp };
	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }
	      if (typeof channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
	      if (typeof channel_group != 'undefined' && channel_group != null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }
	      if (auth_key) data['auth'] = auth_key;

	      data = _get_url_params(data);

	      if (!auth_key) delete data['auth'];

	      sign_input += _get_pam_sign_input_from_params(data);

	      var signature = hmac_SHA256(sign_input, SECRET_KEY);

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data['signature'] = signature;
	      xdr({
	        callback: jsonp,
	        data: data,
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        },
	        url: [
	          STD_ORIGIN, 'v1', 'auth', 'audit',
	          'sub-key', SUBSCRIBE_KEY
	        ]
	      });
	    },

	    /*
	     PUBNUB.revoke({
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     auth_key : '3y8uiajdklytowsj'
	     });
	     */
	    revoke: function (args, callback) {
	      args['read'] = false;
	      args['write'] = false;
	      SELF['grant'](args, callback);
	    },

	    set_uuid: function (uuid) {
	      UUID = uuid;
	      CONNECT();
	    },

	    get_uuid: function () {
	      return UUID;
	    },

	    isArray: function (arg) {
	      return utils.isArray(arg);
	    },

	    get_subscribed_channels: function () {
	      return generate_channel_list(CHANNELS, true);
	    },

	    presence_heartbeat: function (args) {
	      var callback = args['callback'] || function () {};
	      var err = args['error'] || function () {};
	      var jsonp = jsonp_cb();
	      var data = { uuid: UUID, auth: AUTH_KEY };

	      var st = JSON['stringify'](STATE);
	      if (st.length > 2) data['state'] = JSON['stringify'](STATE);

	      if (PRESENCE_HB > 0 && PRESENCE_HB < 320) data['heartbeat'] = PRESENCE_HB;

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      var channels = utils.encode(generate_channel_list(CHANNELS, true)['join'](','));
	      var channel_groups = generate_channel_group_list(CHANNEL_GROUPS, true)['join'](',');

	      if (!channels) channels = ',';
	      if (channel_groups) data['channel-group'] = channel_groups;

	      if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        url: [
	          STD_ORIGIN, 'v2', 'presence',
	          'sub-key', SUBSCRIBE_KEY,
	          'channel', channels,
	          'heartbeat'
	        ],
	        success: function (response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function (response) {
	          _invoke_error(response, err);
	        }
	      });
	    },

	    stop_timers: function () {
	      clearTimeout(_poll_timer);
	      clearTimeout(_poll_timer2);
	      clearTimeout(PRESENCE_HB_TIMEOUT);
	    },

	    shutdown: function () {
	      SELF['stop_timers']();
	      shutdown && shutdown();
	    },

	    // Expose PUBNUB Functions
	    xdr: xdr,
	    ready: ready,
	    db: db,
	    uuid: utils.generateUUID,
	    map: utils.map,
	    each: utils.each,
	    'each-channel': each_channel,
	    grep: utils.grep,
	    offline: function () {
	      _reset_offline(1, { message: 'Offline. Please check your network settings.' });
	    },
	    supplant: utils.supplant,
	    now: utils.rnow,
	    unique: unique,
	    updater: utils.updater
	  };

	  function _poll_online() {
	    _is_online() || _reset_offline(1, { error: 'Offline. Please check your network settings.' });
	    _poll_timer && clearTimeout(_poll_timer);
	    _poll_timer = utils.timeout(_poll_online, SECOND);
	  }

	  function _poll_online2() {
	    if (!TIME_CHECK) return;
	    SELF['time'](function (success) {
	      detect_time_detla(function () {
	      }, success);
	      success || _reset_offline(1, {
	        error: 'Heartbeat failed to connect to Pubnub Servers.' +
	        'Please check your network settings.'
	      });
	      _poll_timer2 && clearTimeout(_poll_timer2);
	      _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
	    });
	  }

	  function _reset_offline(err, msg) {
	    SUB_RECEIVER && SUB_RECEIVER(err, msg);
	    SUB_RECEIVER = null;

	    clearTimeout(_poll_timer);
	    clearTimeout(_poll_timer2);
	  }

	  if (!UUID) UUID = SELF['uuid']();
	  if (!INSTANCEID) INSTANCEID = SELF['uuid']();
	  db['set'](SUBSCRIBE_KEY + 'uuid', UUID);

	  _poll_timer = utils.timeout(_poll_online, SECOND);
	  _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
	  PRESENCE_HB_TIMEOUT = utils.timeout(
	    start_presence_heartbeat,
	    (PRESENCE_HB_INTERVAL - 3) * SECOND
	  );

	  // Detect Age of Message
	  function detect_latency(tt) {
	    var adjusted_time = utils.rnow() - TIME_DRIFT;
	    return adjusted_time - tt / 10000;
	  }

	  detect_time_detla();
	  function detect_time_detla(cb, time) {
	    var stime = utils.rnow();

	    time && calculate(time) || SELF['time'](calculate);

	    function calculate(time) {
	      if (!time) return;
	      var ptime = time / 10000;
	      var latency = (utils.rnow() - stime) / 2;
	      TIME_DRIFT = utils.rnow() - (ptime + latency);
	      cb && cb(TIME_DRIFT);
	    }
	  }

	  return SELF;
	}

	module.exports = {
	  PN_API: PN_API,
	  unique: unique,
	  PNmessage: PNmessage,
	  DEF_TIMEOUT: DEF_TIMEOUT,
	  timeout: utils.timeout,
	  build_url: utils.buildURL,
	  each: utils.each,
	  uuid: utils.generateUUID,
	  URLBIT: defaultConfiguration.URLBIT,
	  grep: utils.grep,
	  supplant: utils.supplant,
	  now: utils.rnow,
	  updater: utils.updater,
	  map: utils.map
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		"PARAMSBIT": "&",
		"URLBIT": "/"
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

	var defaultConfiguration = __webpack_require__(5);
	var REPL = /{([\w\-]+)}/g;

	function rnow() {
	  return +new Date;
	}

	function isArray(arg) {
	  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === 'number');
	  // return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
	}

	/**
	 * EACH
	 * ====
	 * each( [1,2,3], function(item) { } )
	 */
	function each(o, f) {
	  if (!o || !f) {
	    return;
	  }

	  if (isArray(o)) {
	    for (var i = 0, l = o.length; i < l;) {
	      f.call(o[i], o[i], i++);
	    }
	  } else {
	    for (var i in o) {
	      o.hasOwnProperty &&
	      o.hasOwnProperty(i) &&
	      f.call(o[i], i, o[i]);
	    }
	  }
	}

	/**
	 * ENCODE
	 * ======
	 * var encoded_data = encode('path');
	 */
	function encode(path) { return encodeURIComponent(path); }

	/**
	 * Build Url
	 * =======
	 *
	 */
	function buildURL(urlComponents, urlParams) {
	  var url = urlComponents.join(defaultConfiguration.URLBIT);
	  var params = [];

	  if (!urlParams) return url;

	  each(urlParams, function (key, value) {
	    var valueStr = (typeof value === 'object') ? JSON['stringify'](value) : value;
	    (typeof value !== 'undefined' &&
	      value !== null && encode(valueStr).length > 0
	    ) && params.push(key + '=' + encode(valueStr));
	  });

	  url += '?' + params.join(defaultConfiguration.PARAMSBIT);
	  return url;
	}

	/**
	 * UPDATER
	 * =======
	 * var timestamp = unique();
	 */
	function updater(fun, rate) {
	  var timeout;
	  var last = 0;
	  var runnit = function () {
	    if (last + rate > rnow()) {
	      clearTimeout(timeout);
	      timeout = setTimeout(runnit, rate);
	    } else {
	      last = rnow();
	      fun();
	    }
	  };

	  return runnit;
	}

	/**
	 * GREP
	 * ====
	 * var list = grep( [1,2,3], function(item) { return item % 2 } )
	 */
	function grep(list, fun) {
	  var fin = [];
	  each(list || [], function (l) {
	    fun(l) && fin.push(l);
	  });
	  return fin;
	}

	/**
	 * SUPPLANT
	 * ========
	 * var text = supplant( 'Hello {name}!', { name : 'John' } )
	 */
	function supplant(str, values) {
	  return str.replace(REPL, function (_, match) {
	    return values[match] || _;
	  });
	}

	/**
	 * timeout
	 * =======
	 * timeout( function(){}, 100 );
	 */
	function timeout(fun, wait) {
	  if (typeof setTimeout === 'undefined') {
	    return;
	  }

	  return setTimeout(fun, wait);
	}

	/**
	 * uuid
	 * ====
	 * var my_uuid = generateUUID();
	 */
	function generateUUID(callback) {
	  var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
	    function (c) {
	      var r = Math.random() * 16 | 0;
	      var v = c === 'x' ? r : (r & 0x3 | 0x8);
	      return v.toString(16);
	    });
	  if (callback) callback(u);
	  return u;
	}

	/**
	 * MAP
	 * ===
	 * var list = map( [1,2,3], function(item) { return item + 1 } )
	 */
	function map(list, fun) {
	  var fin = [];
	  each(list || [], function (k, v) {
	    fin.push(fun(k, v));
	  });
	  return fin;
	}


	function pamEncode(str) {
	  return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	  });
	}


	module.exports = {
	  buildURL: buildURL,
	  encode: encode,
	  each: each,
	  updater: updater,
	  rnow: rnow,
	  isArray: isArray,
	  map: map,
	  pamEncode: pamEncode,
	  generateUUID: generateUUID,
	  timeout: timeout,
	  supplant: supplant,
	  grep: grep
	};


/***/ }
/******/ ])
});
;