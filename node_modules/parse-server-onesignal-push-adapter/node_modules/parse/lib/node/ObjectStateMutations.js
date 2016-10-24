'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.defaultState = defaultState;
exports.setServerData = setServerData;
exports.setPendingOp = setPendingOp;
exports.pushPendingState = pushPendingState;
exports.popPendingState = popPendingState;
exports.mergeFirstPendingState = mergeFirstPendingState;
exports.estimateAttribute = estimateAttribute;
exports.estimateAttributes = estimateAttributes;
exports.commitServerChanges = commitServerChanges;

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

var _TaskQueue = require('./TaskQueue');

var _TaskQueue2 = _interopRequireDefault(_TaskQueue);

var _ParseOp = require('./ParseOp');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function defaultState() {
  return {
    serverData: {},
    pendingOps: [{}],
    objectCache: {},
    tasks: new _TaskQueue2.default(),
    existed: false
  };
} /**
   * Copyright (c) 2015-present, Parse, LLC.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   */

function setServerData(serverData, attributes) {
  for (var _attr in attributes) {
    if (typeof attributes[_attr] !== 'undefined') {
      serverData[_attr] = attributes[_attr];
    } else {
      delete serverData[_attr];
    }
  }
}

function setPendingOp(pendingOps, attr, op) {
  var last = pendingOps.length - 1;
  if (op) {
    pendingOps[last][attr] = op;
  } else {
    delete pendingOps[last][attr];
  }
}

function pushPendingState(pendingOps) {
  pendingOps.push({});
}

function popPendingState(pendingOps) {
  var first = pendingOps.shift();
  if (!pendingOps.length) {
    pendingOps[0] = {};
  }
  return first;
}

function mergeFirstPendingState(pendingOps) {
  var first = popPendingState(pendingOps);
  var next = pendingOps[0];
  for (var _attr2 in first) {
    if (next[_attr2] && first[_attr2]) {
      var merged = next[_attr2].mergeWith(first[_attr2]);
      if (merged) {
        next[_attr2] = merged;
      }
    } else {
      next[_attr2] = first[_attr2];
    }
  }
}

function estimateAttribute(serverData, pendingOps, className, id, attr) {
  var value = serverData[attr];
  for (var i = 0; i < pendingOps.length; i++) {
    if (pendingOps[i][attr]) {
      if (pendingOps[i][attr] instanceof _ParseOp.RelationOp) {
        if (id) {
          value = pendingOps[i][attr].applyTo(value, { className: className, id: id }, attr);
        }
      } else {
        value = pendingOps[i][attr].applyTo(value);
      }
    }
  }
  return value;
}

function estimateAttributes(serverData, pendingOps, className, id) {
  var data = {};
  var attr = void 0;
  for (attr in serverData) {
    data[attr] = serverData[attr];
  }
  for (var i = 0; i < pendingOps.length; i++) {
    for (attr in pendingOps[i]) {
      if (pendingOps[i][attr] instanceof _ParseOp.RelationOp) {
        if (id) {
          data[attr] = pendingOps[i][attr].applyTo(data[attr], { className: className, id: id }, attr);
        }
      } else {
        data[attr] = pendingOps[i][attr].applyTo(data[attr]);
      }
    }
  }
  return data;
}

function commitServerChanges(serverData, objectCache, changes) {
  for (var _attr3 in changes) {
    var val = changes[_attr3];
    serverData[_attr3] = val;
    if (val && (typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val)) === 'object' && !(val instanceof _ParseObject2.default) && !(val instanceof _ParseFile2.default) && !(val instanceof _ParseRelation2.default)) {
      var json = (0, _encode2.default)(val, false, true);
      objectCache[_attr3] = (0, _stringify2.default)(json);
    }
  }
}