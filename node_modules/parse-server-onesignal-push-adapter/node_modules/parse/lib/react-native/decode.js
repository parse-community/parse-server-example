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

import ParseACL from './ParseACL';
import ParseFile from './ParseFile';
import ParseGeoPoint from './ParseGeoPoint';
import ParseObject from './ParseObject';
import { opFromJSON } from './ParseOp';
import ParseRelation from './ParseRelation';

export default function decode(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    var dup = [];
    value.forEach((v, i) => {
      dup[i] = decode(v);
    });
    return dup;
  }
  if (typeof value.__op === 'string') {
    return opFromJSON(value);
  }
  if (value.__type === 'Pointer' && value.className) {
    return ParseObject.fromJSON(value);
  }
  if (value.__type === 'Object' && value.className) {
    return ParseObject.fromJSON(value);
  }
  if (value.__type === 'Relation') {
    // The parent and key fields will be populated by the parent
    var relation = new ParseRelation(null, null);
    relation.targetClassName = value.className;
    return relation;
  }
  if (value.__type === 'Date') {
    return new Date(value.iso);
  }
  if (value.__type === 'File') {
    return ParseFile.fromJSON(value);
  }
  if (value.__type === 'GeoPoint') {
    return new ParseGeoPoint({
      latitude: value.latitude,
      longitude: value.longitude
    });
  }
  var copy = {};
  for (var k in value) {
    copy[k] = decode(value[k]);
  }
  return copy;
}