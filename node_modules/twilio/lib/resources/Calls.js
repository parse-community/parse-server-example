/**
 @module resources/Calls
 The Twilio "Calls" Resource.
 */
var generate = require('./generate');
var ListInstanceResource = require('./ListInstanceResource');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/Calls';

    //Instance requests
    function Calls(sid) {
        var resourceApi = {};

        //Add standard instance resource functions
        generate.restFunctions(resourceApi, client, ['GET', 'POST', 'DELETE', {update: 'POST'}], baseResourceUrl + '/' + sid);

        //Add in subresources
        resourceApi.recordings = {
            get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Recordings')
        };
        resourceApi.notifications = {
            get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Notifications')
        };

        resourceApi.recordings.list = resourceApi.recordings.get;
        resourceApi.notifications.list = resourceApi.notifications.get;

        resourceApi.feedback = {
            get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Feedback'),
            post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Feedback'),
            delete: generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Feedback')
        };

        resourceApi.feedback.create = resourceApi.feedback.post;

        return resourceApi;
    }

    //List requests
    generate.restFunctions(Calls, client, ['GET', 'POST', {create: 'POST'}], baseResourceUrl);

    // Create ListInstanceResource for FeedbackSummary sub-resource
    Calls.feedbackSummary = ListInstanceResource(client, accountSid,
        'Calls/FeedbackSummary',
        ['GET', 'DELETE'],
        ['POST', {create:'POST'}]
    );

    return Calls;
};
