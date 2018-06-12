
var generate = require('../generate');
var NextGenListInstanceResource = require('../NextGenListInstanceResource');

module.exports = function(client) {
    var baseUrl = '/Trunks';

    function Trunks(sid) {

        var resourceApi = {};

        generate.restFunctions(resourceApi, client,
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            baseUrl + '/' + sid
        );

        resourceApi.ipAccessControlLists = NextGenListInstanceResource(
            client, 
            baseUrl + '/' + sid + '/IpAccessControlLists',
            ['GET', 'DELETE'],
            ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
        );

        resourceApi.credentialLists = NextGenListInstanceResource(
            client, 
            baseUrl + '/' + sid + '/CredentialLists',
            ['GET', 'DELETE'],
            ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
        );

        resourceApi.phoneNumbers = NextGenListInstanceResource(
            client, 
            baseUrl + '/' + sid + '/PhoneNumbers',
            ['GET', 'DELETE'],
            ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
        );

        resourceApi.originationUrls = NextGenListInstanceResource(
            client, 
            baseUrl + '/' + sid + '/OriginationUrls',
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
        );

        return resourceApi;
    }

    generate.restFunctions(Trunks, client,
        ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
        baseUrl
    );

    return Trunks;
}