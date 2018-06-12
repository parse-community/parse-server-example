/**
 * @module resources/pricing/PhoneNumbers
 * The Twilio Pricing "PhoneNumbers" resources
 */

var generate = require('../generate');

module.exports = function(client) {
    var baseResourceUrl = '/PhoneNumbers';
    var countriesBaseUrl = baseResourceUrl + '/Countries';

    function Countries(isoCode) {
        var resourceApi = {};

        generate.restFunctions(resourceApi, client, ['GET'], countriesBaseUrl + '/' + isoCode);

        return resourceApi;
    }

    Countries.get = generate(client, 'GET', countriesBaseUrl);
    Countries.list = Countries.get;

    return {countries: Countries};
}
