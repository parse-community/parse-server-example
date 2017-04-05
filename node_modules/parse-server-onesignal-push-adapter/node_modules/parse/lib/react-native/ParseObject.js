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
import canBeSerialized from './canBeSerialized';
import decode from './decode';
import encode from './encode';
import equals from './equals';
import escape from './escape';
import ParseACL from './ParseACL';
import parseDate from './parseDate';
import ParseError from './ParseError';
import ParseFile from './ParseFile';
import { opFromJSON, Op, SetOp, UnsetOp, IncrementOp, AddOp, AddUniqueOp, RemoveOp, RelationOp } from './ParseOp';
import ParsePromise from './ParsePromise';
import ParseQuery from './ParseQuery';
import ParseRelation from './ParseRelation';
import * as SingleInstanceStateController from './SingleInstanceStateController';
import unique from './unique';
import * as UniqueInstanceStateController from './UniqueInstanceStateController';
import unsavedChildren from './unsavedChildren';

// Mapping of class names to constructors, so we can populate objects from the
// server with appropriate subclasses of ParseObject
var classMap = {};

// Global counter for generating unique local Ids
var localCount = 0;
// Global counter for generating unique Ids for non-single-instance objects
var objectCount = 0;
// On web clients, objects are single-instance: any two objects with the same Id
// will have the same attributes. However, this may be dangerous default
// behavior in a server scenario
var singleInstance = !CoreManager.get('IS_NODE');
if (singleInstance) {
  CoreManager.setObjectStateController(SingleInstanceStateController);
} else {
  CoreManager.setObjectStateController(UniqueInstanceStateController);
}

