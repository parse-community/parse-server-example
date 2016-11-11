var generate = require('../generate');

module.exports = function(client) {
    var baseUrl = '/Credentials'

    function Credentials(sid) {
        var resourceApi = {}

        generate.restFunctions(resourceApi, client,
            ['GET', 'POST', 'DELETE', {update: 'POST'}],
            baseUrl + '/' + sid
        );

        return resourceApi;
    }

    generate.restFunctions(Credentials, client,
        ['GET', 'POST', {create: 'POST'}, {list: 'GET'}],
        baseUrl
    );

    return Credentials;
}