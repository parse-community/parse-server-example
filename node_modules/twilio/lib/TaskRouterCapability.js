var jwt = require('jsonwebtoken');
var deprecate = require('deprecate');
var _ = require('underscore')
require('string.prototype.startswith');

var taskRouterUrlBase = 'https://taskrouter.twilio.com';
var taskRouterVersion = 'v1';
var eventUrlBase = 'https://event-bridge.twilio.com/v1/wschannels';

function TaskRouterCapability(accountSid, authToken, workspaceSid, channelId) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.policies = [];

    this.workspaceSid = workspaceSid;
    this.channelId = channelId;

    this._baseUrl = taskRouterUrlBase + '/' + taskRouterVersion + '/Workspaces/' + this.workspaceSid;

    this._validateJWT();

    this._setupResource();

    var eventsUrl = eventUrlBase + '/' + this.accountSid + '/' + channelId;

    // add permissions to GET and POST to the event-bridge channel
    this.allow(eventsUrl, 'GET');
    this.allow(eventsUrl, 'POST');

    // add permission to fetch the instance resource
    this.allow(this._resourceUrl, 'GET');
}

TaskRouterCapability.prototype._setupResource = function() {
    if(this.channelId.startsWith('WS')) {
        this._resourceUrl = this._baseUrl;
    }else if(this.channelId.startsWith('WK')) {
        this._resourceUrl = this._baseUrl + '/Workers/' + this.channelId;

        var activityUrl = this._baseUrl + '/Activities';
        this.allow(activityUrl, "GET");

        var tasksUrl = this._baseUrl + '/Tasks/**';
        this.allow(tasksUrl, "GET");

        var workerReservationsUrl = this._resourceUrl + '/Reservations/**';
        this.allow(workerReservationsUrl, "GET");

    }else if(this.channelId.startsWith('WQ')) {
        this._resourceUrl = this._baseUrl + '/TaskQueues/' + this.channelId;
    }
}

TaskRouterCapability.prototype._validateJWT = function() {
    if(!this.accountSid || !this.accountSid.startsWith('AC')) {
        throw "Invalid AccountSid provided: "+this.accountSid;
    }
    if(!this.workspaceSid || !this.workspaceSid.startsWith('WS')) {
        throw "Invalid WorkspaceSid provided: "+this.workspaceSid;
    }
    if(!this.channelId) {
        throw "ChannelId not provided";
    }
    var prefix = this.channelId.substring(0,2);
    if(prefix != 'WS' && prefix != 'WK' && prefix != 'WQ') {
        throw "Invalid ChannelId provided: "+this.channelId;
    }
}

TaskRouterCapability.prototype.allowFetchSubresources = function() {
    this.allow(this._resourceUrl+'/**', 'GET');
}

TaskRouterCapability.prototype.allowUpdates = function() {
    this.allow(this._resourceUrl, 'POST');
}

TaskRouterCapability.prototype.allowUpdatesSubresources = function() {
    this.allow(this._resourceUrl+'/**', 'POST');
}

TaskRouterCapability.prototype.allowDelete = function() {
    this.allow(this._resourceUrl, 'DELETE');
}

TaskRouterCapability.prototype.allowDeleteSubresources = function() {
    this.allow(this._resourceUrl+'/**', 'DELETE');
}

TaskRouterCapability.prototype.allowDeleteSubresources = function() {
    this.allow(this._resourceUrl+'/**', 'DELETE');
}

TaskRouterCapability.prototype.allowWorkerActivityUpdates = function() {
    if(this.channelId.startsWith('WK')) {
        deprecate('allowWorkerActivityUpdates is deprecated. Please use TaskRouterWorkerCapability.allowWorkerActivityUpdates() instead');
        this.allow(this._resourceUrl, 'POST', {}, {"ActivitySid": {'required': true}});
    }else {
        throw "Deprecated function not applicable to non Worker";
    }
}

TaskRouterCapability.prototype.allowWorkerFetchAttributes = function() {
    if(this.channelId.startsWith('WK')) {
        deprecate('allowWorkerFetchAttributes is deprecated. Please use TaskRouterWorkerCapability; added automatically in constructor');
        this.allow(this._resourceUrl, 'GET');
    }else {
        throw "Deprecated function not applicable to non Worker";
    }
}

TaskRouterCapability.prototype.allowTaskReservationUpdates = function() {
    if(this.channelId.startsWith('WK')) {
        deprecate('allowTaskReservationUpdates is deprecated. Please use TaskRouterWorkerCapability.allowReservationUpdates() instead');
        this.allow(this._baseUrl + "/Tasks/**", "POST");
    }else {
        throw "Deprecated function not applicable to non Worker";
    }
}

TaskRouterCapability.prototype.addPolicy = function(url, method, allowed, queryFilter, postFilter) {
    var policy = {
        url: url,
        method: method
    };

    if (queryFilter) {
        policy.query_filter = queryFilter;
    } else {
        policy.query_filter = {};
    }

    if (postFilter) {
        policy.post_filter = postFilter;
    } else {
        policy.post_filter = {};
    }

    if (typeof allowed !== 'undefined') {
        policy.allow = allowed;
    } else {
        policy.allow = true;
    }
    this.policies.push(policy);
}

TaskRouterCapability.prototype.allow = function(url, method, queryFilter, postFilter) {
    this.addPolicy(url, method, true, queryFilter, postFilter);
}

TaskRouterCapability.prototype.deny = function(url, method, queryFilter, postFilter) {
    this.addPolicy(url, method, false, queryFilter, postFilter);
}

TaskRouterCapability.prototype.generate = function(ttl) {
    var taskRouterAttributes = {
        'account_sid': this.accountSid,
        'channel': this.channelId,
        'workspace_sid': this.workspaceSid
    }

    if(this.channelId.startsWith('WK')) {
        taskRouterAttributes.worker_sid = this.channelId;
    }else if(this.channelId.startsWith('WQ')) {
        taskRouterAttributes.taskqueue_sid = this.channelId;
    }

    return this._generate(ttl, taskRouterAttributes);
}

TaskRouterCapability.prototype._generate = function(ttl, extraAttributes) {
    var payload = {
        iss: this.accountSid,
        exp: (Math.floor(new Date() / 1000) + (ttl || 3600)),
        version: taskRouterVersion,
        friendly_name: this.channelId,
        policies: this.policies,
    };
    _.extend(payload, extraAttributes);
    return jwt.sign(payload, this.authToken);
}

module.exports = TaskRouterCapability;
