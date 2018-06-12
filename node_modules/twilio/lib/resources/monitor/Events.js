/**
 @module resources/Monitor/Events
 The Twilio Monitor Events Resource.
 */
var generate = require('../generate');

module.exports = function (client) {
    var baseResourceUrl = '/Events';

    //Instance requests
    function Events(sid) {
        var resourceApi = {};

        generate.restFunctions(resourceApi, client, ['GET'], baseResourceUrl + '/' + sid);

        return resourceApi;
    }

    Events.get = generate(client, 'GET', baseResourceUrl);
    Events.list = Events.get;

    return Events;
};
