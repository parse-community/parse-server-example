/**
 @module resources/sip/CredentialLists
 The Twilio "CredentialLists" Resource.
 */
var generate = require('../generate'),
    ListInstanceResource = require('../ListInstanceResource');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/SIP/CredentialLists';

    //Instance requests
    function CredentialLists(sid) {
        var resourceApi = {}

        generate.restFunctions(resourceApi, client,
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            baseResourceUrl + '/' + sid
        );

        resourceApi.credentials = ListInstanceResource(client, accountSid,
            'SIP/CredentialLists/' + sid + '/Credentials',
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            ['GET', 'POST', {list: 'GET'}, {create: 'POST'}]
        );

        return resourceApi;
    }

    generate.restFunctions(CredentialLists, client,
        ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
        baseResourceUrl
    );

    return CredentialLists;

}
