/**
 @module resources/sip/IpAccessControlLists
 The Twilio "IpAccessControlLists" Resource.
 */
var generate = require('../generate'),
    ListInstanceResource = require('../ListInstanceResource');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/SIP/IpAccessControlLists';

    //Instance requests
    function IpAccessControlLists(sid) {
        var resourceApi = {}

        generate.restFunctions(resourceApi, client,
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            baseResourceUrl + '/' + sid
        );

        resourceApi.ipAddresses = ListInstanceResource(client, accountSid,
            'SIP/IpAccessControlLists/' + sid + '/IpAddresses',
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            ['GET', 'POST', {list: 'GET'}, {create: 'POST'}]
        );

        return resourceApi;
    }

    generate.restFunctions(IpAccessControlLists, client,
        ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
        baseResourceUrl
    );


    return IpAccessControlLists;

}
