/**
 @module resources/Monitor/Alerts
 The Twilio Monitor Alerts Resource.
 */
var generate = require('../generate');

module.exports = function (client) {
    var baseResourceUrl = '/Alerts';

    //Instance requests
    function Alerts(sid) {
        var resourceApi = {};

        generate.restFunctions(resourceApi, client, ['GET'], baseResourceUrl + '/' + sid);

        return resourceApi;
    }

    Alerts.get = generate(client, 'GET', baseResourceUrl);
    Alerts.list = Alerts.get;

    return Alerts;
};
