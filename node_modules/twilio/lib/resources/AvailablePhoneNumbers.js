/**
 @module resources/AvailablePhoneNumbers
 The Twilio "AvailablePhoneNumbers" Resource.
 */
var generate = require('./generate');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/AvailablePhoneNumbers';

    function AvailablePhoneNumbers(isoCode) {
        var resourceApi = {
            local:{
                get:generate(client, 'GET', baseResourceUrl + '/' + isoCode + '/Local')
            },
            tollFree:{
                get:generate(client, 'GET', baseResourceUrl + '/' + isoCode + '/TollFree')
            },
            mobile:{
                get:generate(client, 'GET', baseResourceUrl + '/' + isoCode + '/Mobile')
            }
        };

        resourceApi.local.list = resourceApi.local.get;
        resourceApi.local.search = resourceApi.local.get;
        resourceApi.tollFree.list = resourceApi.tollFree.get;
        resourceApi.tollFree.search = resourceApi.tollFree.get;
        resourceApi.mobile.list = resourceApi.mobile.get;
        resourceApi.mobile.search = resourceApi.mobile.get;

        return resourceApi;
    }

    return AvailablePhoneNumbers;
};
