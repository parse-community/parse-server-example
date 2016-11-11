var generate = require('./generate');

module.exports = function(client, url, instanceMethods, listMethods) {
    function Resource(sid) {
        var resourceApi = {};
        generate.restFunctions(resourceApi, client, instanceMethods, url + '/' + sid);
        return resourceApi;
    }

    //generate rest functions for base resource
    generate.restFunctions(Resource, client, listMethods, url);

    //expose base url
    Resource.url = url;

    return Resource;
};
