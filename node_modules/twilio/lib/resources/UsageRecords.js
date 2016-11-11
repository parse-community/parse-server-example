/**
 @module resources/UsageRecords
 The Twilio "Usage/Records" Resource.
 */
var generate = require('./generate'),
    ListInstanceResource = require('./ListInstanceResource');

module.exports = function (client, accountSid) {
    var baseResourceUrl = '/Accounts/' + accountSid + '/Usage/Records';

    //Instance requests
    function Records(id) {
        var resourceApi = {};

        //Add standard instance resource functions
        generate.restFunctions(resourceApi,client,['GET'], baseResourceUrl + '/' + id);

        return resourceApi;
    }

    //There are special shorthand methods for specific date ranges:
    Records.daily = {
        get: Records('Daily').get,
        list: Records('Daily').get
    };

    Records.monthly = {
        get: Records('Monthly').get,
        list: Records('Monthly').get
    };

    Records.yearly = {
        get: Records('Yearly').get,
        list: Records('Yearly').get
    };

    Records.allTime = {
        get: Records('AllTime').get,
        list: Records('AllTime').get
    };

    Records.today = {
        get: Records('Today').get,
        list: Records('Today').get
    };

    Records.yesterday = {
        get: Records('Yesterday').get,
        list: Records('Yesterday').get
    };

    Records.thisMonth = {
        get: Records('ThisMonth').get,
        list: Records('ThisMonth').get
    };

    Records.lastMonth = {
        get: Records('LastMonth').get,
        list: Records('LastMonth').get
    };

    //List requests
    generate.restFunctions(Records, client, ['GET'], baseResourceUrl);

    return Records;
};
