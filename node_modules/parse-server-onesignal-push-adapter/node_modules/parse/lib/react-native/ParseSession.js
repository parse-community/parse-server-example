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
import isRevocableSession from './isRevocableSession';
import ParseObject from './ParseObject';
import ParsePromise from './ParsePromise';
import ParseUser from './ParseUser';

/**
 * @class Parse.Session
 * @constructor
 *
 * <p>A Parse.Session object is a local representation of a revocable session.
 * This class is a subclass of a Parse.Object, and retains the same
 * functionality of a Parse.Object.</p>
 */
export default class ParseSession extends ParseObject {
  constructor(attributes) {
    super('_Session');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
  }

  /**
   * Returns the session token string.
   * @method getSessionToken
   * @return {String}
   */
  getSessionToken() {
    const token = this.get('sessionToken');
    if (typeof token === 'string') {
      return token;
    }
    return '';
  }

  static readOnlyAttributes() {
    return ['createdWith', 'expiresAt', 'installationId', 'restricted', 'sessionToken', 'user'];
  }

  /**
   * Retrieves the Session object for the currently logged in session.
   * @method current
   * @static
   * @return {Parse.Promise} A promise that is resolved with the Parse.Session
   *   object after it has been fetched. If there is no current user, the
   *   promise will be rejected.
   */
  static current(options) {
    options = options || {};
    var controller = CoreManager.getSessionController();

    var sessionOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      sessionOptions.useMasterKey = options.useMasterKey;
    }
    return ParseUser.currentAsync().then(user => {
      if (!user) {
        return ParsePromise.error('There is no current user.');
      }
      user.getSessionToken();

      sessionOptions.sessionToken = user.getSessionToken();
      return controller.getSession(sessionOptions);
    });
  }

  /**
   * Determines whether the current session token is revocable.
   * This method is useful for migrating Express.js or Node.js web apps to
   * use revocable sessions. If you are migrating an app that uses the Parse
   * SDK in the browser only, please use Parse.User.enableRevocableSession()
   * instead, so that sessions can be automatically upgraded.
   * @method isCurrentSessionRevocable
   * @static
   * @return {Boolean}
   */
  static isCurrentSessionRevocable() {
    var currentUser = ParseUser.current();
    if (currentUser) {
      return isRevocableSession(currentUser.getSessionToken() || '');
    }
    return false;
  }
}

ParseObject.registerSubclass('_Session', ParseSession);

var DefaultController = {
  getSession(options) {
    var RESTController = CoreManager.getRESTController();
    var session = new ParseSession();

    return RESTController.request('GET', 'sessions/me', {}, options).then(sessionData => {
      session._finishFetch(sessionData);
      session._setExisted(true);
      return session;
    });
  }
};

CoreManager.setSessionController(DefaultController);