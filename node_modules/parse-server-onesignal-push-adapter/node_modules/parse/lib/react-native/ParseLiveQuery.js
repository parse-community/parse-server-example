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

import EventEmitter from './EventEmitter';
import LiveQueryClient from './LiveQueryClient';
import CoreManager from './CoreManager';
import ParsePromise from './ParsePromise';

function open() {
  const LiveQueryController = CoreManager.getLiveQueryController();
  LiveQueryController.open();
}

function close() {
  const LiveQueryController = CoreManager.getLiveQueryController();
  LiveQueryController.close();
}

/**
 *
 * We expose three events to help you monitor the status of the WebSocket connection:
 *
 * <p>Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 * 
 * <pre>
 * Parse.LiveQuery.on('open', () => {
 * 
 * });</pre></p>
 *
 * <p>Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 * 
 * <pre>
 * Parse.LiveQuery.on('close', () => {
 * 
 * });</pre></p>
 *
 * <p>Error - When some network error or LiveQuery server error happens, you'll get this event.
 * 
 * <pre>
 * Parse.LiveQuery.on('error', (error) => {
 * 
 * });</pre></p>
 * 
 * @class Parse.LiveQuery
 * @static
 * 
 */
let LiveQuery = new EventEmitter();

/**
 * After open is called, the LiveQuery will try to send a connect request
 * to the LiveQuery server.
 * 
 * @method open
 */
LiveQuery.open = open;

/**
 * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
 * This function will close the WebSocket connection to the LiveQuery server,
 * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
 * If you call query.subscribe() after this, we'll create a new WebSocket
 * connection to the LiveQuery server.
 * 
 * @method close
 */

LiveQuery.close = close;
// Register a default onError callback to make sure we do not crash on error
LiveQuery.on('error', () => {});

export default LiveQuery;

function getSessionToken() {
  const controller = CoreManager.getUserController();
  return controller.currentUserAsync().then(currentUser => {
    return currentUser ? currentUser.getSessionToken() : undefined;
  });
}

function getLiveQueryClient() {
  return CoreManager.getLiveQueryController().getDefaultLiveQueryClient();
}

let defaultLiveQueryClient;
const DefaultLiveQueryController = {
  setDefaultLiveQueryClient(liveQueryClient) {
    defaultLiveQueryClient = liveQueryClient;
  },
  getDefaultLiveQueryClient() {
    if (defaultLiveQueryClient) {
      return ParsePromise.as(defaultLiveQueryClient);
    }

    return getSessionToken().then(sessionToken => {
      let liveQueryServerURL = CoreManager.get('LIVEQUERY_SERVER_URL');

      if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
        throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
      }

      // If we can not find Parse.liveQueryServerURL, we try to extract it from Parse.serverURL
      if (!liveQueryServerURL) {
        const tempServerURL = CoreManager.get('SERVER_URL');
        let protocol = 'ws://';
        // If Parse is being served over SSL/HTTPS, ensure LiveQuery Server uses 'wss://' prefix
        if (tempServerURL.indexOf('https') === 0) {
          protocol = 'wss://';
        }
        const host = tempServerURL.replace(/^https?:\/\//, '');
        liveQueryServerURL = protocol + host;
        CoreManager.set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
      }

      const applicationId = CoreManager.get('APPLICATION_ID');
      const javascriptKey = CoreManager.get('JAVASCRIPT_KEY');
      const masterKey = CoreManager.get('MASTER_KEY');
      // Get currentUser sessionToken if possible
      defaultLiveQueryClient = new LiveQueryClient({
        applicationId,
        serverURL: liveQueryServerURL,
        javascriptKey,
        masterKey,
        sessionToken
      });
      // Register a default onError callback to make sure we do not crash on error
      // Cannot create these events on a nested way because of EventEmiiter from React Native
      defaultLiveQueryClient.on('error', error => {
        LiveQuery.emit('error', error);
      });
      defaultLiveQueryClient.on('open', () => {
        LiveQuery.emit('open');
      });
      defaultLiveQueryClient.on('close', () => {
        LiveQuery.emit('close');
      });

      return defaultLiveQueryClient;
    });
  },
  open() {
    getLiveQueryClient().then(liveQueryClient => {
      this.resolve(liveQueryClient.open());
    });
  },
  close() {
    getLiveQueryClient().then(liveQueryClient => {
      this.resolve(liveQueryClient.close());
    });
  },
  subscribe(query) {
    let subscriptionWrap = new EventEmitter();

    getLiveQueryClient().then(liveQueryClient => {
      if (liveQueryClient.shouldOpen()) {
        liveQueryClient.open();
      }
      let promiseSessionToken = getSessionToken();
      // new event emitter
      return promiseSessionToken.then(sessionToken => {

        let subscription = liveQueryClient.subscribe(query, sessionToken);
        // enter, leave create, etc

        subscriptionWrap.id = subscription.id;
        subscriptionWrap.query = subscription.query;
        subscriptionWrap.sessionToken = subscription.sessionToken;
        subscriptionWrap.unsubscribe = subscription.unsubscribe;
        // Cannot create these events on a nested way because of EventEmiiter from React Native
        subscription.on('open', () => {
          subscriptionWrap.emit('open');
        });
        subscription.on('create', object => {
          subscriptionWrap.emit('create', object);
        });
        subscription.on('update', object => {
          subscriptionWrap.emit('update', object);
        });
        subscription.on('enter', object => {
          subscriptionWrap.emit('enter', object);
        });
        subscription.on('leave', object => {
          subscriptionWrap.emit('leave', object);
        });
        subscription.on('delete', object => {
          subscriptionWrap.emit('delete', object);
        });

        this.resolve();
      });
    });
    return subscriptionWrap;
  },
  unsubscribe(subscription) {
    getLiveQueryClient().then(liveQueryClient => {
      this.resolve(liveQueryClient.unsubscribe(subscription));
    });
  },
  _clearCachedDefaultClient() {
    defaultLiveQueryClient = null;
  }
};

CoreManager.setLiveQueryController(DefaultLiveQueryController);