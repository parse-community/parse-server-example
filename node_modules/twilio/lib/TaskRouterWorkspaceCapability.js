var inherits = require('util').inherits;
var TaskRouterCapability = require('./TaskRouterCapability');

function TaskRouterWorkspaceCapability(accountSid, authToken, workspaceSid) {
    TaskRouterCapability.call(this, accountSid, authToken, workspaceSid, workspaceSid);
}
inherits(TaskRouterWorkspaceCapability, TaskRouterCapability);

TaskRouterWorkspaceCapability.prototype._setupResource = function() {
    this._resourceUrl = this._baseUrl;
}

module.exports = TaskRouterWorkspaceCapability;
