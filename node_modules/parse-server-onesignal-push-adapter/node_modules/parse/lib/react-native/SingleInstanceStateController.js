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

let objectState = {};

export function getState(obj) {
  let classData = objectState[obj.className];
  if (classData) {
    return classData[obj.id] || null;
  }
  return null;
}

export function initializeState(obj, initial) {
  let state = getState(obj);
  if (state) {
    return state;
  }
  if (!objectState[obj.className]) {
    objectState[obj.className] = {};
  }
  if (!initial) {
    initial = ObjectStateMutations.defaultState();
  }
  state = objectState[obj.className][obj.id] = initial;
  return state;
}

export function removeState(obj) {
  let state = getState(obj);
  if (state === null) {
    return null;
  }
  delete objectState[obj.className][obj.id];
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

export function clearAllState() {
  objectState = {};
}

export function duplicateState(source, dest) {
  dest.id = source.id;
}