/**
 @module MonitorClient

 This module presents a higher-level API for interacting with resources
 in the Twilio Monitor API.  Tries to map very closely to the resource structure
 of the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

/**
 The Twilio Monitor API client
 @constructor
 @param {string} sid - The application SID, as seen in the Twilio portal
 @param {string} tkn - The auth token, as seen in the Twilio portal
 @param {object} options (optional) - optional config for the REST client
 - @member {string} host - host for the Twilio API (default: monitor.twilio.com)
 - @member {string} apiVersion - the Twilio REST API version to use for requests (default: v1)
 */
function MonitorClient(sid, tkn, options) {
    //Required client config
    options = options || {};
    MonitorClient.super_.call(this, sid, tkn, options.host || 'monitor.twilio.com', options.apiVersion || 'v1', options.timeout);

    //REST Resource - shorthand for just "event" and "events" to match the REST API
    var eventResource = require('./resources/monitor/Events')(this);
    this.events = eventResource;
    var alertResource = require('./resources/monitor/Alerts')(this);
    this.alerts = alertResource;

    //mix the account object in with the client object - assume master account for resources
    _.extend(this, eventResource);
    _.extend(this, alertResource);
}

util.inherits(MonitorClient, Client);

module.exports = MonitorClient;
