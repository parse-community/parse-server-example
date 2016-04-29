/**
 * PushBots API client.
 * @package PushBots 
 * @author: Amr Sobhy
 */
/**
 * Dependencies
 */
var request = require('request'),
    merge = require('merge');
var extend = function(target) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        for (var key in source) {
            if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    });
};

function checkToken(token) {
    var token = token.replace(/ /g, '');
    if (token.length == 64) {
        if (token.indexOf("-") || token.indexOf("_") == -1) {
            platform = 0;
        } else {
            platform = 1;
        }
    } else {
        platform = 1;
    }
    return platform;
}
/**
 * Constructor
 */
function PushBots(options) {
    if (false === (this instanceof PushBots)) {
        return new PushBots(options);
    }
    //default Options
    this.options = {
        version: 'v1',
        url: 'api.pushbots.com',
        ssl: true
    };
    for (var key in options) {
        if (options[key] == null) {
            console.log("Option [" + key + "] set to null. This may cause unexpected behaviour.");
        }
    }
    extend(this.options, options);
    if (!this.options.id || !this.options.secret) {
        console.log("Application ID and secret are required");
    }
    this.url = this.options.url;
    this.version = this.options.version;
    this.ssl = this.options.ssl;
    this.token = this.options.token;
    this.appid = this.options.id;
    this.appsecret = this.options.secret;
    this.data = {};
}
/**
 * Request method.
 *
 * @param {string} Method
 * @param {string} URL
 * @param {string} data
 *
 * @return {Object}
 */
PushBots.prototype.request = function(method, url, data, callback) {
    var self = this;
    var protocole = (self.ssl == true) ? 'https' : 'http';
    // Handle params
    if (typeof callback === 'undefined') {
        callback = data;
        data = {};
    }
    // Construct headers
    var req_headers = {
        'X-PUSHBOTS-APPID': self.appid,
        'X-PUSHBOTS-SECRET': self.appsecret,
        'Content-Type': 'application/json'
    };
    if (self.token != undefined) req_headers['X-PushBots-token'] = self.token;
    // HTTP request
    request({
        method: method,
        url: protocole + '://' + self.url + '/' + url,
        headers: req_headers,
        json: data
    }, function(err, response, body) {
        console.log(protocole + '://' + self.url + url);
        if (err) return callback(err);
        ret = {
            "code": response.statusCode
        };
        if (body) ret['body'] = body;
        //if (response.statusCode < 200 || response.statusCode > 302) return callback(ret);
        callback(ret);
    });
};
/**
 * setMessage method.
 *
 * @param {string} msg
 * @param {string} platform
 *
 */
PushBots.prototype.setMessage = function(msg, platform) {
    platform = (typeof platform === 'undefined') ? [0,1] : platform;
    this.data.msg = msg;
    this.data.platform = platform;
    this.data.payload = {};
};
/**
 * badge method.
 *
 * @param {string} badge
 *
 */
PushBots.prototype.badge = function(badge) {
    this.data.badge = badge;
};
/**
 * Alias method.
 *
 * @param {string} alias
 *
 */
PushBots.prototype.sendByAlias = function(alias) {
    this.data.alias = alias;
};
/**
 * Tags method.
 *
 * @param {array} tags
 *
 */
PushBots.prototype.sendByTags = function(tags) {
    this.data.tags = tags;
};
/**
 * sendByToken method.
 *
 * @param {string} token
 *
 */
PushBots.prototype.sendByToken = function(token) {
    this.data.token = token;
};
/**
 * buttonOne method.
 *
 * @param {string} icon
 * @param {string} text
 * @param {string} action
 *
 */
PushBots.prototype.buttonOne = function(icon, text, action) {
    this.data.payload.button1Icon = icon;
    this.data.payload.button1Title = text;
    this.data.payload.button1Action = action;
};
/**
 * nextActivity method.
 *
 * @param {string} activity
 * @param {string} platform
 *
 */
PushBots.prototype.nextActivity = function(activity) {
    this.data.payload.nextActivity = activity;
};
/**
 * customNotificationTitle method.
 *
 * @param {string} customNotificationTitle
 *
 */
PushBots.prototype.customNotificationTitle = function(customNotificationTitle) {
    this.data.payload.customNotificationTitle = customNotificationTitle;
};
/**
 * buttonOne method.
 *
 * @param {string} icon
 * @param {string} text
 * @param {string} action
 *
 */
PushBots.prototype.buttonTwo = function(icon, text, action) {
    this.data.payload.button2Icon = icon;
    this.data.payload.button2Title = text;
    this.data.payload.button2Action = action;
};
/**
 * customIcon method.
 *
 * @param {string} icon
 *
 */
PushBots.prototype.customIcon = function(icon) {
    this.data.payload.customIcon = icon;
};
/**
 * largeIcon method.
 *
 * @param {string} url
 *
 */
PushBots.prototype.largeIcon = function(url) {
    this.data.payload.largeIcon = url;
};
/**
 * setNotificationType method.
 *
 * @param {string} type
 * @param {object} data
 *
 */
PushBots.prototype.setNotificationType = function(type, data) {
    if (type == "bigPicture") {
        this.data.payload.BigPictureStyle = true;
        this.data.payload.imgUrl = data.imgUrl;
    } else if (type == "bigText") {
        this.data.payload.BigTextStyle = true;
        this.data.payload.bigText = data.bigText;
        this.data.payload.keepText = data.keepText || '';
    }
};
/**
 * push method.
 *
 * @return {Object}
 */
PushBots.prototype.push = function(callback) {
    console.log(this.data);
    var url = '/push/all';
    this.request('POST', url, this.data, callback);
};
/**
 * pushOne method.
 *
 * @return {Object}
 */
PushBots.prototype.pushOne = function(token, callback) {
    this.data.platform = checkToken(token);
    this.data.token = token;
    console.log(this.data);
    var url = '/push/one';
    this.request('POST', url, this.data, callback);
};
/**
 * listDevices method.
 * List devices app given id and secret of app.
 * @return {Object}
 */
PushBots.prototype.listDevices = function(callback) {
    var url = '/devices';
    this.request('GET', url, callback);
};
/**
 * customFields method.
 *
 * @param {object} obj
 * @param {string} platform
 *
 */
PushBots.prototype.customFields = function(obj, platform) {
    this.data.payload = merge(this.payload, obj);
};
/**
 * Export
 */
module.exports = PushBots;