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

import ParsePromise from './ParsePromise';
// RN packager nonsense
import { AsyncStorage } from 'react-native/Libraries/react-native/react-native.js';

var StorageController = {
  async: 1,

  getItemAsync(path) {
    var p = new ParsePromise();
    AsyncStorage.getItem(path, function (err, value) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },

  setItemAsync(path, value) {
    var p = new ParsePromise();
    AsyncStorage.setItem(path, value, function (err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },

  removeItemAsync(path) {
    var p = new ParsePromise();
    AsyncStorage.removeItem(path, function (err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve();
      }
    });
    return p;
  },

  clear() {
    AsyncStorage.clear();
  }
};

module.exports = StorageController;