var generate = require('../generate');
var NextGenListResource = require('../NextGenListResource');

module.exports = function(client) {
    var baseUrl = '/Services'

    function Services(sid) {
        var resourceApi = {}

        generate.restFunctions(resourceApi, client,
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            baseUrl + '/' + sid
        );

        resourceApi.users = NextGenListResource(
            client,
            baseUrl + '/' + sid + '/Users',
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
        );

        resourceApi.roles = NextGenListResource(
            client,
            baseUrl + '/' + sid + '/Roles',
            ['GET'],
            ['GET', {list: 'GET'}]
        );

        resourceApi.channels = function(channelSid) {
            var channelApi = {}

            generate.restFunctions(channelApi, client,
                ['GET', 'POST', 'DELETE', {update: 'POST'}],
                baseUrl + '/' + sid + '/Channels/' + channelSid
            );

            channelApi.messages = NextGenListResource(
                client,
                baseUrl + '/' + sid + '/Channels/' + channelSid + '/Messages',
                ['GET', 'POST', 'DELETE', {update: 'POST'}],
                ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
            );

            channelApi.members = NextGenListResource(
                client,
                baseUrl + '/' + sid + '/Channels/' + channelSid + '/Members',
                ['GET', 'POST', 'DELETE', {update: 'POST'}],
                ['GET', 'POST', {create: 'POST'}, {list: 'GET'}]
            );

            return channelApi;
        }

        generate.restFunctions(resourceApi.channels, client,
            ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
            baseUrl + '/' + sid + '/Channels'
        );

        return resourceApi;
    }

    generate.restFunctions(Services, client,
        ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
        baseUrl
    );

    return Services;
}