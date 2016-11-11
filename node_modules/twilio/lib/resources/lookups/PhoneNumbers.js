
/**
 @module resources/PhoneNumbers
/**
 @module resources/PhoneNumbers
 The Twilio Lookups PhoneNumbers Resource.
 */
var generate = require('../generate');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/PhoneNumbers';

    //Instance requests
    function PhoneNumbers(number) {
        var resourceApi = {
            get:generate(client, 'GET', baseResourceUrl + '/' + number),
        };

        return resourceApi;
    };
    
    return PhoneNumbers;
};
