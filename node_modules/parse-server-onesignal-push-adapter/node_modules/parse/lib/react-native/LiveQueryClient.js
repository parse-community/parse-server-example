/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

import EventEmitter from './EventEmitter';
import ParsePromise from './ParsePromise';
import ParseObject from './ParseObject';
import LiveQuerySubscription from './LiveQuerySubscription';

// The LiveQuery client inner state
const CLIENT_STATE = {
  INITIALIZED: 'initialized',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected'
};

// The event type the LiveQuery client should sent to server
const OP_TYPES = {
  CONNECT: 'connect',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  ERROR: 'error'
};

// The event we get back from LiveQuery server
const OP_EVENTS = {
  CONNECTED: 'connected',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete'
};

// The event the LiveQuery client should emit
const CLIENT_EMMITER_TYPES = {
  CLOSE: 'close',
  ERROR: 'error',
  OPEN: 'open'
};

// The event the LiveQuery subscription should emit
const SUBSCRIPTION_EMMITER_TYPES = {
  OPEN: 'open',
  CLOSE: 'close',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete'
};

let generateInterval = k => {
  return Math.random() * Math.min(30, Math.pow(2, k) - 1) * 1000;
};

/**
 * Creates a new LiveQueryClient.
 * Extends events.EventEmitter
 * <a href="https://nodejs.org/api/events.html#events_class_eventemitter">cloud functions</a>.
 * 
 * A wrapper of a standard WebSocket client. We add several useful methods to 
 * help you connect/disconnect to LiveQueryServer, subscribe/unsubscribe a ParseQuery easily.
 *
 * javascriptKey and masterKey are used for verifying the LiveQueryClient when it tries
 * to connect to the LiveQuery server
 * 
 * @class Parse.LiveQueryClient
 * @constructor
 * @param {Object} options
 * @param {string} options.applicationId - applicationId of your Parse app
 * @param {string} options.serverURL - <b>the URL of your LiveQuery server</b>
 * @param {string} options.javascriptKey (optional)
 * @param {string} options.masterKey (optional) Your Parse Master Key. (Node.js only!)
 * @param {string} options.sessionToken (optional)
 *
 *
 * We expose three events to help you monitor the status of the LiveQueryClient.
 *
 * <pre>
 * let Parse = require('parse/node');
 * let LiveQueryClient = Parse.LiveQueryClient;
 * let client = new LiveQueryClient({
 *   applicationId: '',
 *   serverURL: '',
 *   javascriptKey: '',
 *   masterKey: ''
 *  });
 * </pre>
 * 
 * Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 * <pre>
 * client.on('open', () => {
 * 
 * });</pre>
 *
 * Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 * <pre>
 * client.on('close', () => {
 * 
 * });</pre>
 *
 * Error - When some network error or LiveQuery server error happens, you'll get this event.
 * <pre>
 * client.on('error', (error) => {
 * 
 * });</pre>
 * 
 * 
 */
export default class LiveQueryClient extends EventEmitter {

  constructor({
    applicationId,
    serverURL,
    javascriptKey,
    masterKey,
    sessionToken
  }) {
    super();

    if (!serverURL || serverURL.indexOf('ws') !== 0) {
      throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
    }

    this.reconnectHandle = null;
    this.attempts = 1;;
    this.id = 0;
    this.requestId = 1;
    this.serverURL = serverURL;
    this.applicationId = applicationId;
    this.javascriptKey = javascriptKey;
    this.masterKey = masterKey;
    this.sessionToken = sessionToken;
    this.connectPromise = new ParsePromise();
    this.subscriptions = new Map();
    this.state = CLIENT_STATE.INITIALIZED;
  }

  shouldOpen() {
    return this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED;
  }

  /**
   * Subscribes to a ParseQuery
   * 
   * If you provide the sessionToken, when the LiveQuery server gets ParseObject's 
   * updates from parse server, it'll try to check whether the sessionToken fulfills 
   * the ParseObject's ACL. The LiveQuery server will only send updates to clients whose 
   * sessionToken is fit for the ParseObject's ACL. You can check the LiveQuery protocol
   * <a href="https://github.com/ParsePlatform/parse-server/wiki/Parse-LiveQuery-Protocol-Specification">here</a> for more details. The subscription you get is the same subscription you get 
   * from our Standard API.
   * 
   * @method subscribe
   * @param {Object} query - the ParseQuery you want to subscribe to
   * @param {string} sessionToken (optional) 
   * @return {Object} subscription
   */
  subscribe(query, sessionToken) {
    if (!query) {
      return;
    }
    let where = query.toJSON().where;
    let className = query.className;
    let subscribeRequest = {
      op: OP_TYPES.SUBSCRIBE,
      requestId: this.requestId,
      query: {
        className,
        where
      }
    };

    if (sessionToken) {
      subscribeRequest.sessionToken = sessionToken;
    }

    let subscription = new LiveQuerySubscription(this.requestId, query, sessionToken);
    this.subscriptions.set(this.requestId, subscription);
    this.requestId += 1;
    this.connectPromise.then(() => {
      this.socket.send(JSON.stringify(subscribeRequest));
    });

    // adding listener so process does not crash
    // best practice is for developer to register their own listener
    subscription.on('error', () => {});

    return subscription;
  }

  /**
   * After calling unsubscribe you'll stop receiving events from the subscription object.
   * 
   * @method unsubscribe
   * @param {Object} subscription - subscription you would like to unsubscribe from.
   */
  unsubscribe(subscription) {
    if (!subscription) {
      return;
    }

    this.subscriptions.delete(subscription.id);
    let unsubscribeRequest = {
      op: OP_TYPES.UNSUBSCRIBE,
      requestId: subscription.id
    };
    this.connectPromise.then(() => {
      this.socket.send(JSON.stringify(unsubscribeRequest));
    });
  }

