/**
 @module IpMessagingClient

 This module presents a higher-level API for interacting with resources in the
 Twilio Ip Messaging API.  Tries to map very closely to the resource structure of
 the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

/**
 The Twilio Ip Messaging API client
 @constructor
 @param {string} sid - The application SID, as seen in the Twilio portal
 @param {string} tkn - The auth token, as seen in the Twilio portal
 @param {object} options (optional) - optional config for the REST client
 - @member {string} host - host for the Twilio API (default: ip-messaging.twilio.com)
 - @member {string} apiVersion - the Twilio REST API version to use for requests (default: v1)
 */
function IpMessagingClient(sid, tkn, options) {
    options = options || {};
    IpMessagingClient.super_.call(
        this, sid, tkn, 
        options.host || 'ip-messaging.twilio.com', 
        options.apiVersion || 'v1', 
        options.timeout
    );

    var servicesResource = require('./resources/ip_messaging/Services')(this);
    this.services = servicesResource;

    var credentialsResource = require('./resources/ip_messaging/Credentials')(this);
    this.credentials = credentialsResource;
}

util.inherits(IpMessagingClient, Client);

module.exports = IpMessagingClient;
