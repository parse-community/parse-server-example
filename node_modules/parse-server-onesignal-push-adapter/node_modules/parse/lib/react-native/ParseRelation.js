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

import { RelationOp } from './ParseOp';
import ParseObject from './ParseObject';
import ParseQuery from './ParseQuery';

/**
 * Creates a new Relation for the given parent object and key. This
 * constructor should rarely be used directly, but rather created by
 * Parse.Object.relation.
 * @class Parse.Relation
 * @constructor
 * @param {Parse.Object} parent The parent of this relation.
 * @param {String} key The key for this relation on the parent.
 *
 * <p>
 * A class that is used to access all of the children of a many-to-many
 * relationship.  Each instance of Parse.Relation is associated with a
 * particular parent object and key.
 * </p>
 */
export default class ParseRelation {

  constructor(parent, key) {
    this.parent = parent;
    this.key = key;
    this.targetClassName = null;
  }

  /**
   * Makes sure that this relation has the right parent and key.
   */
  _ensureParentAndKey(parent, key) {
    this.key = this.key || key;
    if (this.key !== key) {
      throw new Error('Internal Error. Relation retrieved from two different keys.');
    }
    if (this.parent) {
      if (this.parent.className !== parent.className) {
        throw new Error('Internal Error. Relation retrieved from two different Objects.');
      }
      if (this.parent.id) {
        if (this.parent.id !== parent.id) {
          throw new Error('Internal Error. Relation retrieved from two different Objects.');
        }
      } else if (parent.id) {
        this.parent = parent;
      }
    } else {
      this.parent = parent;
    }
  }

  /**
   * Adds a Parse.Object or an array of Parse.Objects to the relation.
   * @method add
   * @param {} objects The item or items to add.
   */
  add(objects) {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    var change = new RelationOp(objects, []);
    var parent = this.parent;
    if (!parent) {
      throw new Error('Cannot add to a Relation without a parent');
    }
    parent.set(this.key, change);
    this.targetClassName = change._targetClassName;
    return parent;
  }

  /**
   * Removes a Parse.Object or an array of Parse.Objects from this relation.
   * @method remove
   * @param {} objects The item or items to remove.
   */
  remove(objects) {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    var change = new RelationOp([], objects);
    if (!this.parent) {
      throw new Error('Cannot remove from a Relation without a parent');
    }
    this.parent.set(this.key, change);
    this.targetClassName = change._targetClassName;
  }

  /**
   * Returns a JSON version of the object suitable for saving to disk.
   * @method toJSON
   * @return {Object}
   */
  toJSON() {
    return {
      __type: 'Relation',
      className: this.targetClassName
    };
  }

  /**
   * Returns a Parse.Query that is limited to objects in this
   * relation.
   * @method query
   * @return {Parse.Query}
   */
  query() {
    var query;
    var parent = this.parent;
    if (!parent) {
      throw new Error('Cannot construct a query for a Relation without a parent');
    }
    if (!this.targetClassName) {
      query = new ParseQuery(parent.className);
      query._extraOptions.redirectClassNameForKey = this.key;
    } else {
      query = new ParseQuery(this.targetClassName);
    }
    query._addCondition('$relatedTo', 'object', {
      __type: 'Pointer',
      className: parent.className,
      objectId: parent.id
    });
    query._addCondition('$relatedTo', 'key', this.key);

    return query;
  }
}