  /**
   * After open is called, the LiveQueryClient will try to send a connect request
   * to the LiveQuery server.
   * 
   * @method open
   */
  open() {
    let WebSocketImplementation = this._getWebSocketImplementation();
    if (!WebSocketImplementation) {
      this.emit(CLIENT_EMMITER_TYPES.ERROR, 'Can not find WebSocket implementation');
      return;
    }

    if (this.state !== CLIENT_STATE.RECONNECTING) {
      this.state = CLIENT_STATE.CONNECTING;
    }

    // Get WebSocket implementation
    this.socket = new WebSocketImplementation(this.serverURL);

    // Bind WebSocket callbacks
    this.socket.onopen = () => {
      this._handleWebSocketOpen();
    };

    this.socket.onmessage = event => {
      this._handleWebSocketMessage(event);
    };

    this.socket.onclose = () => {
      this._handleWebSocketClose();
    };

    this.socket.onerror = error => {
      this._handleWebSocketError(error);
    };
  }

  resubscribe() {
    this.subscriptions.forEach((subscription, requestId) => {
      let query = subscription.query;
      let where = query.toJSON().where;
      let className = query.className;
      let sessionToken = subscription.sessionToken;
      let subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId,
        query: {
          className,
          where
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      this.connectPromise.then(() => {
        this.socket.send(JSON.stringify(subscribeRequest));
      });
    });
  }

  /**
   * This method will close the WebSocket connection to this LiveQueryClient, 
   * cancel the auto reconnect and unsubscribe all subscriptions based on it.
   * 
   * @method close
   */
  close() {
    if (this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED) {
      return;
    }
    this.state = CLIENT_STATE.DISCONNECTED;
    this.socket.close();
    // Notify each subscription about the close
    for (let subscription of this.subscriptions.values()) {
      subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
    }
    this._handleReset();
    this.emit(CLIENT_EMMITER_TYPES.CLOSE);
  }

  _getWebSocketImplementation() {
    return WebSocket;
  }

  // ensure we start with valid state if connect is called again after close
  _handleReset() {
    this.attempts = 1;;
    this.id = 0;
    this.requestId = 1;
    this.connectPromise = new ParsePromise();
    this.subscriptions = new Map();
  }

  _handleWebSocketOpen() {
    this.attempts = 1;
    let connectRequest = {
      op: OP_TYPES.CONNECT,
      applicationId: this.applicationId,
      javascriptKey: this.javascriptKey,
      masterKey: this.masterKey,
      sessionToken: this.sessionToken
    };
    this.socket.send(JSON.stringify(connectRequest));
  }

  _handleWebSocketMessage(event) {
    let data = event.data;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    let subscription = null;
    if (data.requestId) {
      subscription = this.subscriptions.get(data.requestId);
    }
    switch (data.op) {
      case OP_EVENTS.CONNECTED:
        if (this.state === CLIENT_STATE.RECONNECTING) {
          this.resubscribe();
        }
        this.emit(CLIENT_EMMITER_TYPES.OPEN);
        this.id = data.clientId;
        this.connectPromise.resolve();
        this.state = CLIENT_STATE.CONNECTED;
        break;
      case OP_EVENTS.SUBSCRIBED:
        if (subscription) {
          subscription.emit(SUBSCRIPTION_EMMITER_TYPES.OPEN);
        }
        break;
      case OP_EVENTS.ERROR:
        if (data.requestId) {
          if (subscription) {
            subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR, data.error);
          }
        } else {
          this.emit(CLIENT_EMMITER_TYPES.ERROR, data.error);
        }
        break;
      case OP_EVENTS.UNSUBSCRIBED:
        // We have already deleted subscription in unsubscribe(), do nothing here
        break;
      default:
        // create, update, enter, leave, delete cases
        let className = data.object.className;
        // Delete the extrea __type and className fields during transfer to full JSON
        delete data.object.__type;
        delete data.object.className;
        let parseObject = new ParseObject(className);
        parseObject._finishFetch(data.object);
        if (!subscription) {
          break;
        }
        subscription.emit(data.op, parseObject);
    }
  }

  _handleWebSocketClose() {
    if (this.state === CLIENT_STATE.DISCONNECTED) {
      return;
    }
    this.state = CLIENT_STATE.CLOSED;
    this.emit(CLIENT_EMMITER_TYPES.CLOSE);
    // Notify each subscription about the close
    for (let subscription of this.subscriptions.values()) {
      subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
    }
    this._handleReconnect();
  }

  _handleWebSocketError(error) {
    this.emit(CLIENT_EMMITER_TYPES.ERROR, error);
    for (let subscription of this.subscriptions.values()) {
      subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR);
    }
    this._handleReconnect();
  }

  _handleReconnect() {
    // if closed or currently reconnecting we stop attempting to reconnect
    if (this.state === CLIENT_STATE.DISCONNECTED) {
      return;
    }

    this.state = CLIENT_STATE.RECONNECTING;
    let time = generateInterval(this.attempts);

    // handle case when both close/error occur at frequent rates we ensure we do not reconnect unnecessarily.
    // we're unable to distinguish different between close/error when we're unable to reconnect therefore
    // we try to reonnect in both cases
    // server side ws and browser WebSocket behave differently in when close/error get triggered

    if (this.reconnectHandle) {
      clearTimeout(this.reconnectHandle);
    }

    this.reconnectHandle = setTimeout((() => {
      this.attempts++;
      this.connectPromise = new ParsePromise();
      this.open();
    }).bind(this), time);
  }
}