/**
 @module resources/sip/Domains
 The Twilio "Domains" Resource.
 */
var generate = require('../generate'),
    ListInstanceResource = require('../ListInstanceResource');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/SIP/Domains';

    //Instance requests
    function Domains(sid) {
        var resourceApi = {}

        generate.restFunctions(resourceApi, client,
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            baseResourceUrl + '/' + sid
        );

        resourceApi.ipAccessControlListMappings = ListInstanceResource(client, accountSid,
            'SIP/Domains/' + sid + '/IpAccessControlListMappings',
            ['GET', 'DELETE'],
            ['GET', 'POST', {create:'POST'}, {list: 'GET'}]
        );

        resourceApi.credentialListMappings = ListInstanceResource(client, accountSid,
            'SIP/Domains/' + sid + '/CredentialListMappings',
            ['GET', 'DELETE'],
            ['GET', 'POST', {create:'POST'}, {list: 'GET'}]
        );

        return resourceApi;
    };

    generate.restFunctions(Domains, client,
        ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
        baseResourceUrl
    );

    return Domains;
}
