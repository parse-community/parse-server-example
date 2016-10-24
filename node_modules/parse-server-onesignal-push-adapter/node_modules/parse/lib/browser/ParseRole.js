'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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
var ParseRole = function (_ParseObject) {
  (0, _inherits3.default)(ParseRole, _ParseObject);

  function ParseRole(name, acl) {
    (0, _classCallCheck3.default)(this, ParseRole);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParseRole.__proto__ || (0, _getPrototypeOf2.default)(ParseRole)).call(this, '_Role'));

    if (typeof name === 'string' && acl instanceof _ParseACL2.default) {
      _this.setName(name);
      _this.setACL(acl);
    }
    return _this;
  }

  /**
   * Gets the name of the role.  You can alternatively call role.get("name")
   *
   * @method getName
   * @return {String} the name of the role.
   */

  (0, _createClass3.default)(ParseRole, [{
    key: 'getName',
    value: function () {
      var name = this.get('name');
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

  }, {
    key: 'setName',
    value: function (name, options) {
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

  }, {
    key: 'getUsers',
    value: function () {
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

  }, {
    key: 'getRoles',
    value: function () {
      return this.relation('roles');
    }
  }, {
    key: 'validate',
    value: function (attrs, options) {
      var isInvalid = (0, _get3.default)(ParseRole.prototype.__proto__ || (0, _getPrototypeOf2.default)(ParseRole.prototype), 'validate', this).call(this, attrs, options);
      if (isInvalid) {
        return isInvalid;
      }

      if ('name' in attrs && attrs.name !== this.getName()) {
        var newName = attrs.name;
        if (this.id && this.id !== attrs.objectId) {
          // Check to see if the objectId being set matches this.id
          // This happens during a fetch -- the id is set before calling fetch
          // Let the name be set in this case
          return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'A role\'s name can only be set before it has been saved.');
        }
        if (typeof newName !== 'string') {
          return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'A role\'s name must be a String.');
        }
        if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
          return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'A role\'s name can be only contain alphanumeric characters, _, ' + '-, and spaces.');
        }
      }
      return false;
    }
  }]);
  return ParseRole;
}(_ParseObject3.default); /**
                           * Copyright (c) 2015-present, Parse, LLC.
                           * All rights reserved.
                           *
                           * This source code is licensed under the BSD-style license found in the
                           * LICENSE file in the root directory of this source tree. An additional grant
                           * of patent rights can be found in the PATENTS file in the same directory.
                           *
                           * 
                           */

exports.default = ParseRole;

_ParseObject3.default.registerSubclass('_Role', ParseRole);