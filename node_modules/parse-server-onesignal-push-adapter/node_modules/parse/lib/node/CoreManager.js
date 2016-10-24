'use strict';

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

var config = {
  // Defaults
  IS_NODE: typeof process !== 'undefined' && !!process.versions && !!process.versions.node && !process.versions.electron,
  REQUEST_ATTEMPT_LIMIT: 5,
  SERVER_URL: 'https://api.parse.com/1',
  LIVEQUERY_SERVER_URL: null,
  VERSION: 'js' + '1.9.2',
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false
};

function requireMethods(name, methods, controller) {
  methods.forEach(function (func) {
    if (typeof controller[func] !== 'function') {
      throw new Error(name + ' must implement ' + func + '()');
    }
  });
}

module.exports = {
  get: function (key) {
    if (config.hasOwnProperty(key)) {
      return config[key];
    }
    throw new Error('Configuration key not found: ' + key);
  },

  set: function (key, value) {
    config[key] = value;
  },

  /* Specialized Controller Setters/Getters */

  setAnalyticsController: function (controller) {
    requireMethods('AnalyticsController', ['track'], controller);
    config['AnalyticsController'] = controller;
  },
  getAnalyticsController: function () {
    return config['AnalyticsController'];
  },
  setCloudController: function (controller) {
    requireMethods('CloudController', ['run'], controller);
    config['CloudController'] = controller;
  },
  getCloudController: function () {
    return config['CloudController'];
  },
  setConfigController: function (controller) {
    requireMethods('ConfigController', ['current', 'get'], controller);
    config['ConfigController'] = controller;
  },
  getConfigController: function () {
    return config['ConfigController'];
  },
  setFileController: function (controller) {
    requireMethods('FileController', ['saveFile', 'saveBase64'], controller);
    config['FileController'] = controller;
  },
  getFileController: function () {
    return config['FileController'];
  },
  setInstallationController: function (controller) {
    requireMethods('InstallationController', ['currentInstallationId'], controller);
    config['InstallationController'] = controller;
  },
  getInstallationController: function () {
    return config['InstallationController'];
  },
  setObjectController: function (controller) {
    requireMethods('ObjectController', ['save', 'fetch', 'destroy'], controller);
    config['ObjectController'] = controller;
  },
  getObjectController: function () {
    return config['ObjectController'];
  },
  setObjectStateController: function (controller) {
    requireMethods('ObjectStateController', ['getState', 'initializeState', 'removeState', 'getServerData', 'setServerData', 'getPendingOps', 'setPendingOp', 'pushPendingState', 'popPendingState', 'mergeFirstPendingState', 'getObjectCache', 'estimateAttribute', 'estimateAttributes', 'commitServerChanges', 'enqueueTask', 'clearAllState'], controller);

    config['ObjectStateController'] = controller;
  },
  getObjectStateController: function () {
    return config['ObjectStateController'];
  },
  setPushController: function (controller) {
    requireMethods('PushController', ['send'], controller);
    config['PushController'] = controller;
  },
  getPushController: function () {
    return config['PushController'];
  },
  setQueryController: function (controller) {
    requireMethods('QueryController', ['find'], controller);
    config['QueryController'] = controller;
  },
  getQueryController: function () {
    return config['QueryController'];
  },
  setRESTController: function (controller) {
    requireMethods('RESTController', ['request', 'ajax'], controller);
    config['RESTController'] = controller;
  },
  getRESTController: function () {
    return config['RESTController'];
  },
  setSessionController: function (controller) {
    requireMethods('SessionController', ['getSession'], controller);
    config['SessionController'] = controller;
  },
  getSessionController: function () {
    return config['SessionController'];
  },
  setStorageController: function (controller) {
    if (controller.async) {
      requireMethods('An async StorageController', ['getItemAsync', 'setItemAsync', 'removeItemAsync'], controller);
    } else {
      requireMethods('A synchronous StorageController', ['getItem', 'setItem', 'removeItem'], controller);
    }
    config['StorageController'] = controller;
  },
  getStorageController: function () {
    return config['StorageController'];
  },
  setUserController: function (controller) {
    requireMethods('UserController', ['setCurrentUser', 'currentUser', 'currentUserAsync', 'signUp', 'logIn', 'become', 'logOut', 'requestPasswordReset', 'upgradeToRevocableSession', 'linkWith'], controller);
    config['UserController'] = controller;
  },
  getUserController: function () {
    return config['UserController'];
  },
  setLiveQueryController: function (controller) {
    requireMethods('LiveQueryController', ['subscribe', 'unsubscribe', 'open', 'close'], controller);
    config['LiveQueryController'] = controller;
  },
  getLiveQueryController: function () {
    return config['LiveQueryController'];
  },
  setHooksController: function (controller) {
    requireMethods('HooksController', ['create', 'get', 'update', 'remove'], controller);
    config['HooksController'] = controller;
  },
  getHooksController: function () {
    return config['HooksController'];
  }
};