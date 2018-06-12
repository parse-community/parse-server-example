/**
 * @module resources/pricing/Messaging
 * The Twilio Pricing "Messaging" resources
 */

var generate = require('../generate');

module.exports = function(client) {
    var baseUrl = '/Messaging';
    var countriesUrl = baseUrl + '/Countries';

    function Countries(isoCode) {
        var api = {};
        generate.restFunctions(api, client, ['GET'], countriesUrl + '/' + isoCode);
        return api;
    }

    Countries.get = generate(client, 'GET', countriesUrl);
    Countries.list = Countries.get;

    return {countries: Countries};
}