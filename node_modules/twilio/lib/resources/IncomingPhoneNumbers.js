/**
 @module resources/AvailablePhoneNumbers
 The Twilio "AvailablePhoneNumbers" Resource.
 */
var generate = require('./generate'),
    ListInstanceResource = require('./ListInstanceResource');

module.exports = function (client, accountSid) {
    var IncomingPhoneNumbers = ListInstanceResource(client, accountSid, 'IncomingPhoneNumbers',
        ['GET', 'POST', 'PUT', 'DELETE', { update:'PUT' }],
        ['GET', 'POST', { create:'POST' }]
    );

    //Add local and toll-free subresources
    IncomingPhoneNumbers.local = {};
    generate.restFunctions(IncomingPhoneNumbers.local, client, ['GET', 'POST'], IncomingPhoneNumbers.baseResourceUrl+'/Local');
    IncomingPhoneNumbers.local.create = IncomingPhoneNumbers.local.post;

    IncomingPhoneNumbers.tollFree = {};
    generate.restFunctions(IncomingPhoneNumbers.tollFree, client, ['GET', 'POST'], IncomingPhoneNumbers.baseResourceUrl+'/TollFree');
    IncomingPhoneNumbers.tollFree.create = IncomingPhoneNumbers.tollFree.post;

    IncomingPhoneNumbers.mobile = {};
    generate.restFunctions(IncomingPhoneNumbers.mobile, client, ['GET', 'POST'], IncomingPhoneNumbers.baseResourceUrl+'/Mobile');
    IncomingPhoneNumbers.mobile.create = IncomingPhoneNumbers.mobile.post;

    return IncomingPhoneNumbers;
};
