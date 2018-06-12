/**
 @module Trunking

 This module presents a higher-level API for interacting with resources in the
 Twilio Trunking API.  Tries to map very closely to the resource structure of
 the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

function TrunkingClient(sid, tkn, options) {
    options = options || {};
    TrunkingClient.super_.call(
        this, sid, tkn, 
        options.host || 'trunking.twilio.com', 
        options.apiVersion || 'v1', 
        options.timeout
    );

    var trunkResource = require('./resources/trunking/Trunks')(this);
    this.trunks = trunkResource;
}

util.inherits(TrunkingClient, Client);
module.exports = TrunkingClient;
