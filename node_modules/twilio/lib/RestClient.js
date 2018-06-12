/**
 @module RestClient

 This module presents a higher-level API for interacting with resources
 in the Twilio REST API.  Tries to map very closely to the resource structure
 of the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

/**
 The Twilio REST API client
 @constructor
 @param {string} sid - The application SID, as seen in the Twilio portal
 @param {string} tkn - The auth token, as seen in the Twilio portal
 @param {object} options (optional) - optional config for the REST client
 - @member {string} host - host for the Twilio API (default: api.twilio.com)
 - @member {string} apiVersion - the Twilio REST API version to use for requests (default: 2010-04-01)
 */
function RestClient(sid, tkn, options) {
    options = options || {};
    RestClient.super_.call(this, sid, tkn, options.host, options.apiVersion, options.timeout);

    //REST Resource - shorthand for just "account" and "accounts" to match the REST API
    var accountResource = require('./resources/Accounts')(this);
    this.accounts = accountResource;

    //mix the account object in with the client object - assume master account for resources
    _.extend(this,accountResource);

    //Messaging shorthand
    this.sendSms = this.accounts.sms.messages.post;
    this.sendMms = this.accounts.messages.post;
    this.sendMessage = this.accounts.messages.post;
    this.listSms = this.accounts.sms.messages.get;
    this.listMessages = this.accounts.messages.get;
    this.getSms = function(messageSid, callback) {
        this.accounts.sms.messages(messageSid).get(callback);
    };
    this.getMessage = function(messageSid, callback) {
        this.accounts.messages(messageSid).get(callback);
    };


    //Calls shorthand
    this.makeCall = this.accounts.calls.post;
    this.listCalls = this.accounts.calls.get;
    this.getCall = function(callSid, callback) {
        this.accounts.calls(callSid).get(callback);
    };
}

util.inherits(RestClient, Client);

RestClient.prototype.request = function(options, callback) {
    var client = this;

    // Force .json for Coke Classic API
    options.url = options.url + '.json';
    return RestClient.super_.prototype.request.call(this, options, callback);
};

module.exports = RestClient;
