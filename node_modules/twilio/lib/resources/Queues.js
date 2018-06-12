/**
 @module resources/Queues
 The Twilio "Queues" Resource.
 */
var generate = require('./generate'),
    ListInstanceResource = require('./ListInstanceResource');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/Queues';

    //Instance requests
    function Queues(sid) {
        var resourceApi = {};

        //Add standard instance resource functions
        generate.restFunctions(resourceApi,client,['GET', 'POST', 'DELETE', {update:'POST'}], baseResourceUrl + '/' + sid);

        //Add special call queue sub resources
        resourceApi.members = ListInstanceResource(client, accountSid, 'Queues/' + sid + '/Members',
            ['GET', 'POST', {update:'POST'}],
            ['GET']
        );

        //There's also a special resource for a call at the front of the queue, not specified by SID
        resourceApi.members.front = {
            get: resourceApi.members('Front').get,
            post: resourceApi.members('Front').post,
            update: resourceApi.members('Front').post
        };

        return resourceApi;
    }

    //List requests
    generate.restFunctions(Queues, client, ['GET', 'POST', {create:'POST'}], baseResourceUrl);


    return Queues;
};
