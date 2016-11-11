/**
 @module LookupsClient

 This module presents a higher-level API for interacting with resources
 in the Twilio Lookups API.  Tries to map very closely to the resource structure
 of the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

/**
 The Twilio Lookups API client
 @constructor
 @param {string} sid - The application SID, as seen in the Twilio portal
 @param {string} tkn - The auth token, as seen in the Twilio portal
 @param {object} options (optional) - optional config for the REST client
 - @member {string} host - host for the Twilio API (default: lookups.twilio.com)
 - @member {string} apiVersion - the Twilio REST API version to use for requests (default: v1)
 */
function LookupsClient(sid, tkn, options) {
    //Required client config
    options = options || {};
    LookupsClient.super_.call(this, sid, tkn, options.host || 'lookups.twilio.com', options.apiVersion || 'v1', options.timeout);

    var phoneNumbersResource = require('./resources/lookups/PhoneNumbers')(this);
    this.phoneNumbers = phoneNumbersResource;
}

util.inherits(LookupsClient, Client);

module.exports = LookupsClient;
