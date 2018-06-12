/**
 @module TaskRouterClient

 This module presents a higher-level API for interacting with resources
 in the Twilio TaskRouter API.  Tries to map very closely to the resource structure
 of the actual Twilio API, while still providing a nice JavaScript interface.
 */

//Dependencies
var _ = require('underscore');
var Client = require('./Client');
var util = require('util');

/**
 The Twilio TaskRouter API client
 @constructor
 @param {string} sid - The application SID, as seen in the Twilio portal
 @param {string} tkn - The auth token, as seen in the Twilio portal
 @param {object} options (optional) - optional config for the REST client
 - @member {string} host - host for the Twilio API (default: taskrouter.twilio.com)
 - @member {string} apiVersion - the Twilio REST API version to use for requests (default: v1)
 */
function TaskRouterClient(sid, tkn, workspaceSid, options) {
    //Required client config
    if (!workspaceSid) {
        if (process.env.TWILIO_WORKSPACE_SID) {
            this.workspaceSid = process.env.TWILIO_WORKSPACE_SID;
        }
        else {
            throw 'Client requires a Workspace SID set explicitly or via the TWILIO_WORKSPACE_SID environment variables';
        }
    }
    else {
        //trim spaces
        this.workspaceSid = workspaceSid.replace(/ /g, '');
    }
    options = options || {};
    TaskRouterClient.super_.call(this, sid, tkn, options.host || 'taskrouter.twilio.com', options.apiVersion || 'v1', options.timeout);

    //REST Resource - shorthand for just "workspace" and "workspaces" to match the REST API
    var workspaceResource = require('./resources/task_router/Workspaces')(this);
    this.workspaces = workspaceResource;
    this.workspace = workspaceResource(this.workspaceSid);

    //mix the account object in with the client object - assume master account for resources
    _.extend(this, workspaceResource);
}

util.inherits(TaskRouterClient, Client);

module.exports = TaskRouterClient;