function getServerUrlPath() {
  var serverUrl = CoreManager.get('SERVER_URL');
  if (serverUrl[serverUrl.length - 1] !== '/') {
    serverUrl += '/';
  }
  var url = serverUrl.replace(/https?:\/\//, '');
  return url.substr(url.indexOf('/'));
}

/**
 * Creates a new model with defined attributes.
 *
 * <p>You won't normally call this method directly.  It is recommended that
 * you use a subclass of <code>Parse.Object</code> instead, created by calling
 * <code>extend</code>.</p>
 *
 * <p>However, if you don't want to use a subclass, or aren't sure which
 * subclass is appropriate, you can use this form:<pre>
 *     var object = new Parse.Object("ClassName");
 * </pre>
 * That is basically equivalent to:<pre>
 *     var MyClass = Parse.Object.extend("ClassName");
 *     var object = new MyClass();
 * </pre></p>
 *
 * @class Parse.Object
 * @constructor
 * @param {String} className The class name for the object
 * @param {Object} attributes The initial set of data to store in the object.
 * @param {Object} options The options for this object instance.
 */
export default class ParseObject {
  /**
   * The ID of this object, unique within its class.
   * @property id
   * @type String
   */
  constructor(className, attributes, options) {
    // Enable legacy initializers
    if (typeof this.initialize === 'function') {
      this.initialize.apply(this, arguments);
    }

    var toSet = null;
    this._objCount = objectCount++;
    if (typeof className === 'string') {
      this.className = className;
      if (attributes && typeof attributes === 'object') {
        toSet = attributes;
      }
    } else if (className && typeof className === 'object') {
      this.className = className.className;
      toSet = {};
      for (var attr in className) {
        if (attr !== 'className') {
          toSet[attr] = className[attr];
        }
      }
      if (attributes && typeof attributes === 'object') {
        options = attributes;
      }
    }
    if (toSet && !this.set(toSet, options)) {
      throw new Error('Can\'t create an invalid Parse Object');
    }
  }

  /** Prototype getters / setters **/

  get attributes() {
    let stateController = CoreManager.getObjectStateController();
    return Object.freeze(stateController.estimateAttributes(this._getStateIdentifier()));
  }

  /**
   * The first time this object was saved on the server.
   * @property createdAt
   * @type Date
   */
  get createdAt() {
    return this._getServerData().createdAt;
  }

  /**
   * The last time this object was updated on the server.
   * @property updatedAt
   * @type Date
   */
  get updatedAt() {
    return this._getServerData().updatedAt;
  }

  /** Private methods **/

  /**
   * Returns a local or server Id used uniquely identify this object
   */
  _getId() {
    if (typeof this.id === 'string') {
      return this.id;
    }
    if (typeof this._localId === 'string') {
      return this._localId;
    }
    var localId = 'local' + String(localCount++);
    this._localId = localId;
    return localId;
  }

  /**
   * Returns a unique identifier used to pull data from the State Controller.
   */
  _getStateIdentifier() {
    if (singleInstance) {
      let id = this.id;
      if (!id) {
        id = this._getId();
      }
      return {
        id: id,
        className: this.className
      };
    } else {
      return this;
    }
  }

  _getServerData() {
    let stateController = CoreManager.getObjectStateController();
    return stateController.getServerData(this._getStateIdentifier());
  }

  _clearServerData() {
    var serverData = this._getServerData();
    var unset = {};
    for (var attr in serverData) {
      unset[attr] = undefined;
    }
    let stateController = CoreManager.getObjectStateController();
    stateController.setServerData(this._getStateIdentifier(), unset);
  }

  _getPendingOps() {
    let stateController = CoreManager.getObjectStateController();
    return stateController.getPendingOps(this._getStateIdentifier());
  }

  _clearPendingOps() {
    var pending = this._getPendingOps();
    var latest = pending[pending.length - 1];
    var keys = Object.keys(latest);
    keys.forEach(key => {
      delete latest[key];
    });
  }

  _getDirtyObjectAttributes() {
    var attributes = this.attributes;
    var stateController = CoreManager.getObjectStateController();
    var objectCache = stateController.getObjectCache(this._getStateIdentifier());
    var dirty = {};
    for (var attr in attributes) {
      var val = attributes[attr];
      if (val && typeof val === 'object' && !(val instanceof ParseObject) && !(val instanceof ParseFile) && !(val instanceof ParseRelation)) {
        // Due to the way browsers construct maps, the key order will not change
        // unless the object is changed
        try {
          var json = encode(val, false, true);
          var stringified = JSON.stringify(json);
          if (objectCache[attr] !== stringified) {
            dirty[attr] = val;
          }
        } catch (e) {
          // Error occurred, possibly by a nested unsaved pointer in a mutable container
          // No matter how it happened, it indicates a change in the attribute
          dirty[attr] = val;
        }
      }
    }
    return dirty;
  }

  _toFullJSON(seen) {
    var json = this.toJSON(seen);
    json.__type = 'Object';
    json.className = this.className;
    return json;
  }

  _getSaveJSON() {
    var pending = this._getPendingOps();
    var dirtyObjects = this._getDirtyObjectAttributes();
    var json = {};

    for (var attr in dirtyObjects) {
      json[attr] = new SetOp(dirtyObjects[attr]).toJSON();
    }
    for (attr in pending[0]) {
      json[attr] = pending[0][attr].toJSON();
    }
    return json;
  }

  _getSaveParams() {
    var method = this.id ? 'PUT' : 'POST';
    var body = this._getSaveJSON();
    var path = 'classes/' + this.className;
    if (this.id) {
      path += '/' + this.id;
    } else if (this.className === '_User') {
      path = 'users';
    }
    return {
      method,
      body,
      path
    };
  }

  _finishFetch(serverData) {
    if (!this.id && serverData.objectId) {
      this.id = serverData.objectId;
    }
    let stateController = CoreManager.getObjectStateController();
    stateController.initializeState(this._getStateIdentifier());
    var decoded = {};
    for (var attr in serverData) {
      if (attr === 'ACL') {
        decoded[attr] = new ParseACL(serverData[attr]);
      } else if (attr !== 'objectId') {
        decoded[attr] = decode(serverData[attr]);
        if (decoded[attr] instanceof ParseRelation) {
          decoded[attr]._ensureParentAndKey(this, attr);
        }
      }
    }
    if (decoded.createdAt && typeof decoded.createdAt === 'string') {
      decoded.createdAt = parseDate(decoded.createdAt);
    }
    if (decoded.updatedAt && typeof decoded.updatedAt === 'string') {
      decoded.updatedAt = parseDate(decoded.updatedAt);
    }
    if (!decoded.updatedAt && decoded.createdAt) {
      decoded.updatedAt = decoded.createdAt;
    }
    stateController.commitServerChanges(this._getStateIdentifier(), decoded);
  }

  _setExisted(existed) {
    let stateController = CoreManager.getObjectStateController();
    let state = stateController.getState(this._getStateIdentifier());
    if (state) {
      state.existed = existed;
    }
  }

  _migrateId(serverId) {
    if (this._localId && serverId) {
      if (singleInstance) {
        let stateController = CoreManager.getObjectStateController();
        let oldState = stateController.removeState(this._getStateIdentifier());
        this.id = serverId;
        delete this._localId;
        if (oldState) {
          stateController.initializeState(this._getStateIdentifier(), oldState);
        }
      } else {
        this.id = serverId;
        delete this._localId;
      }
    }
  }

  _handleSaveResponse(response, status) {
    var changes = {};

    var stateController = CoreManager.getObjectStateController();
    var pending = stateController.popPendingState(this._getStateIdentifier());
    for (var attr in pending) {
      if (pending[attr] instanceof RelationOp) {
        changes[attr] = pending[attr].applyTo(undefined, this, attr);
      } else if (!(attr in response)) {
        // Only SetOps and UnsetOps should not come back with results
        changes[attr] = pending[attr].applyTo(undefined);
      }
    }
    for (attr in response) {
      if ((attr === 'createdAt' || attr === 'updatedAt') && typeof response[attr] === 'string') {
        changes[attr] = parseDate(response[attr]);
      } else if (attr === 'ACL') {
        changes[attr] = new ParseACL(response[attr]);
      } else if (attr !== 'objectId') {
        changes[attr] = decode(response[attr]);
        if (changes[attr] instanceof UnsetOp) {
          changes[attr] = undefined;
        }
      }
    }
    if (changes.createdAt && !changes.updatedAt) {
      changes.updatedAt = changes.createdAt;
    }

    this._migrateId(response.objectId);

    if (status !== 201) {
      this._setExisted(true);
    }

    stateController.commitServerChanges(this._getStateIdentifier(), changes);
  }

  _handleSaveError() {
    this._getPendingOps();

    let stateController = CoreManager.getObjectStateController();
    stateController.mergeFirstPendingState(this._getStateIdentifier());
  }

  /** Public methods **/

  initialize() {}
  // NOOP


  /**
   * Returns a JSON version of the object suitable for saving to Parse.
   * @method toJSON
   * @return {Object}
   */
  toJSON(seen) {
    var seenEntry = this.id ? this.className + ':' + this.id : this;
    var seen = seen || [seenEntry];
    var json = {};
    var attrs = this.attributes;
    for (var attr in attrs) {
      if ((attr === 'createdAt' || attr === 'updatedAt') && attrs[attr].toJSON) {
        json[attr] = attrs[attr].toJSON();
      } else {
        json[attr] = encode(attrs[attr], false, false, seen);
      }
    }
    var pending = this._getPendingOps();
    for (var attr in pending[0]) {
      json[attr] = pending[0][attr].toJSON();
    }

    if (this.id) {
      json.objectId = this.id;
    }
    return json;
  }

  /**
   * Determines whether this ParseObject is equal to another ParseObject
   * @method equals
   * @return {Boolean}
   */
  equals(other) {
    if (this === other) {
      return true;
    }
    return other instanceof ParseObject && this.className === other.className && this.id === other.id && typeof this.id !== 'undefined';
  }

  /**
   * Returns true if this object has been modified since its last
   * save/refresh.  If an attribute is specified, it returns true only if that
   * particular attribute has been modified since the last save/refresh.
   * @method dirty
   * @param {String} attr An attribute name (optional).
   * @return {Boolean}
   */
  dirty(attr) {
    if (!this.id) {
      return true;
    }
    var pendingOps = this._getPendingOps();
    var dirtyObjects = this._getDirtyObjectAttributes();
    if (attr) {
      if (dirtyObjects.hasOwnProperty(attr)) {
        return true;
      }
      for (var i = 0; i < pendingOps.length; i++) {
        if (pendingOps[i].hasOwnProperty(attr)) {
          return true;
        }
      }
      return false;
    }
    if (Object.keys(pendingOps[0]).length !== 0) {
      return true;
    }
    if (Object.keys(dirtyObjects).length !== 0) {
      return true;
    }
    return false;
  }

  /**
   * Returns an array of keys that have been modified since last save/refresh
   * @method dirtyKeys
   * @return {Array of string}
   */
  dirtyKeys() {
    var pendingOps = this._getPendingOps();
    var keys = {};
    for (var i = 0; i < pendingOps.length; i++) {
      for (var attr in pendingOps[i]) {
        keys[attr] = true;
      }
    }
    var dirtyObjects = this._getDirtyObjectAttributes();
    for (var attr in dirtyObjects) {
      keys[attr] = true;
    }
    return Object.keys(keys);
  }

  /**
   * Gets a Pointer referencing this Object.
   * @method toPointer
   * @return {Object}
   */
  toPointer() {
    if (!this.id) {
      throw new Error('Cannot create a pointer to an unsaved ParseObject');
    }
    return {
      __type: 'Pointer',
      className: this.className,
      objectId: this.id
    };
  }

  /**
   * Gets the value of an attribute.
   * @method get
   * @param {String} attr The string name of an attribute.
   */
  get(attr) {
    return this.attributes[attr];
  }

  /**
   * Gets a relation on the given class for the attribute.
   * @method relation
   * @param String attr The attribute to get the relation for.
   */
  relation(attr) {
    var value = this.get(attr);
    if (value) {
      if (!(value instanceof ParseRelation)) {
        throw new Error('Called relation() on non-relation field ' + attr);
      }
      value._ensureParentAndKey(this, attr);
      return value;
    }
    return new ParseRelation(this, attr);
  }

  /**
   * Gets the HTML-escaped value of an attribute.
   * @method escape
   * @param {String} attr The string name of an attribute.
   */
  escape(attr) {
    var val = this.attributes[attr];
    if (val == null) {
      return '';
    }

    if (typeof val !== 'string') {
      if (typeof val.toString !== 'function') {
        return '';
      }
      val = val.toString();
    }
    return escape(val);
  }

  /**
   * Returns <code>true</code> if the attribute contains a value that is not
   * null or undefined.
   * @method has
   * @param {String} attr The string name of the attribute.
   * @return {Boolean}
   */
  has(attr) {
    var attributes = this.attributes;
    if (attributes.hasOwnProperty(attr)) {
      return attributes[attr] != null;
    }
    return false;
  }

  /**
   * Sets a hash of model attributes on the object.
   *
   * <p>You can call it with an object containing keys and values, or with one
   * key and value.  For example:<pre>
   *   gameTurn.set({
   *     player: player1,
   *     diceRoll: 2
   *   }, {
   *     error: function(gameTurnAgain, error) {
   *       // The set failed validation.
   *     }
   *   });
   *
   *   game.set("currentPlayer", player2, {
   *     error: function(gameTurnAgain, error) {
   *       // The set failed validation.
   *     }
   *   });
   *
   *   game.set("finished", true);</pre></p>
   *
   * @method set
   * @param {String} key The key to set.
   * @param {} value The value to give it.
   * @param {Object} options A set of options for the set.
   *     The only supported option is <code>error</code>.
   * @return {Boolean} true if the set succeeded.
   */
  set(key, value, options) {
    var changes = {};
    var newOps = {};
    if (key && typeof key === 'object') {
      changes = key;
      options = value;
    } else if (typeof key === 'string') {
      changes[key] = value;
    } else {
      return this;
    }

    options = options || {};
    var readonly = [];
    if (typeof this.constructor.readOnlyAttributes === 'function') {
      readonly = readonly.concat(this.constructor.readOnlyAttributes());
    }
    for (var k in changes) {
      if (k === 'createdAt' || k === 'updatedAt') {
        // This property is read-only, but for legacy reasons we silently
        // ignore it
        continue;
      }
      if (readonly.indexOf(k) > -1) {
        throw new Error('Cannot modify readonly attribute: ' + k);
      }
      if (options.unset) {
        newOps[k] = new UnsetOp();
      } else if (changes[k] instanceof Op) {
        newOps[k] = changes[k];
      } else if (changes[k] && typeof changes[k] === 'object' && typeof changes[k].__op === 'string') {
        newOps[k] = opFromJSON(changes[k]);
      } else if (k === 'objectId' || k === 'id') {
        if (typeof changes[k] === 'string') {
          this.id = changes[k];
        }
      } else if (k === 'ACL' && typeof changes[k] === 'object' && !(changes[k] instanceof ParseACL)) {
        newOps[k] = new SetOp(new ParseACL(changes[k]));
      } else {
        newOps[k] = new SetOp(changes[k]);
      }
    }

    // Calculate new values
    var currentAttributes = this.attributes;
    var newValues = {};
    for (var attr in newOps) {
      if (newOps[attr] instanceof RelationOp) {
        newValues[attr] = newOps[attr].applyTo(currentAttributes[attr], this, attr);
      } else if (!(newOps[attr] instanceof UnsetOp)) {
        newValues[attr] = newOps[attr].applyTo(currentAttributes[attr]);
      }
    }

    // Validate changes
    if (!options.ignoreValidation) {
      var validation = this.validate(newValues);
      if (validation) {
        if (typeof options.error === 'function') {
          options.error(this, validation);
        }
        return false;
      }
    }

    // Consolidate Ops
    var pendingOps = this._getPendingOps();
    var last = pendingOps.length - 1;
    var stateController = CoreManager.getObjectStateController();
    for (var attr in newOps) {
      var nextOp = newOps[attr].mergeWith(pendingOps[last][attr]);
      stateController.setPendingOp(this._getStateIdentifier(), attr, nextOp);
    }

    return this;
  }

  /**
   * Remove an attribute from the model. This is a noop if the attribute doesn't
   * exist.
   * @method unset
   * @param {String} attr The string name of an attribute.
   */
  unset(attr, options) {
    options = options || {};
    options.unset = true;
    return this.set(attr, null, options);
  }

  /**
   * Atomically increments the value of the given attribute the next time the
   * object is saved. If no amount is specified, 1 is used by default.
   *
   * @method increment
   * @param attr {String} The key.
   * @param amount {Number} The amount to increment by (optional).
   */
  increment(attr, amount) {
    if (typeof amount === 'undefined') {
      amount = 1;
    }
    if (typeof amount !== 'number') {
      throw new Error('Cannot increment by a non-numeric amount.');
    }
    return this.set(attr, new IncrementOp(amount));
  }

  /**
   * Atomically add an object to the end of the array associated with a given
   * key.
   * @method add
   * @param attr {String} The key.
   * @param item {} The item to add.
   */
  add(attr, item) {
    return this.set(attr, new AddOp([item]));
  }

  /**
   * Atomically add an object to the array associated with a given key, only
   * if it is not already present in the array. The position of the insert is
   * not guaranteed.
   *
   * @method addUnique
   * @param attr {String} The key.
   * @param item {} The object to add.
   */
  addUnique(attr, item) {
    return this.set(attr, new AddUniqueOp([item]));
  }

  /**
   * Atomically remove all instances of an object from the array associated
   * with a given key.
   *
   * @method remove
   * @param attr {String} The key.
   * @param item {} The object to remove.
   */
  remove(attr, item) {
    return this.set(attr, new RemoveOp([item]));
  }

  /**
   * Returns an instance of a subclass of Parse.Op describing what kind of
   * modification has been performed on this field since the last time it was
   * saved. For example, after calling object.increment("x"), calling
   * object.op("x") would return an instance of Parse.Op.Increment.
   *
   * @method op
   * @param attr {String} The key.
   * @returns {Parse.Op} The operation, or undefined if none.
   */
  op(attr) {
    var pending = this._getPendingOps();
    for (var i = pending.length; i--;) {
      if (pending[i][attr]) {
        return pending[i][attr];
      }
    }
  }

  /**
   * Creates a new model with identical attributes to this one, similar to Backbone.Model's clone()
   * @method clone
   * @return {Parse.Object}
   */
  clone() {
    let clone = new this.constructor();
    if (!clone.className) {
      clone.className = this.className;
    }
    let attributes = this.attributes;
    if (typeof this.constructor.readOnlyAttributes === 'function') {
      let readonly = this.constructor.readOnlyAttributes() || [];
      // Attributes are frozen, so we have to rebuild an object,
      // rather than delete readonly keys
      let copy = {};
      for (let a in attributes) {
        if (readonly.indexOf(a) < 0) {
          copy[a] = attributes[a];
        }
      }
      attributes = copy;
    }
    if (clone.set) {
      clone.set(attributes);
    }
    return clone;
  }

  /**
   * Creates a new instance of this object. Not to be confused with clone()
   * @method newInstance
   * @return {Parse.Object}
   */
  newInstance() {
    let clone = new this.constructor();
    if (!clone.className) {
      clone.className = this.className;
    }
    clone.id = this.id;
    if (singleInstance) {
      // Just return an object with the right id
      return clone;
    }

    let stateController = CoreManager.getObjectStateController();
    if (stateController) {
      stateController.duplicateState(this._getStateIdentifier(), clone._getStateIdentifier());
    }
    return clone;
  }

  /**
   * Returns true if this object has never been saved to Parse.
   * @method isNew
   * @return {Boolean}
   */
  isNew() {
    return !this.id;
  }

  /**
   * Returns true if this object was created by the Parse server when the
   * object might have already been there (e.g. in the case of a Facebook
   * login)
   * @method existed
   * @return {Boolean}
   */
  existed() {
    if (!this.id) {
      return false;
    }
    let stateController = CoreManager.getObjectStateController();
    let state = stateController.getState(this._getStateIdentifier());
    if (state) {
      return state.existed;
    }
    return false;
  }

  /**
   * Checks if the model is currently in a valid state.
   * @method isValid
   * @return {Boolean}
   */
  isValid() {
    return !this.validate(this.attributes);
  }

  /**
   * You should not call this function directly unless you subclass
   * <code>Parse.Object</code>, in which case you can override this method
   * to provide additional validation on <code>set</code> and
   * <code>save</code>.  Your implementation should return
   *
   * @method validate
   * @param {Object} attrs The current data to validate.
   * @return {} False if the data is valid.  An error object otherwise.
   * @see Parse.Object#set
   */
  validate(attrs) {
    if (attrs.hasOwnProperty('ACL') && !(attrs.ACL instanceof ParseACL)) {
      return new ParseError(ParseError.OTHER_CAUSE, 'ACL must be a Parse ACL.');
    }
    for (var key in attrs) {
      if (!/^[A-Za-z][0-9A-Za-z_]*$/.test(key)) {
        return new ParseError(ParseError.INVALID_KEY_NAME);
      }
    }
    return false;
  }

  /**
   * Returns the ACL for this object.
   * @method getACL
   * @returns {Parse.ACL} An instance of Parse.ACL.
   * @see Parse.Object#get
   */
  getACL() {
    var acl = this.get('ACL');
    if (acl instanceof ParseACL) {
      return acl;
    }
    return null;
  }

  /**
   * Sets the ACL to be used for this object.
   * @method setACL
   * @param {Parse.ACL} acl An instance of Parse.ACL.
   * @param {Object} options Optional Backbone-like options object to be
   *     passed in to set.
   * @return {Boolean} Whether the set passed validation.
   * @see Parse.Object#set
   */
  setACL(acl, options) {
    return this.set('ACL', acl, options);
  }

  /**
   * Clears any changes to this object made since the last call to save()
   * @method revert
   */
  revert() {
    this._clearPendingOps();
  }

  /**
   * Clears all attributes on a model
   * @method clear
   */
  clear() {
    var attributes = this.attributes;
    var erasable = {};
    var readonly = ['createdAt', 'updatedAt'];
    if (typeof this.constructor.readOnlyAttributes === 'function') {
      readonly = readonly.concat(this.constructor.readOnlyAttributes());
    }
    for (var attr in attributes) {
      if (readonly.indexOf(attr) < 0) {
        erasable[attr] = true;
      }
    }
    return this.set(erasable, { unset: true });
  }

  /**
   * Fetch the model from the server. If the server's representation of the
   * model differs from its current attributes, they will be overriden.
   *
   * @method fetch
   * @param {Object} options A Backbone-style callback object.
   * Valid options are:<ul>
   *   <li>success: A Backbone-style success callback.
   *   <li>error: An Backbone-style error callback.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   * @return {Parse.Promise} A promise that is fulfilled when the fetch
   *     completes.
   */
  fetch(options) {
    options = options || {};
    var fetchOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      fetchOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      fetchOptions.sessionToken = options.sessionToken;
    }
    var controller = CoreManager.getObjectController();
    return controller.fetch(this, true, fetchOptions)._thenRunCallbacks(options);
  }

  /**
   * Set a hash of model attributes, and save the model to the server.
   * updatedAt will be updated when the request returns.
   * You can either call it as:<pre>
   *   object.save();</pre>
   * or<pre>
   *   object.save(null, options);</pre>
   * or<pre>
   *   object.save(attrs, options);</pre>
   * or<pre>
   *   object.save(key, value, options);</pre>
   *
   * For example, <pre>
   *   gameTurn.save({
   *     player: "Jake Cutter",
   *     diceRoll: 2
   *   }, {
   *     success: function(gameTurnAgain) {
   *       // The save was successful.
   *     },
   *     error: function(gameTurnAgain, error) {
   *       // The save failed.  Error is an instance of Parse.Error.
   *     }
   *   });</pre>
   * or with promises:<pre>
   *   gameTurn.save({
   *     player: "Jake Cutter",
   *     diceRoll: 2
   *   }).then(function(gameTurnAgain) {
   *     // The save was successful.
   *   }, function(error) {
   *     // The save failed.  Error is an instance of Parse.Error.
   *   });</pre>
   *
   * @method save
   * @param {Object} options A Backbone-style callback object.
   * Valid options are:<ul>
   *   <li>success: A Backbone-style success callback.
   *   <li>error: An Backbone-style error callback.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   * @return {Parse.Promise} A promise that is fulfilled when the save
   *     completes.
   */
  save(arg1, arg2, arg3) {
    var attrs;
    var options;
    if (typeof arg1 === 'object' || typeof arg1 === 'undefined') {
      attrs = arg1;
      if (typeof arg2 === 'object') {
        options = arg2;
      }
    } else {
      attrs = {};
      attrs[arg1] = arg2;
      options = arg3;
    }

    // Support save({ success: function() {}, error: function() {} })
    if (!options && attrs) {
      options = {};
      if (typeof attrs.success === 'function') {
        options.success = attrs.success;
        delete attrs.success;
      }
      if (typeof attrs.error === 'function') {
        options.error = attrs.error;
        delete attrs.error;
      }
    }

    if (attrs) {
      var validation = this.validate(attrs);
      if (validation) {
        if (options && typeof options.error === 'function') {
          options.error(this, validation);
        }
        return ParsePromise.error(validation);
      }
      this.set(attrs, options);
    }

    options = options || {};
    var saveOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      saveOptions.useMasterKey = !!options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken') && typeof options.sessionToken === 'string') {
      saveOptions.sessionToken = options.sessionToken;
    }

    var controller = CoreManager.getObjectController();
    var unsaved = unsavedChildren(this);
    return controller.save(unsaved, saveOptions).then(() => {
      return controller.save(this, saveOptions);
    })._thenRunCallbacks(options, this);
  }

  /**
   * Destroy this model on the server if it was already persisted.
   * If `wait: true` is passed, waits for the server to respond
   * before removal.
   *
   * @method destroy
   * @param {Object} options A Backbone-style callback object.
   * Valid options are:<ul>
   *   <li>success: A Backbone-style success callback
   *   <li>error: An Backbone-style error callback.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   * @return {Parse.Promise} A promise that is fulfilled when the destroy
   *     completes.
   */
  destroy(options) {
    options = options || {};
    var destroyOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      destroyOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      destroyOptions.sessionToken = options.sessionToken;
    }
    if (!this.id) {
      return ParsePromise.as()._thenRunCallbacks(options);
    }
    return CoreManager.getObjectController().destroy(this, destroyOptions)._thenRunCallbacks(options);
  }

  /** Static methods **/

  static _clearAllState() {
    let stateController = CoreManager.getObjectStateController();
    stateController.clearAllState();
  }

  /**
   * Fetches the given list of Parse.Object.
   * If any error is encountered, stops and calls the error handler.
   *
   * <pre>
   *   Parse.Object.fetchAll([object1, object2, ...], {
   *     success: function(list) {
   *       // All the objects were fetched.
   *     },
   *     error: function(error) {
   *       // An error occurred while fetching one of the objects.
   *     },
   *   });
   * </pre>
   *
   * @method fetchAll
   * @param {Array} list A list of <code>Parse.Object</code>.
   * @param {Object} options A Backbone-style callback object.
   * @static
   * Valid options are:<ul>
   *   <li>success: A Backbone-style success callback.
   *   <li>error: An Backbone-style error callback.
   * </ul>
   */
  static fetchAll(list, options) {
    var options = options || {};

    var queryOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      queryOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      queryOptions.sessionToken = options.sessionToken;
    }
    return CoreManager.getObjectController().fetch(list, true, queryOptions)._thenRunCallbacks(options);
  }

  /**
   * Fetches the given list of Parse.Object if needed.
   * If any error is encountered, stops and calls the error handler.
   *
   * <pre>
   *   Parse.Object.fetchAllIfNeeded([object1, ...], {
   *     success: function(list) {
   *       // Objects were fetched and updated.
   *     },
   *     error: function(error) {
   *       // An error occurred while fetching one of the objects.
   *     },
   *   });
   * </pre>
   *
   * @method fetchAllIfNeeded
   * @param {Array} list A list of <code>Parse.Object</code>.
   * @param {Object} options A Backbone-style callback object.
   * @static
   * Valid options are:<ul>
   *   <li>success: A Backbone-style success callback.
   *   <li>error: An Backbone-style error callback.
   * </ul>
   */
  static fetchAllIfNeeded(list, options) {
    var options = options || {};

    var queryOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      queryOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      queryOptions.sessionToken = options.sessionToken;
    }
    return CoreManager.getObjectController().fetch(list, false, queryOptions)._thenRunCallbacks(options);
  }

  /**
   * Destroy the given list of models on the server if it was already persisted.
   *
   * <p>Unlike saveAll, if an error occurs while deleting an individual model,
   * this method will continue trying to delete the rest of the models if
   * possible, except in the case of a fatal error like a connection error.
   *
   * <p>In particular, the Parse.Error object returned in the case of error may
   * be one of two types:
   *
   * <ul>
   *   <li>A Parse.Error.AGGREGATE_ERROR. This object's "errors" property is an
   *       array of other Parse.Error objects. Each error object in this array
   *       has an "object" property that references the object that could not be
   *       deleted (for instance, because that object could not be found).</li>
   *   <li>A non-aggregate Parse.Error. This indicates a serious error that
   *       caused the delete operation to be aborted partway through (for
   *       instance, a connection failure in the middle of the delete).</li>
   * </ul>
   *
   * <pre>
   *   Parse.Object.destroyAll([object1, object2, ...], {
   *     success: function() {
   *       // All the objects were deleted.
   *     },
   *     error: function(error) {
   *       // An error occurred while deleting one or more of the objects.
   *       // If this is an aggregate error, then we can inspect each error
   *       // object individually to determine the reason why a particular
   *       // object was not deleted.
   *       if (error.code === Parse.Error.AGGREGATE_ERROR) {
   *         for (var i = 0; i < error.errors.length; i++) {
   *           console.log("Couldn't delete " + error.errors[i].object.id +
   *             "due to " + error.errors[i].message);
   *         }
   *       } else {
   *         console.log("Delete aborted because of " + error.message);
   *       }
   *     },
   *   });
   * </pre>
   *
   * @method destroyAll
   * @param {Array} list A list of <code>Parse.Object</code>.
   * @param {Object} options A Backbone-style callback object.
   * @static
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   * @return {Parse.Promise} A promise that is fulfilled when the destroyAll
   *     completes.
   */
  static destroyAll(list, options) {
    var options = options || {};

    var destroyOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      destroyOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      destroyOptions.sessionToken = options.sessionToken;
    }
    return CoreManager.getObjectController().destroy(list, destroyOptions)._thenRunCallbacks(options);
  }

  /**
   * Saves the given list of Parse.Object.
   * If any error is encountered, stops and calls the error handler.
   *
   * <pre>
   *   Parse.Object.saveAll([object1, object2, ...], {
   *     success: function(list) {
   *       // All the objects were saved.
   *     },
   *     error: function(error) {
   *       // An error occurred while saving one of the objects.
   *     },
   *   });
   * </pre>
   *
   * @method saveAll
   * @param {Array} list A list of <code>Parse.Object</code>.
   * @param {Object} options A Backbone-style callback object.
   * @static
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   */
  static saveAll(list, options) {
    var options = options || {};

    var saveOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      saveOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      saveOptions.sessionToken = options.sessionToken;
    }
    return CoreManager.getObjectController().save(list, saveOptions)._thenRunCallbacks(options);
  }

  /**
   * Creates a reference to a subclass of Parse.Object with the given id. This
   * does not exist on Parse.Object, only on subclasses.
   *
   * <p>A shortcut for: <pre>
   *  var Foo = Parse.Object.extend("Foo");
   *  var pointerToFoo = new Foo();
   *  pointerToFoo.id = "myObjectId";
   * </pre>
   *
   * @method createWithoutData
   * @param {String} id The ID of the object to create a reference to.
   * @static
   * @return {Parse.Object} A Parse.Object reference.
   */
  static createWithoutData(id) {
    var obj = new this();
    obj.id = id;
    return obj;
  }

  /**
   * Creates a new instance of a Parse Object from a JSON representation.
   * @method fromJSON
   * @param {Object} json The JSON map of the Object's data
   * @param {boolean} override In single instance mode, all old server data
   *   is overwritten if this is set to true
   * @static
   * @return {Parse.Object} A Parse.Object reference
   */
  static fromJSON(json, override) {
    if (!json.className) {
      throw new Error('Cannot create an object without a className');
    }
    var constructor = classMap[json.className];
    var o = constructor ? new constructor() : new ParseObject(json.className);
    var otherAttributes = {};
    for (var attr in json) {
      if (attr !== 'className' && attr !== '__type') {
        otherAttributes[attr] = json[attr];
      }
    }
    if (override) {
      // id needs to be set before clearServerData can work
      if (otherAttributes.objectId) {
        o.id = otherAttributes.objectId;
      }
      let preserved = null;
      if (typeof o._preserveFieldsOnFetch === 'function') {
        preserved = o._preserveFieldsOnFetch();
      }
      o._clearServerData();
      if (preserved) {
        o._finishFetch(preserved);
      }
    }
    o._finishFetch(otherAttributes);
    if (json.objectId) {
      o._setExisted(true);
    }
    return o;
  }

  /**
   * Registers a subclass of Parse.Object with a specific class name.
   * When objects of that class are retrieved from a query, they will be
   * instantiated with this subclass.
   * This is only necessary when using ES6 subclassing.
   * @method registerSubclass
   * @param {String} className The class name of the subclass
   * @param {Class} constructor The subclass
   */
  static registerSubclass(className, constructor) {
    if (typeof className !== 'string') {
      throw new TypeError('The first argument must be a valid class name.');
    }
    if (typeof constructor === 'undefined') {
      throw new TypeError('You must supply a subclass constructor.');
    }
    if (typeof constructor !== 'function') {
      throw new TypeError('You must register the subclass constructor. ' + 'Did you attempt to register an instance of the subclass?');
    }
    classMap[className] = constructor;
    if (!constructor.className) {
      constructor.className = className;
    }
  }

  /**
   * Creates a new subclass of Parse.Object for the given Parse class name.
   *
   * <p>Every extension of a Parse class will inherit from the most recent
   * previous extension of that class. When a Parse.Object is automatically
   * created by parsing JSON, it will use the most recent extension of that
   * class.</p>
   *
   * <p>You should call either:<pre>
   *     var MyClass = Parse.Object.extend("MyClass", {
   *         <i>Instance methods</i>,
   *         initialize: function(attrs, options) {
   *             this.someInstanceProperty = [],
   *             <i>Other instance properties</i>
   *         }
   *     }, {
   *         <i>Class properties</i>
   *     });</pre>
   * or, for Backbone compatibility:<pre>
   *     var MyClass = Parse.Object.extend({
   *         className: "MyClass",
   *         <i>Instance methods</i>,
   *         initialize: function(attrs, options) {
   *             this.someInstanceProperty = [],
   *             <i>Other instance properties</i>
   *         }
   *     }, {
   *         <i>Class properties</i>
   *     });</pre></p>
   *
   * @method extend
   * @param {String} className The name of the Parse class backing this model.
   * @param {Object} protoProps Instance properties to add to instances of the
   *     class returned from this method.
   * @param {Object} classProps Class properties to add the class returned from
   *     this method.
   * @return {Class} A new subclass of Parse.Object.
   */
  static extend(className, protoProps, classProps) {
    if (typeof className !== 'string') {
      if (className && typeof className.className === 'string') {
        return ParseObject.extend(className.className, className, protoProps);
      } else {
        throw new Error('Parse.Object.extend\'s first argument should be the className.');
      }
    }
    var adjustedClassName = className;

    if (adjustedClassName === 'User' && CoreManager.get('PERFORM_USER_REWRITE')) {
      adjustedClassName = '_User';
    }

    var parentProto = ParseObject.prototype;
    if (this.hasOwnProperty('__super__') && this.__super__) {
      parentProto = this.prototype;
    } else if (classMap[adjustedClassName]) {
      parentProto = classMap[adjustedClassName].prototype;
    }
    var ParseObjectSubclass = function (attributes, options) {
      this.className = adjustedClassName;
      this._objCount = objectCount++;
      // Enable legacy initializers
      if (typeof this.initialize === 'function') {
        this.initialize.apply(this, arguments);
      }

      if (attributes && typeof attributes === 'object') {
        if (!this.set(attributes || {}, options)) {
          throw new Error('Can\'t create an invalid Parse Object');
        }
      }
    };
    ParseObjectSubclass.className = adjustedClassName;
    ParseObjectSubclass.__super__ = parentProto;

    ParseObjectSubclass.prototype = Object.create(parentProto, {
      constructor: {
        value: ParseObjectSubclass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (protoProps) {
      for (var prop in protoProps) {
        if (prop !== 'className') {
          Object.defineProperty(ParseObjectSubclass.prototype, prop, {
            value: protoProps[prop],
            enumerable: false,
            writable: true,
            configurable: true
          });
        }
      }
    }

    if (classProps) {
      for (var prop in classProps) {
        if (prop !== 'className') {
          Object.defineProperty(ParseObjectSubclass, prop, {
            value: classProps[prop],
            enumerable: false,
            writable: true,
            configurable: true
          });
        }
      }
    }

    ParseObjectSubclass.extend = function (name, protoProps, classProps) {
      if (typeof name === 'string') {
        return ParseObject.extend.call(ParseObjectSubclass, name, protoProps, classProps);
      }
      return ParseObject.extend.call(ParseObjectSubclass, adjustedClassName, name, protoProps);
    };
    ParseObjectSubclass.createWithoutData = ParseObject.createWithoutData;

    classMap[adjustedClassName] = ParseObjectSubclass;
    return ParseObjectSubclass;
  }

  /**
   * Enable single instance objects, where any local objects with the same Id
   * share the same attributes, and stay synchronized with each other.
   * This is disabled by default in server environments, since it can lead to
   * security issues.
   * @method enableSingleInstance
   */
  static enableSingleInstance() {
    singleInstance = true;
    CoreManager.setObjectStateController(SingleInstanceStateController);
  }

  /**
   * Disable single instance objects, where any local objects with the same Id
   * share the same attributes, and stay synchronized with each other.
   * When disabled, you can have two instances of the same object in memory
   * without them sharing attributes.
   * @method disableSingleInstance
   */
  static disableSingleInstance() {
    singleInstance = false;
    CoreManager.setObjectStateController(UniqueInstanceStateController);
  }
}

var DefaultController = {
  fetch(target, forceFetch, options) {
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return ParsePromise.as([]);
      }
      var objs = [];
      var ids = [];
      var className = null;
      var results = [];
      var error = null;
      target.forEach((el, i) => {
        if (error) {
          return;
        }
        if (!className) {
          className = el.className;
        }
        if (className !== el.className) {
          error = new ParseError(ParseError.INVALID_CLASS_NAME, 'All objects should be of the same class');
        }
        if (!el.id) {
          error = new ParseError(ParseError.MISSING_OBJECT_ID, 'All objects must have an ID');
        }
        if (forceFetch || Object.keys(el._getServerData()).length === 0) {
          ids.push(el.id);
          objs.push(el);
        }
        results.push(el);
      });
      if (error) {
        return ParsePromise.error(error);
      }
      var query = new ParseQuery(className);
      query.containedIn('objectId', ids);
      query._limit = ids.length;
      return query.find(options).then(objects => {
        var idMap = {};
        objects.forEach(o => {
          idMap[o.id] = o;
        });
        for (var i = 0; i < objs.length; i++) {
          var obj = objs[i];
          if (!obj || !obj.id || !idMap[obj.id]) {
            if (forceFetch) {
              return ParsePromise.error(new ParseError(ParseError.OBJECT_NOT_FOUND, 'All objects must exist on the server.'));
            }
          }
        }
        if (!singleInstance) {
          // If single instance objects are disabled, we need to replace the
          for (var i = 0; i < results.length; i++) {
            var obj = results[i];
            if (obj && obj.id && idMap[obj.id]) {
              var id = obj.id;
              obj._finishFetch(idMap[id].toJSON());
              results[i] = idMap[id];
            }
          }
        }
        return ParsePromise.as(results);
      });
    } else {
      var RESTController = CoreManager.getRESTController();
      return RESTController.request('GET', 'classes/' + target.className + '/' + target._getId(), {}, options).then((response, status, xhr) => {
        if (target instanceof ParseObject) {
          target._clearPendingOps();
          target._clearServerData();
          target._finishFetch(response);
        }
        return target;
      });
    }
  },

  destroy(target, options) {
    var RESTController = CoreManager.getRESTController();
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return ParsePromise.as([]);
      }
      var batches = [[]];
      target.forEach(obj => {
        if (!obj.id) {
          return;
        }
        batches[batches.length - 1].push(obj);
        if (batches[batches.length - 1].length >= 20) {
          batches.push([]);
        }
      });
      if (batches[batches.length - 1].length === 0) {
        // If the last batch is empty, remove it
        batches.pop();
      }
      var deleteCompleted = ParsePromise.as();
      var errors = [];
      batches.forEach(batch => {
        deleteCompleted = deleteCompleted.then(() => {
          return RESTController.request('POST', 'batch', {
            requests: batch.map(obj => {
              return {
                method: 'DELETE',
                path: getServerUrlPath() + 'classes/' + obj.className + '/' + obj._getId(),
                body: {}
              };
            })
          }, options).then(results => {
            for (var i = 0; i < results.length; i++) {
              if (results[i] && results[i].hasOwnProperty('error')) {
                var err = new ParseError(results[i].error.code, results[i].error.error);
                err.object = batch[i];
                errors.push(err);
              }
            }
          });
        });
      });
      return deleteCompleted.then(() => {
        if (errors.length) {
          var aggregate = new ParseError(ParseError.AGGREGATE_ERROR);
          aggregate.errors = errors;
          return ParsePromise.error(aggregate);
        }
        return ParsePromise.as(target);
      });
    } else if (target instanceof ParseObject) {
      return RESTController.request('DELETE', 'classes/' + target.className + '/' + target._getId(), {}, options).then(() => {
        return ParsePromise.as(target);
      });
    }
    return ParsePromise.as(target);
  },

  save(target, options) {
    var RESTController = CoreManager.getRESTController();
    var stateController = CoreManager.getObjectStateController();
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return ParsePromise.as([]);
      }

      var unsaved = target.concat();
      for (var i = 0; i < target.length; i++) {
        if (target[i] instanceof ParseObject) {
          unsaved = unsaved.concat(unsavedChildren(target[i], true));
        }
      }
      unsaved = unique(unsaved);

      var filesSaved = ParsePromise.as();
      var pending = [];
      unsaved.forEach(el => {
        if (el instanceof ParseFile) {
          filesSaved = filesSaved.then(() => {
            return el.save();
          });
        } else if (el instanceof ParseObject) {
          pending.push(el);
        }
      });

      return filesSaved.then(() => {
        var objectError = null;
        return ParsePromise._continueWhile(() => {
          return pending.length > 0;
        }, () => {
          var batch = [];
          var nextPending = [];
          pending.forEach(el => {
            if (batch.length < 20 && canBeSerialized(el)) {
              batch.push(el);
            } else {
              nextPending.push(el);
            }
          });
          pending = nextPending;
          if (batch.length < 1) {
            return ParsePromise.error(new ParseError(ParseError.OTHER_CAUSE, 'Tried to save a batch with a cycle.'));
          }

          // Queue up tasks for each object in the batch.
          // When every task is ready, the API request will execute
          var batchReturned = new ParsePromise();
          var batchReady = [];
          var batchTasks = [];
          batch.forEach((obj, index) => {
            var ready = new ParsePromise();
            batchReady.push(ready);

            stateController.pushPendingState(obj._getStateIdentifier());
            batchTasks.push(stateController.enqueueTask(obj._getStateIdentifier(), function () {
              ready.resolve();
              return batchReturned.then((responses, status) => {
                if (responses[index].hasOwnProperty('success')) {
                  obj._handleSaveResponse(responses[index].success, status);
                } else {
                  if (!objectError && responses[index].hasOwnProperty('error')) {
                    var serverError = responses[index].error;
                    objectError = new ParseError(serverError.code, serverError.error);
                    // Cancel the rest of the save
                    pending = [];
                  }
                  obj._handleSaveError();
                }
              });
            }));
          });

          ParsePromise.when(batchReady).then(() => {
            // Kick off the batch request
            return RESTController.request('POST', 'batch', {
              requests: batch.map(obj => {
                var params = obj._getSaveParams();
                params.path = getServerUrlPath() + params.path;
                return params;
              })
            }, options);
          }).then((response, status, xhr) => {
            batchReturned.resolve(response, status);
          });

          return ParsePromise.when(batchTasks);
        }).then(() => {
          if (objectError) {
            return ParsePromise.error(objectError);
          }
          return ParsePromise.as(target);
        });
      });
    } else if (target instanceof ParseObject) {
      // copying target lets Flow guarantee the pointer isn't modified elsewhere
      var targetCopy = target;
      var task = function () {
        var params = targetCopy._getSaveParams();
        return RESTController.request(params.method, params.path, params.body, options).then((response, status) => {
          targetCopy._handleSaveResponse(response, status);
        }, error => {
          targetCopy._handleSaveError();
          return ParsePromise.error(error);
        });
      };

      stateController.pushPendingState(target._getStateIdentifier());
      return stateController.enqueueTask(target._getStateIdentifier(), task).then(() => {
        return target;
      }, error => {
        return ParsePromise.error(error);
      });
    }
    return ParsePromise.as();
  }
};

CoreManager.setObjectController(DefaultController);