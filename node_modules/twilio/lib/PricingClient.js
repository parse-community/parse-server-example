/**
 @module PricingClient

 This module presents a higher-level API for interacting with resources in the
 Twilio Pricing API.  Tries to map very closely to the resource structure of
 the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

/**
 The Twilio Pricing API client
 @constructor
 @param {string} sid - The application SID, as seen in the Twilio portal
 @param {string} tkn - The auth token, as seen in the Twilio portal
 @param {object} options (optional) - optional config for the REST client
 - @member {string} host - host for the Twilio API (default: pricing.twilio.com)
 - @member {string} apiVersion - the Twilio REST API version to use for requests (default: v1)
 */
function PricingClient(sid, tkn, options) {
    options = options || {};
    PricingClient.super_.call(this, sid, tkn, options.host || 'pricing.twilio.com', options.apiVersion || 'v1', options.timeout);

    var voiceResource = require('./resources/pricing/Voice')(this);
    this.voice = voiceResource;

    var phoneNumbersResource = require('./resources/pricing/PhoneNumbers')(this);
    this.phoneNumbers = phoneNumbersResource;

    var messagingResource = require('./resources/pricing/Messaging')(this);
    this.messaging = messagingResource;
}

util.inherits(PricingClient, Client);

module.exports = PricingClient;
