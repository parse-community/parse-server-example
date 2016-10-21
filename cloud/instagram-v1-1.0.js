/**
 * Instagram Cloud Module
 * @name Instagram
 *
 * Cloud Module for using Instagram API.
 *
 * To use this Cloud Module in Cloud Code, start by requiring
 * the <code>mailgun</code> module and initializing it using your
 * Mailgun domain name and api key.
 *
 * <pre>var Instagram = require('cloud/instagram-v1-1.0.js');
 * Instagram.initialize('clientId');</pre>
 *
 */

(function() {

  var _apiUrl = 'https://api.instagram.com/v1/';
  var _clientID = '';
  var _accessToken = '';

  function wrappedHttpRequest(url, params, authenticateRequest) {
    authenticateRequest = authenticateRequest || false;
    if (authenticateRequest) {
      if (!params.access_token) {
        params.access_token = _accessToken;
      }
    } else {
      params.client_id = _clientID;
    }
    return Parse.Cloud.httpRequest({
        url: url,
        params: params
      });
  }

  module.exports = {

    initialize: function(clientID) {
      _clientID = clientID;
    },

    setAccessToken: function(accessToken) {
      _accessToken = accessToken;
    },

    searchTag: function(params) {
      return wrappedHttpRequest(_apiUrl + "tags/search", params);
    },

    searchUser: function(params) {
      return wrappedHttpRequest(_apiUrl + "users/search", params);
    },

    searchLocation: function(params) {
      return wrappedHttpRequest(_apiUrl + "locations/search", params);
    },

    getTag: function(tag, params) {
      return wrappedHttpRequest(_apiUrl + "tags/" + tag, params);
    },

    getUser: function(user, params) {
      return wrappedHttpRequest(_apiUrl + "users/" + user, params);
    },

    getLocation: function(location, params) {
      return wrappedHttpRequest(_apiUrl + "locations/" + location, params);
    },

    getPopularMedia: function(params) {
      return wrappedHttpRequest(_apiUrl + "media/popular", params);
    },

    getRecentMediaByTag: function(tag, params) {
      return wrappedHttpRequest(_apiUrl + "tags/" + tag + "/media/recent", params);
    },

    getRecentMediaByUser: function(user, params) {
      return wrappedHttpRequest(_apiUrl + "users/" + user + "/media/recent", params, true);
    },

    getRecentMediaByLocation: function(location, params) {
      return wrappedHttpRequest(_apiUrl + "locations/" + location + "/media/recent", params);
    },

    getSelfFeed: function(params) {
      return wrappedHttpRequest(_apiUrl + "users/self/feed", params, true);
    },

    getSelfLikedMedia: function(params) {
      return wrappedHttpRequest(_apiUrl + "users/self/media/liked", params, true);
    },

    getNextPage: function(nextUrl) {
      return wrappedHttpRequest(nextUrl, {});
    }

  }
})();