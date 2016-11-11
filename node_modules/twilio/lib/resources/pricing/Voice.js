/**
 * @module resources/pricing/Voice
 * The Twilio Pricing "Voice" resources
 */

var generate = require('../generate');

module.exports = function(client) {
    var baseResourceUrl = '/Voice';
    var countriesBaseUrl = baseResourceUrl + '/Countries';

    // Countries resource
    function Countries(isoCode) {
        var resourceApi = {};

        generate.restFunctions(resourceApi, client, ['GET'], countriesBaseUrl + '/' + isoCode);

        return resourceApi;
    }

    Countries.get = generate(client, 'GET', countriesBaseUrl);
    Countries.list = Countries.get;

    // Numbers resource
    var numbersBaseUrl = baseResourceUrl + '/Numbers';

    function Numbers(number) {
        var resourceApi = {};

        generate.restFunctions(resourceApi, client, ['GET'], numbersBaseUrl + '/' + number);

        return resourceApi;
    }

    return {
        countries: Countries,
        numbers: Numbers
    }
}
