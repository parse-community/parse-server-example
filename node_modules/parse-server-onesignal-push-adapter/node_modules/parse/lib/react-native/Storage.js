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
import ParsePromise from './ParsePromise';

var Storage = {
  async() {
    var controller = CoreManager.getStorageController();
    return !!controller.async;
  },

  getItem(path) {
    var controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.getItem(path);
  },

  getItemAsync(path) {
    var controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.getItemAsync(path);
    }
    return ParsePromise.as(controller.getItem(path));
  },

  setItem(path, value) {
    var controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.setItem(path, value);
  },

  setItemAsync(path, value) {
    var controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.setItemAsync(path, value);
    }
    return ParsePromise.as(controller.setItem(path, value));
  },

  removeItem(path) {
    var controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.removeItem(path);
  },

  removeItemAsync(path) {
    var controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.removeItemAsync(path);
    }
    return ParsePromise.as(controller.removeItem(path));
  },

  generatePath(path) {
    if (!CoreManager.get('APPLICATION_ID')) {
      throw new Error('You need to call Parse.initialize before using Parse.');
    }
    if (typeof path !== 'string') {
      throw new Error('Tried to get a Storage path that was not a String.');
    }
    if (path[0] === '/') {
      path = path.substr(1);
    }
    return 'Parse/' + CoreManager.get('APPLICATION_ID') + '/' + path;
  },

  _clear() {
    var controller = CoreManager.getStorageController();
    if (controller.hasOwnProperty('clear')) {
      controller.clear();
    }
  }
};

module.exports = Storage;

CoreManager.setStorageController(require('./StorageController.react-native'));