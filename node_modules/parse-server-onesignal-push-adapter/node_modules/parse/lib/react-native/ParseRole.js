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
import ParseError from './ParseError';
import ParseObject from './ParseObject';

/**
 * Represents a Role on the Parse server. Roles represent groupings of
 * Users for the purposes of granting permissions (e.g. specifying an ACL
 * for an Object). Roles are specified by their sets of child users and
 * child roles, all of which are granted any permissions that the parent
 * role has.
 *
 * <p>Roles must have a name (which cannot be changed after creation of the
 * role), and must specify an ACL.</p>
 * @class Parse.Role
 * @constructor
 * @param {String} name The name of the Role to create.
 * @param {Parse.ACL} acl The ACL for this role. Roles must have an ACL.
 * A Parse.Role is a local representation of a role persisted to the Parse
 * cloud.
 */
export default class ParseRole extends ParseObject {
  constructor(name, acl) {
    super('_Role');
    if (typeof name === 'string' && acl instanceof ParseACL) {
      this.setName(name);
      this.setACL(acl);
    }
  }

  /**
   * Gets the name of the role.  You can alternatively call role.get("name")
   *
   * @method getName
   * @return {String} the name of the role.
   */
  getName() {
    const name = this.get('name');
    if (name == null || typeof name === 'string') {
      return name;
    }
    return '';
  }

  /**
   * Sets the name for a role. This value must be set before the role has
   * been saved to the server, and cannot be set once the role has been
   * saved.
   *
   * <p>
   *   A role's name can only contain alphanumeric characters, _, -, and
   *   spaces.
   * </p>
   *
   * <p>This is equivalent to calling role.set("name", name)</p>
   *
   * @method setName
   * @param {String} name The name of the role.
   * @param {Object} options Standard options object with success and error
   *     callbacks.
   */
  setName(name, options) {
    return this.set('name', name, options);
  }

  /**
   * Gets the Parse.Relation for the Parse.Users that are direct
   * children of this role. These users are granted any privileges that this
   * role has been granted (e.g. read or write access through ACLs). You can
   * add or remove users from the role through this relation.
   *
   * <p>This is equivalent to calling role.relation("users")</p>
   *
   * @method getUsers
   * @return {Parse.Relation} the relation for the users belonging to this
   *     role.
   */
  getUsers() {
    return this.relation('users');
  }

  /**
   * Gets the Parse.Relation for the Parse.Roles that are direct
   * children of this role. These roles' users are granted any privileges that
   * this role has been granted (e.g. read or write access through ACLs). You
   * can add or remove child roles from this role through this relation.
   *
   * <p>This is equivalent to calling role.relation("roles")</p>
   *
   * @method getRoles
   * @return {Parse.Relation} the relation for the roles belonging to this
   *     role.
   */
  getRoles() {
    return this.relation('roles');
  }

  validate(attrs, options) {
    var isInvalid = super.validate(attrs, options);
    if (isInvalid) {
      return isInvalid;
    }

    if ('name' in attrs && attrs.name !== this.getName()) {
      var newName = attrs.name;
      if (this.id && this.id !== attrs.objectId) {
        // Check to see if the objectId being set matches this.id
        // This happens during a fetch -- the id is set before calling fetch
        // Let the name be set in this case
        return new ParseError(ParseError.OTHER_CAUSE, 'A role\'s name can only be set before it has been saved.');
      }
      if (typeof newName !== 'string') {
        return new ParseError(ParseError.OTHER_CAUSE, 'A role\'s name must be a String.');
      }
      if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
        return new ParseError(ParseError.OTHER_CAUSE, 'A role\'s name can be only contain alphanumeric characters, _, ' + '-, and spaces.');
      }
    }
    return false;
  }
}

ParseObject.registerSubclass('_Role', ParseRole);