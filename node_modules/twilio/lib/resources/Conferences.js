/**
 @module resources/Conferences
 The Twilio "Conferences" Resource.
 */
var generate = require('./generate');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/Conferences';

    //Instance requests
    function Conferences(sid) {
        var resourceApi = {
            get:generate(client, 'GET', baseResourceUrl + '/' + sid)
        };

        //Add in subresources
        resourceApi.participants = function(participantSid) {
            var participantResourceApi = {
                get:generate(client, 'GET', baseResourceUrl + '/' + sid + '/Participants/' + participantSid),
                post:generate(client, 'POST', baseResourceUrl + '/' + sid + '/Participants/' + participantSid),
                delete:generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Participants/' + participantSid)
            };

            //Aliases
            participantResourceApi.update = participantResourceApi.post;
            participantResourceApi.kick = participantResourceApi.delete;

            return participantResourceApi;
        };

        resourceApi.participants.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Participants');

        //Aliases
        resourceApi.participants.list = resourceApi.participants.get;

        return resourceApi;
    }

    //List requests
    Conferences.get = generate(client, 'GET', baseResourceUrl);
    Conferences.list = Conferences.get;

    return Conferences;
};
