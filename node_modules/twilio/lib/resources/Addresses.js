/**
 @module resources/Addresses
 The Twilio "Addresses" Resource.
 */
var generate = require('./generate');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/Addresses';

    //Instance requests
    function Addresses(sid) {
        var resourceApi = {
            get:generate(client, 'GET', baseResourceUrl + '/' + sid),
            post:generate(client, 'POST', baseResourceUrl + '/' + sid),
            delete:generate(client, 'DELETE', baseResourceUrl + '/' + sid)
        };

        //Add in subresources
        resourceApi.dependentPhoneNumbers = {};

        resourceApi.dependentPhoneNumbers.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/DependentPhoneNumbers');

        //Aliases
        resourceApi.dependentPhoneNumbers.list = resourceApi.dependentPhoneNumbers.get;

        return resourceApi;
    }

    //List requests
    Addresses.get = generate(client, 'GET', baseResourceUrl);
    Addresses.list = Addresses.get;
    Addresses.post = generate(client, 'POST', baseResourceUrl);
    Addresses.create = Addresses.post;

    return Addresses;
};
