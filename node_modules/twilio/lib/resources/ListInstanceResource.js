/**
 @module resources/ListInstanceResource

 Most Twilio REST resources follow a "List/Instance" model, where there is a single resource
 like:

 /Accounts/{SID}/Calls

 which can be POSTed to or GETed to create a new instance, or query existing resources, etc.
 Simlarly, these resources also have an "instance", which looks like:

 /Accounts/{SID}/Calls/{some unique identifier}

 Which can get GETed or maybe POSTed.  For these relative simple/similar resources, this module
 will generate a consistent REST interface for whatever methods the resource supports
 */
var generate = require('./generate');

module.exports = function (client, accountSid, resourceName, instanceMethods, listMethods) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/' + resourceName;

    function Resource(instanceId) {
        var resourceApi = {};
        generate.restFunctions(resourceApi, client, instanceMethods, '/Accounts/' + accountSid + '/' + resourceName + '/' + instanceId);
        return resourceApi;
    }

    //generate rest functions for base resource
    generate.restFunctions(Resource, client, listMethods, baseResourceUrl);

    //expose base url
    Resource.baseResourceUrl = baseResourceUrl;

    return Resource;
};
