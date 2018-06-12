//Dependencies
var Q = require('q');
var querystring = require('querystring');
var request = require('request');
var moduleinfo = require('../package.json');
var _ = require('underscore');

//REST API Config Defaults
var defaultHost = 'api.twilio.com';
var defaultApiVersion = '2010-04-01';

function Client(sid, tkn, host, api_version, timeout) {
    //Required client config
    if (!sid || !tkn) {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.accountSid = process.env.TWILIO_ACCOUNT_SID;
            this.authToken = process.env.TWILIO_AUTH_TOKEN;
        }
        else {
            throw 'Client requires an Account SID and Auth Token set explicitly ' +
                'or via the TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables';
        }
    }
    else {
        //if auth token/SID passed in manually, trim spaces
        this.accountSid = sid.replace(/ /g, '');
        this.authToken = tkn.replace(/ /g, '');
    }

    //Optional client config
    this.host = host || defaultHost;
    this.apiVersion = api_version || defaultApiVersion;
    this.timeout = timeout || 31000; // request timeout in milliseconds
}

//process data and make available in a more JavaScripty format
function processKeys(source) {
    if (_.isObject(source)) {
        Object.keys(source).forEach(function(key) {

            if (key === 'total' || key === 'last_page_uri' || key === 'num_pages') {
                delete source[key];
            }

            //Supplement underscore values with camel-case
            if (key.indexOf('_') > 0) {
                var cc = key.replace(/_([a-z])/g, function (g) {
                    return g[1].toUpperCase()
                });
                source[cc] = source[key];
            }

            //process any nested arrays...
            if (Array.isArray(source[key])) {
                source[key].forEach(processKeys);
            }
            else if (_.isObject(source[key])) {
                processKeys(source[key]);
            }
        });

        //Look for and convert date strings for specific keys
        ['startDate', 'endDate', 'dateCreated', 'dateUpdated', 'startTime', 'endTime', 'dateSent'].forEach(function(dateKey) {
            if (source[dateKey]) {
                source[dateKey] = new Date(source[dateKey]);
            }
        });
    }
}

/**
 Get the base URL which we'll use for all requests with this client

 @returns {string} - the API base URL
 */
Client.prototype.getBaseUrl = function () {
    return 'https://' + this.accountSid + ':' + this.authToken + '@' + this.host + '/' + this.apiVersion;
};


/**
 Make an authenticated request against the Twilio backend. Uses the request
 library, and largely passes through to its API for options:

 https://github.com/mikeal/request

 @param {object} options - options for HTTP request
 @param {function} callback - callback function for when request is complete
 - @param {object} error - an error object if there was a problem processing the request
 - @param {object} data - the JSON-parsed data
 - @param {http.ClientResponse} response - the raw node http.ClientResponse object
 */
Client.prototype.request = function (options, callback) {
    var client = this;
    var deferred = Q.defer();

    //Prepare request options
    // Add base URL if we weren't given an absolute one
    if (!options.url.indexOf('http') !== 0) {
        options.url = client.getBaseUrl() + options.url;
    }
    options.headers = {
        'Accept':'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent':'twilio-node/' + moduleinfo.version
    };
    options.timeout = client.timeout;

    // Manually create POST body if there's a form object. Sadly, request
    // turns multiple key parameters into array-ified queries, like this:
    // MediaUrl[0]=foo&MediaUrl[1]=bar. Node querystring does the right thing so
    // we use that here. Also see https://github.com/mikeal/request/issues/644
    if (options.form) {
        options.body = querystring.stringify(options.form).toString('utf-8');
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
        options.form = null;
    }

    //Initiate HTTP request
    request(options, function (err, response, body) {
        var data;
        try {
            if (err) {
                data = err;
            } else {
                data = body ? JSON.parse(body) : null;
            }
        } catch (e) {
            data = { status: 500, message: (e.message || 'Invalid JSON body') };
        }

        //request doesn't think 4xx is an error - we want an error for any non-2xx status codes
        var error = null;
        if (err || (response && (response.statusCode < 200 || response.statusCode > 206))) {
            error = {};
            // response is null if server is unreachable
            if (response) {
                error.status = response.statusCode;
                error.message = data ? data.message : 'Unable to complete HTTP request';
                error.code = data && data.code;
                error.moreInfo = data && data.more_info;
            } else {
                error.status = err.code;
                error.message = 'Unable to reach host: "'+client.host+'"';
            }
        }

        // JavaScriptify properties of response if it exists
        data && processKeys(data);

        //hang response off the JSON-serialized data, as unenumerable to allow for stringify.
        data && Object.defineProperty(data, 'nodeClientResponse', {
            value: response,
            configurable: true,
            writeable: true,
            enumerable: false
        });

        // Resolve promise
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(data);
        }

    });

    // Return promise, but also support original node callback style
    return deferred.promise.nodeify(callback);
};

module.exports = Client;
