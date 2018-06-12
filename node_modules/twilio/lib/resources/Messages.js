/**
 @module resources/Messages
 The Twilio "Messages" Resource.
 */
var generate = require('./generate');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/Messages';

    //Instance requests
    function Messages(sid) {
        var resourceApi = {
            get:generate(client, 'GET', baseResourceUrl + '/' + sid),
            post:generate(client, 'POST', baseResourceUrl + '/' + sid),
            delete:generate(client, 'DELETE', baseResourceUrl + '/' + sid)
        };

        resourceApi.media = function(mediaSid) {
            var mediaResourceApi = {
                get:generate(client, 'GET', baseResourceUrl + '/' + sid + '/Media/' + mediaSid),
                delete:generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Media/' + mediaSid)
            };

            return mediaResourceApi;
        };

        resourceApi.media.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Media');
        resourceApi.media.list = resourceApi.media.get;
        return resourceApi;
    };

    Messages.get = generate(client, 'GET', baseResourceUrl);
    Messages.list = Messages.get;

    Messages.post = generate(client, 'POST', baseResourceUrl);
    Messages.create = Messages.post;

    return Messages;
};


