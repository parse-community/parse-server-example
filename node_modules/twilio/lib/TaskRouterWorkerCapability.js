var inherits = require('util').inherits;
var TaskRouterCapability = require('./TaskRouterCapability');

function TaskRouterWorkerCapability(accountSid, authToken, workspaceSid, workerSid) {
    TaskRouterCapability.call(this, accountSid, authToken, workspaceSid, workerSid);

    this.reservationsUrl = this._baseUrl + "/Tasks/**";
    this.activityUrl = this._baseUrl + "/Activities";
    this.workerReservationsUrl = this._resourceUrl + "/Reservations/**";

    // add permissions fo fetch the list of activities, tasks and worker reservations
    this.allow(this.activityUrl, "GET");
    this.allow(this.reservationsUrl, "GET");
    this.allow(this.workerReservationsUrl, "GET");
}
inherits(TaskRouterWorkerCapability, TaskRouterCapability);

TaskRouterWorkerCapability.prototype._setupResource = function() {
    this._resourceUrl = this._baseUrl + '/Workers/' + this.channelId;
}

TaskRouterWorkerCapability.prototype.allowActivityUpdates = function() {
    this.allow(
        this._resourceUrl, 
        "POST",
        {},
        {"ActivitySid": {'required': true}});
}

TaskRouterWorkerCapability.prototype.allowReservationUpdates = function() {
    this.allow(
        this.reservationsUrl, 
        "POST",
        {},
        {});
    this.allow(
        this.workerReservationsUrl, 
        "POST",
        {},
        {});
}

module.exports = TaskRouterWorkerCapability;
