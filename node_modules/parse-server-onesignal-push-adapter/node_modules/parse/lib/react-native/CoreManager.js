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
  methods.forEach(func => {
    if (typeof controller[func] !== 'function') {
      throw new Error(`${ name } must implement ${ func }()`);
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

  setAnalyticsController(controller) {
    requireMethods('AnalyticsController', ['track'], controller);
    config['AnalyticsController'] = controller;
  },

  getAnalyticsController() {
    return config['AnalyticsController'];
  },

  setCloudController(controller) {
    requireMethods('CloudController', ['run'], controller);
    config['CloudController'] = controller;
  },

  getCloudController() {
    return config['CloudController'];
  },

  setConfigController(controller) {
    requireMethods('ConfigController', ['current', 'get'], controller);
    config['ConfigController'] = controller;
  },

  getConfigController() {
    return config['ConfigController'];
  },

  setFileController(controller) {
    requireMethods('FileController', ['saveFile', 'saveBase64'], controller);
    config['FileController'] = controller;
  },

  getFileController() {
    return config['FileController'];
  },

  setInstallationController(controller) {
    requireMethods('InstallationController', ['currentInstallationId'], controller);
    config['InstallationController'] = controller;
  },

  getInstallationController() {
    return config['InstallationController'];
  },

  setObjectController(controller) {
    requireMethods('ObjectController', ['save', 'fetch', 'destroy'], controller);
    config['ObjectController'] = controller;
  },

  getObjectController() {
    return config['ObjectController'];
  },

  setObjectStateController(controller) {
    requireMethods('ObjectStateController', ['getState', 'initializeState', 'removeState', 'getServerData', 'setServerData', 'getPendingOps', 'setPendingOp', 'pushPendingState', 'popPendingState', 'mergeFirstPendingState', 'getObjectCache', 'estimateAttribute', 'estimateAttributes', 'commitServerChanges', 'enqueueTask', 'clearAllState'], controller);

    config['ObjectStateController'] = controller;
  },

  getObjectStateController() {
    return config['ObjectStateController'];
  },

  setPushController(controller) {
    requireMethods('PushController', ['send'], controller);
    config['PushController'] = controller;
  },

  getPushController() {
    return config['PushController'];
  },

  setQueryController(controller) {
    requireMethods('QueryController', ['find'], controller);
    config['QueryController'] = controller;
  },

  getQueryController() {
    return config['QueryController'];
  },

  setRESTController(controller) {
    requireMethods('RESTController', ['request', 'ajax'], controller);
    config['RESTController'] = controller;
  },

  getRESTController() {
    return config['RESTController'];
  },

  setSessionController(controller) {
    requireMethods('SessionController', ['getSession'], controller);
    config['SessionController'] = controller;
  },

  getSessionController() {
    return config['SessionController'];
  },

  setStorageController(controller) {
    if (controller.async) {
      requireMethods('An async StorageController', ['getItemAsync', 'setItemAsync', 'removeItemAsync'], controller);
    } else {
      requireMethods('A synchronous StorageController', ['getItem', 'setItem', 'removeItem'], controller);
    }
    config['StorageController'] = controller;
  },

  getStorageController() {
    return config['StorageController'];
  },

  setUserController(controller) {
    requireMethods('UserController', ['setCurrentUser', 'currentUser', 'currentUserAsync', 'signUp', 'logIn', 'become', 'logOut', 'requestPasswordReset', 'upgradeToRevocableSession', 'linkWith'], controller);
    config['UserController'] = controller;
  },

  getUserController() {
    return config['UserController'];
  },

  setLiveQueryController(controller) {
    requireMethods('LiveQueryController', ['subscribe', 'unsubscribe', 'open', 'close'], controller);
    config['LiveQueryController'] = controller;
  },

  getLiveQueryController() {
    return config['LiveQueryController'];
  },

  setHooksController(controller) {
    requireMethods('HooksController', ['create', 'get', 'update', 'remove'], controller);
    config['HooksController'] = controller;
  },

  getHooksController() {
    return config['HooksController'];
  }
};