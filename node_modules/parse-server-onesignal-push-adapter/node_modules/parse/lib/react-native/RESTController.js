/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

import CoreManager from './CoreManager';
import ParseError from './ParseError';
import ParsePromise from './ParsePromise';
import Storage from './Storage';

var XHR = null;
if (typeof XMLHttpRequest !== 'undefined') {
  XHR = XMLHttpRequest;
}


var useXDomainRequest = false;
if (typeof XDomainRequest !== 'undefined' && !('withCredentials' in new XMLHttpRequest())) {
  useXDomainRequest = true;
}

function ajaxIE9(method, url, data) {
  var promise = new ParsePromise();
  var xdr = new XDomainRequest();
  xdr.onload = function () {
    var response;
    try {
      response = JSON.parse(xdr.responseText);
    } catch (e) {
      promise.reject(e);
    }
    if (response) {
      promise.resolve(response);
    }
  };
  xdr.onerror = xdr.ontimeout = function () {
    // Let's fake a real error message.
    var fakeResponse = {
      responseText: JSON.stringify({
        code: ParseError.X_DOMAIN_REQUEST,
        error: 'IE\'s XDomainRequest does not supply error info.'
      })
    };
    promise.reject(fakeResponse);
  };
  xdr.onprogress = function () {};
  xdr.open(method, url);
  xdr.send(data);
  return promise;
}

const RESTController = {
  ajax(method, url, data, headers) {
    if (useXDomainRequest) {
      return ajaxIE9(method, url, data, headers);
    }

    var promise = new ParsePromise();
    var attempts = 0;

    var dispatch = function () {
      if (XHR == null) {
        throw new Error('Cannot make a request: No definition of XMLHttpRequest was found.');
      }
      var handled = false;
      var xhr = new XHR();

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || handled) {
          return;
        }
        handled = true;

        if (xhr.status >= 200 && xhr.status < 300) {
          var response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            promise.reject(e.toString());
          }
          if (response) {
            promise.resolve(response, xhr.status, xhr);
          }
        } else if (xhr.status >= 500 || xhr.status === 0) {
          // retry on 5XX or node-xmlhttprequest error
          if (++attempts < CoreManager.get('REQUEST_ATTEMPT_LIMIT')) {
            // Exponentially-growing random delay
            var delay = Math.round(Math.random() * 125 * Math.pow(2, attempts));
            setTimeout(dispatch, delay);
          } else if (xhr.status === 0) {
            promise.reject('Unable to connect to the Parse API');
          } else {
            // After the retry limit is reached, fail
            promise.reject(xhr);
          }
        } else {
          promise.reject(xhr);
        }
      };

      headers = headers || {};
      if (typeof headers['Content-Type'] !== 'string') {
        headers['Content-Type'] = 'text/plain'; // Avoid pre-flight
      }
      if (CoreManager.get('IS_NODE')) {
        headers['User-Agent'] = 'Parse/' + CoreManager.get('VERSION') + ' (NodeJS ' + process.versions.node + ')';
      }

      xhr.open(method, url, true);
      for (var h in headers) {
        xhr.setRequestHeader(h, headers[h]);
      }
      xhr.send(data);
    };
    dispatch();

    return promise;
  },

  request(method, path, data, options) {
    options = options || {};
    var url = CoreManager.get('SERVER_URL');
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    url += path;

    var payload = {};
    if (data && typeof data === 'object') {
      for (var k in data) {
        payload[k] = data[k];
      }
    }

    if (method !== 'POST') {
      payload._method = method;
      method = 'POST';
    }

    payload._ApplicationId = CoreManager.get('APPLICATION_ID');
    let jsKey = CoreManager.get('JAVASCRIPT_KEY');
    if (jsKey) {
      payload._JavaScriptKey = jsKey;
    }
    payload._ClientVersion = CoreManager.get('VERSION');

    var useMasterKey = options.useMasterKey;
    if (typeof useMasterKey === 'undefined') {
      useMasterKey = CoreManager.get('USE_MASTER_KEY');
    }
    if (useMasterKey) {
      if (CoreManager.get('MASTER_KEY')) {
        delete payload._JavaScriptKey;
        payload._MasterKey = CoreManager.get('MASTER_KEY');
      } else {
        throw new Error('Cannot use the Master Key, it has not been provided.');
      }
    }

    if (CoreManager.get('FORCE_REVOCABLE_SESSION')) {
      payload._RevocableSession = '1';
    }

    var installationId = options.installationId;
    var installationIdPromise;
    if (installationId && typeof installationId === 'string') {
      installationIdPromise = ParsePromise.as(installationId);
    } else {
      var installationController = CoreManager.getInstallationController();
      installationIdPromise = installationController.currentInstallationId();
    }

    return installationIdPromise.then(iid => {
      payload._InstallationId = iid;
      var userController = CoreManager.getUserController();
      if (options && typeof options.sessionToken === 'string') {
        return ParsePromise.as(options.sessionToken);
      } else if (userController) {
        return userController.currentUserAsync().then(user => {
          if (user) {
            return ParsePromise.as(user.getSessionToken());
          }
          return ParsePromise.as(null);
        });
      }
      return ParsePromise.as(null);
    }).then(token => {
      if (token) {
        payload._SessionToken = token;
      }

      var payloadString = JSON.stringify(payload);

      return RESTController.ajax(method, url, payloadString);
    }).then(null, function (response) {
      // Transform the error into an instance of ParseError by trying to parse
      // the error string as JSON
      var error;
      if (response && response.responseText) {
        try {
          var errorJSON = JSON.parse(response.responseText);
          error = new ParseError(errorJSON.code, errorJSON.error);
        } catch (e) {
          // If we fail to parse the error text, that's okay.
          error = new ParseError(ParseError.INVALID_JSON, 'Received an error with invalid JSON from Parse: ' + response.responseText);
        }
      } else {
        error = new ParseError(ParseError.CONNECTION_FAILED, 'XMLHttpRequest failed: ' + JSON.stringify(response));
      }

      return ParsePromise.error(error);
    });
  },

  _setXHR(xhr) {
    XHR = xhr;
  }
};

module.exports = RESTController;