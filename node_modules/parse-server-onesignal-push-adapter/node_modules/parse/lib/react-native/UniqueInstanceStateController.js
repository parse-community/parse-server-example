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

import * as ObjectStateMutations from './ObjectStateMutations';
import TaskQueue from './TaskQueue';

let objectState = new WeakMap();

export function getState(obj) {
  let classData = objectState.get(obj);
  return classData || null;
}

export function initializeState(obj, initial) {
  let state = getState(obj);
  if (state) {
    return state;
  }
  if (!initial) {
    initial = {
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    };
  }
  state = initial;
  objectState.set(obj, state);
  return state;
}

export function removeState(obj) {
  let state = getState(obj);
  if (state === null) {
    return null;
  }
  objectState.delete(obj);
  return state;
}

export function getServerData(obj) {
  let state = getState(obj);
  if (state) {
    return state.serverData;
  }
  return {};
}

export function setServerData(obj, attributes) {
  let serverData = initializeState(obj).serverData;
  ObjectStateMutations.setServerData(serverData, attributes);
}

export function getPendingOps(obj) {
  let state = getState(obj);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(obj, attr, op) {
  let pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.setPendingOp(pendingOps, attr, op);
}

export function pushPendingState(obj) {
  let pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.pushPendingState(pendingOps);
}

export function popPendingState(obj) {
  let pendingOps = initializeState(obj).pendingOps;
  return ObjectStateMutations.popPendingState(pendingOps);
}

export function mergeFirstPendingState(obj) {
  let pendingOps = getPendingOps(obj);
  ObjectStateMutations.mergeFirstPendingState(pendingOps);
}

export function getObjectCache(obj) {
  let state = getState(obj);
  if (state) {
    return state.objectCache;
  }
  return {};
}

export function estimateAttribute(obj, attr) {
  let serverData = getServerData(obj);
  let pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttribute(serverData, pendingOps, obj.className, obj.id, attr);
}

export function estimateAttributes(obj) {
  let serverData = getServerData(obj);
  let pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttributes(serverData, pendingOps, obj.className, obj.id);
}

export function commitServerChanges(obj, changes) {
  let state = initializeState(obj);
  ObjectStateMutations.commitServerChanges(state.serverData, state.objectCache, changes);
}

export function enqueueTask(obj, task) {
  let state = initializeState(obj);
  return state.tasks.enqueue(task);
}

export function duplicateState(source, dest) {
  let oldState = initializeState(source);
  let newState = initializeState(dest);
  for (let key in oldState.serverData) {
    newState.serverData[key] = oldState.serverData[key];
  }
  for (let index = 0; index < oldState.pendingOps.length; index++) {
    for (let key in oldState.pendingOps[index]) {
      newState.pendingOps[index][key] = oldState.pendingOps[index][key];
    }
  }
  for (let key in oldState.objectCache) {
    newState.objectCache[key] = oldState.objectCache[key];
  }
  newState.existed = oldState.existed;
}

export function clearAllState() {
  objectState = new WeakMap();
}