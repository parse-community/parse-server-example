var inherits = require('util').inherits;
var TaskRouterCapability = require('./TaskRouterCapability');

function TaskRouterTaskQueueCapability(accountSid, authToken, workspaceSid, taskQueueSid) {
    TaskRouterCapability.call(this, accountSid, authToken, workspaceSid, taskQueueSid);
}
inherits(TaskRouterTaskQueueCapability, TaskRouterCapability);

TaskRouterTaskQueueCapability.prototype._setupResource = function() {
    this._resourceUrl = this._baseUrl + '/TaskQueues/' + this.channelId;
}

module.exports = TaskRouterTaskQueueCapability;
