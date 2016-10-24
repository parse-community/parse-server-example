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

import encode from './encode';
import ParseFile from './ParseFile';
import ParseObject from './ParseObject';
import ParsePromise from './ParsePromise';
import ParseRelation from './ParseRelation';
import TaskQueue from './TaskQueue';
import { RelationOp } from './ParseOp';

export function defaultState() {
  return {
    serverData: {},
    pendingOps: [{}],
    objectCache: {},
    tasks: new TaskQueue(),
    existed: false
  };
}

export function setServerData(serverData, attributes) {
  for (let attr in attributes) {
    if (typeof attributes[attr] !== 'undefined') {
      serverData[attr] = attributes[attr];
    } else {
      delete serverData[attr];
    }
  }
}

export function setPendingOp(pendingOps, attr, op) {
  let last = pendingOps.length - 1;
  if (op) {
    pendingOps[last][attr] = op;
  } else {
    delete pendingOps[last][attr];
  }
}

export function pushPendingState(pendingOps) {
  pendingOps.push({});
}

export function popPendingState(pendingOps) {
  let first = pendingOps.shift();
  if (!pendingOps.length) {
    pendingOps[0] = {};
  }
  return first;
}

export function mergeFirstPendingState(pendingOps) {
  let first = popPendingState(pendingOps);
  let next = pendingOps[0];
  for (let attr in first) {
    if (next[attr] && first[attr]) {
      let merged = next[attr].mergeWith(first[attr]);
      if (merged) {
        next[attr] = merged;
      }
    } else {
      next[attr] = first[attr];
    }
  }
}

export function estimateAttribute(serverData, pendingOps, className, id, attr) {
  let value = serverData[attr];
  for (let i = 0; i < pendingOps.length; i++) {
    if (pendingOps[i][attr]) {
      if (pendingOps[i][attr] instanceof RelationOp) {
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

export function estimateAttributes(serverData, pendingOps, className, id) {
  let data = {};

  for (var attr in serverData) {
    data[attr] = serverData[attr];
  }
  for (let i = 0; i < pendingOps.length; i++) {
    for (attr in pendingOps[i]) {
      if (pendingOps[i][attr] instanceof RelationOp) {
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

export function commitServerChanges(serverData, objectCache, changes) {
  for (let attr in changes) {
    let val = changes[attr];
    serverData[attr] = val;
    if (val && typeof val === 'object' && !(val instanceof ParseObject) && !(val instanceof ParseFile) && !(val instanceof ParseRelation)) {
      let json = encode(val, false, true);
      objectCache[attr] = JSON.stringify(json);
    }
  }
}