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
import encode from './encode';
import ParseError from './ParseError';
import ParseGeoPoint from './ParseGeoPoint';
import ParseObject from './ParseObject';
import ParsePromise from './ParsePromise';

/**
 * Converts a string into a regex that matches it.
 * Surrounding with \Q .. \E does this, we just need to escape any \E's in
 * the text separately.
 */
function quote(s) {
  return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
}

/**
 * Creates a new parse Parse.Query for the given Parse.Object subclass.
 * @class Parse.Query
 * @constructor
 * @param {} objectClass An instance of a subclass of Parse.Object, or a Parse className string.
 *
 * <p>Parse.Query defines a query that is used to fetch Parse.Objects. The
 * most common use case is finding all objects that match a query through the
 * <code>find</code> method. For example, this sample code fetches all objects
 * of class <code>MyClass</code>. It calls a different function depending on
 * whether the fetch succeeded or not.
 *
 * <pre>
 * var query = new Parse.Query(MyClass);
 * query.find({
 *   success: function(results) {
 *     // results is an array of Parse.Object.
 *   },
 *
 *   error: function(error) {
 *     // error is an instance of Parse.Error.
 *   }
 * });</pre></p>
 *
 * <p>A Parse.Query can also be used to retrieve a single object whose id is
 * known, through the get method. For example, this sample code fetches an
 * object of class <code>MyClass</code> and id <code>myId</code>. It calls a
 * different function depending on whether the fetch succeeded or not.
 *
 * <pre>
 * var query = new Parse.Query(MyClass);
 * query.get(myId, {
 *   success: function(object) {
 *     // object is an instance of Parse.Object.
 *   },
 *
 *   error: function(object, error) {
 *     // error is an instance of Parse.Error.
 *   }
 * });</pre></p>
 *
 * <p>A Parse.Query can also be used to count the number of objects that match
 * the query without retrieving all of those objects. For example, this
 * sample code counts the number of objects of the class <code>MyClass</code>
 * <pre>
 * var query = new Parse.Query(MyClass);
 * query.count({
 *   success: function(number) {
 *     // There are number instances of MyClass.
 *   },
 *
 *   error: function(error) {
 *     // error is an instance of Parse.Error.
 *   }
 * });</pre></p>
 */
export default class ParseQuery {

  constructor(objectClass) {
    if (typeof objectClass === 'string') {
      if (objectClass === 'User' && CoreManager.get('PERFORM_USER_REWRITE')) {
        this.className = '_User';
      } else {
        this.className = objectClass;
      }
    } else if (objectClass instanceof ParseObject) {
      this.className = objectClass.className;
    } else if (typeof objectClass === 'function') {
      if (typeof objectClass.className === 'string') {
        this.className = objectClass.className;
      } else {
        var obj = new objectClass();
        this.className = obj.className;
      }
    } else {
      throw new TypeError('A ParseQuery must be constructed with a ParseObject or class name.');
    }

    this._where = {};
    this._include = [];
    this._limit = -1; // negative limit is not sent in the server request
    this._skip = 0;
    this._extraOptions = {};
  }

  /**
   * Adds constraint that at least one of the passed in queries matches.
   * @method _orQuery
   * @param {Array} queries
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  _orQuery(queries) {
    var queryJSON = queries.map(q => {
      return q.toJSON().where;
    });

    this._where.$or = queryJSON;
    return this;
  }

  /**
   * Helper for condition queries
   */
  _addCondition(key, condition, value) {
    if (!this._where[key] || typeof this._where[key] === 'string') {
      this._where[key] = {};
    }
    this._where[key][condition] = encode(value, false, true);
    return this;
  }

  /**
   * Returns a JSON representation of this query.
   * @method toJSON
   * @return {Object} The JSON representation of the query.
   */
  toJSON() {
    var params = {
      where: this._where
    };

    if (this._include.length) {
      params.include = this._include.join(',');
    }
    if (this._select) {
      params.keys = this._select.join(',');
    }
    if (this._limit >= 0) {
      params.limit = this._limit;
    }
    if (this._skip > 0) {
      params.skip = this._skip;
    }
    if (this._order) {
      params.order = this._order.join(',');
    }
    for (var key in this._extraOptions) {
      params[key] = this._extraOptions[key];
    }

    return params;
  }

  /**
   * Constructs a Parse.Object whose id is already known by fetching data from
   * the server.  Either options.success or options.error is called when the
   * find completes.
   *
   * @method get
   * @param {String} objectId The id of the object to be fetched.
   * @param {Object} options A Backbone-style options object.
   * Valid options are:<ul>
   *   <li>success: A Backbone-style success callback
   *   <li>error: An Backbone-style error callback.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Parse.Promise} A promise that is resolved with the result when
   * the query completes.
   */
  get(objectId, options) {
    this.equalTo('objectId', objectId);

    var firstOptions = {};
    if (options && options.hasOwnProperty('useMasterKey')) {
      firstOptions.useMasterKey = options.useMasterKey;
    }
    if (options && options.hasOwnProperty('sessionToken')) {
      firstOptions.sessionToken = options.sessionToken;
    }

    return this.first(firstOptions).then(response => {
      if (response) {
        return response;
      }

      var errorObject = new ParseError(ParseError.OBJECT_NOT_FOUND, 'Object not found.');
      return ParsePromise.error(errorObject);
    })._thenRunCallbacks(options, null);
  }

  /**
   * Retrieves a list of ParseObjects that satisfy this query.
   * Either options.success or options.error is called when the find
   * completes.
   *
   * @method find
   * @param {Object} options A Backbone-style options object. Valid options
   * are:<ul>
   *   <li>success: Function to call when the find completes successfully.
   *   <li>error: Function to call when the find fails.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Parse.Promise} A promise that is resolved with the results when
   * the query completes.
   */
  find(options) {
    options = options || {};

    let findOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    let controller = CoreManager.getQueryController();

    return controller.find(this.className, this.toJSON(), findOptions).then(response => {
      return response.results.map(data => {
        // In cases of relations, the server may send back a className
        // on the top level of the payload
        let override = response.className || this.className;
        if (!data.className) {
          data.className = override;
        }
        return ParseObject.fromJSON(data, true);
      });
    })._thenRunCallbacks(options);
  }

  /**
   * Counts the number of objects that match this query.
   * Either options.success or options.error is called when the count
   * completes.
   *
   * @method count
   * @param {Object} options A Backbone-style options object. Valid options
   * are:<ul>
   *   <li>success: Function to call when the count completes successfully.
   *   <li>error: Function to call when the find fails.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Parse.Promise} A promise that is resolved with the count when
   * the query completes.
   */
  count(options) {
    options = options || {};

    var findOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    var controller = CoreManager.getQueryController();

    var params = this.toJSON();
    params.limit = 0;
    params.count = 1;

    return controller.find(this.className, params, findOptions).then(result => {
      return result.count;
    })._thenRunCallbacks(options);
  }

  /**
   * Retrieves at most one Parse.Object that satisfies this query.
   *
   * Either options.success or options.error is called when it completes.
   * success is passed the object if there is one. otherwise, undefined.
   *
   * @method first
   * @param {Object} options A Backbone-style options object. Valid options
   * are:<ul>
   *   <li>success: Function to call when the find completes successfully.
   *   <li>error: Function to call when the find fails.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Parse.Promise} A promise that is resolved with the object when
   * the query completes.
   */
  first(options) {
    options = options || {};

    var findOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    var controller = CoreManager.getQueryController();

    var params = this.toJSON();
    params.limit = 1;

    return controller.find(this.className, params, findOptions).then(response => {
      var objects = response.results;
      if (!objects[0]) {
        return undefined;
      }
      if (!objects[0].className) {
        objects[0].className = this.className;
      }
      return ParseObject.fromJSON(objects[0], true);
    })._thenRunCallbacks(options);
  }

  /**
   * Iterates over each result of a query, calling a callback for each one. If
   * the callback returns a promise, the iteration will not continue until
   * that promise has been fulfilled. If the callback returns a rejected
   * promise, then iteration will stop with that error. The items are
   * processed in an unspecified order. The query may not have any sort order,
   * and may not use limit or skip.
   * @method each
   * @param {Function} callback Callback that will be called with each result
   *     of the query.
   * @param {Object} options A Backbone-style options object. Valid options
   * are:<ul>
   *   <li>success: Function to call when the iteration completes successfully.
   *   <li>error: Function to call when the iteration fails.
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   * @return {Parse.Promise} A promise that will be fulfilled once the
   *     iteration has completed.
   */
  each(callback, options) {
    options = options || {};

    if (this._order || this._skip || this._limit >= 0) {
      return ParsePromise.error('Cannot iterate on a query with sort, skip, or limit.')._thenRunCallbacks(options);
    }

    new ParsePromise();


    var query = new ParseQuery(this.className);
    // We can override the batch size from the options.
    // This is undocumented, but useful for testing.
    query._limit = options.batchSize || 100;
    query._include = this._include.map(i => {
      return i;
    });
    if (this._select) {
      query._select = this._select.map(s => {
        return s;
      });
    }

    query._where = {};
    for (var attr in this._where) {
      var val = this._where[attr];
      if (Array.isArray(val)) {
        query._where[attr] = val.map(v => {
          return v;
        });
      } else if (val && typeof val === 'object') {
        var conditionMap = {};
        query._where[attr] = conditionMap;
        for (var cond in val) {
          conditionMap[cond] = val[cond];
        }
      } else {
        query._where[attr] = val;
      }
    }

    query.ascending('objectId');

    var findOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    var finished = false;
    return ParsePromise._continueWhile(() => {
      return !finished;
    }, () => {
      return query.find(findOptions).then(results => {
        var callbacksDone = ParsePromise.as();
        results.forEach(result => {
          callbacksDone = callbacksDone.then(() => {
            return callback(result);
          });
        });

        return callbacksDone.then(() => {
          if (results.length >= query._limit) {
            query.greaterThan('objectId', results[results.length - 1].id);
          } else {
            finished = true;
          }
        });
      });
    })._thenRunCallbacks(options);
  }

  /** Query Conditions **/

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be equal to the provided value.
   * @method equalTo
   * @param {String} key The key to check.
   * @param value The value that the Parse.Object must contain.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  equalTo(key, value) {
    if (typeof value === 'undefined') {
      return this.doesNotExist(key);
    }

    this._where[key] = encode(value, false, true);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be not equal to the provided value.
   * @method notEqualTo
   * @param {String} key The key to check.
   * @param value The value that must not be equalled.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  notEqualTo(key, value) {
    return this._addCondition(key, '$ne', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be less than the provided value.
   * @method lessThan
   * @param {String} key The key to check.
   * @param value The value that provides an upper bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  lessThan(key, value) {
    return this._addCondition(key, '$lt', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be greater than the provided value.
   * @method greaterThan
   * @param {String} key The key to check.
   * @param value The value that provides an lower bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  greaterThan(key, value) {
    return this._addCondition(key, '$gt', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be less than or equal to the provided value.
   * @method lessThanOrEqualTo
   * @param {String} key The key to check.
   * @param value The value that provides an upper bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  lessThanOrEqualTo(key, value) {
    return this._addCondition(key, '$lte', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be greater than or equal to the provided value.
   * @method greaterThanOrEqualTo
   * @param {String} key The key to check.
   * @param value The value that provides an lower bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  greaterThanOrEqualTo(key, value) {
    return this._addCondition(key, '$gte', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be contained in the provided list of values.
   * @method containedIn
   * @param {String} key The key to check.
   * @param {Array} values The values that will match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  containedIn(key, value) {
    return this._addCondition(key, '$in', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * not be contained in the provided list of values.
   * @method notContainedIn
   * @param {String} key The key to check.
   * @param {Array} values The values that will not match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  notContainedIn(key, value) {
    return this._addCondition(key, '$nin', value);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * contain each one of the provided list of values.
   * @method containsAll
   * @param {String} key The key to check.  This key's value must be an array.
   * @param {Array} values The values that will match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  containsAll(key, values) {
    return this._addCondition(key, '$all', values);
  }

  /**
   * Adds a constraint for finding objects that contain the given key.
   * @method exists
   * @param {String} key The key that should exist.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  exists(key) {
    return this._addCondition(key, '$exists', true);
  }

  /**
   * Adds a constraint for finding objects that do not contain a given key.
   * @method doesNotExist
   * @param {String} key The key that should not exist
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  doesNotExist(key) {
    return this._addCondition(key, '$exists', false);
  }

  /**
   * Adds a regular expression constraint for finding string values that match
   * the provided regular expression.
   * This may be slow for large datasets.
   * @method matches
   * @param {String} key The key that the string to match is stored in.
   * @param {RegExp} regex The regular expression pattern to match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  matches(key, regex, modifiers) {
    this._addCondition(key, '$regex', regex);
    if (!modifiers) {
      modifiers = '';
    }
    if (regex.ignoreCase) {
      modifiers += 'i';
    }
    if (regex.multiline) {
      modifiers += 'm';
    }
    if (modifiers.length) {
      this._addCondition(key, '$options', modifiers);
    }
    return this;
  }

  /**
   * Adds a constraint that requires that a key's value matches a Parse.Query
   * constraint.
   * @method matchesQuery
   * @param {String} key The key that the contains the object to match the
   *                     query.
   * @param {Parse.Query} query The query that should match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  matchesQuery(key, query) {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$inQuery', queryJSON);
  }

  /**
   * Adds a constraint that requires that a key's value not matches a
   * Parse.Query constraint.
   * @method doesNotMatchQuery
   * @param {String} key The key that the contains the object to match the
   *                     query.
   * @param {Parse.Query} query The query that should not match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  doesNotMatchQuery(key, query) {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$notInQuery', queryJSON);
  }

  /**
   * Adds a constraint that requires that a key's value matches a value in
   * an object returned by a different Parse.Query.
   * @method matchesKeyInQuery
   * @param {String} key The key that contains the value that is being
   *                     matched.
   * @param {String} queryKey The key in the objects returned by the query to
   *                          match against.
   * @param {Parse.Query} query The query to run.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  matchesKeyInQuery(key, queryKey, query) {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$select', {
      key: queryKey,
      query: queryJSON
    });
  }

  /**
   * Adds a constraint that requires that a key's value not match a value in
   * an object returned by a different Parse.Query.
   * @method doesNotMatchKeyInQuery
   * @param {String} key The key that contains the value that is being
   *                     excluded.
   * @param {String} queryKey The key in the objects returned by the query to
   *                          match against.
   * @param {Parse.Query} query The query to run.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  doesNotMatchKeyInQuery(key, queryKey, query) {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$dontSelect', {
      key: queryKey,
      query: queryJSON
    });
  }

  /**
   * Adds a constraint for finding string values that contain a provided
   * string.  This may be slow for large datasets.
   * @method contains
   * @param {String} key The key that the string to match is stored in.
   * @param {String} substring The substring that the value must contain.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  contains(key, value) {
    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }
    return this._addCondition(key, '$regex', quote(value));
  }

  /**
   * Adds a constraint for finding string values that start with a provided
   * string.  This query will use the backend index, so it will be fast even
   * for large datasets.
   * @method startsWith
   * @param {String} key The key that the string to match is stored in.
   * @param {String} prefix The substring that the value must start with.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  startsWith(key, value) {
    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }
    return this._addCondition(key, '$regex', '^' + quote(value));
  }

  /**
   * Adds a constraint for finding string values that end with a provided
   * string.  This will be slow for large datasets.
   * @method endsWith
   * @param {String} key The key that the string to match is stored in.
   * @param {String} suffix The substring that the value must end with.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  endsWith(key, value) {
    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }
    return this._addCondition(key, '$regex', quote(value) + '$');
  }

  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given.
   * @method near
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  near(key, point) {
    if (!(point instanceof ParseGeoPoint)) {
      // Try to cast it as a GeoPoint
      point = new ParseGeoPoint(point);
    }
    return this._addCondition(key, '$nearSphere', point);
  }

  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given and within the maximum distance given.
   * @method withinRadians
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @param {Number} maxDistance Maximum distance (in radians) of results to
   *   return.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  withinRadians(key, point, distance) {
    this.near(key, point);
    return this._addCondition(key, '$maxDistance', distance);
  }

  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given and within the maximum distance given.
   * Radius of earth used is 3958.8 miles.
   * @method withinMiles
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @param {Number} maxDistance Maximum distance (in miles) of results to
   *     return.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  withinMiles(key, point, distance) {
    return this.withinRadians(key, point, distance / 3958.8);
  }

  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given and within the maximum distance given.
   * Radius of earth used is 6371.0 kilometers.
   * @method withinKilometers
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @param {Number} maxDistance Maximum distance (in kilometers) of results
   *     to return.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  withinKilometers(key, point, distance) {
    return this.withinRadians(key, point, distance / 6371.0);
  }

  /**
   * Adds a constraint to the query that requires a particular key's
   * coordinates be contained within a given rectangular geographic bounding
   * box.
   * @method withinGeoBox
   * @param {String} key The key to be constrained.
   * @param {Parse.GeoPoint} southwest
   *     The lower-left inclusive corner of the box.
   * @param {Parse.GeoPoint} northeast
   *     The upper-right inclusive corner of the box.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  withinGeoBox(key, southwest, northeast) {
    if (!(southwest instanceof ParseGeoPoint)) {
      southwest = new ParseGeoPoint(southwest);
    }
    if (!(northeast instanceof ParseGeoPoint)) {
      northeast = new ParseGeoPoint(northeast);
    }
    this._addCondition(key, '$within', { '$box': [southwest, northeast] });
    return this;
  }

  /** Query Orderings **/

  /**
   * Sorts the results in ascending order by the given key.
   *
   * @method ascending
   * @param {(String|String[]|...String} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  ascending(...keys) {
    this._order = [];
    return this.addAscending.apply(this, keys);
  }

  /**
   * Sorts the results in ascending order by the given key,
   * but can also add secondary sort descriptors without overwriting _order.
   *
   * @method addAscending
   * @param {(String|String[]|...String} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  addAscending(...keys) {
    if (!this._order) {
      this._order = [];
    }
    keys.forEach(key => {
      if (Array.isArray(key)) {
        key = key.join();
      }
      this._order = this._order.concat(key.replace(/\s/g, '').split(','));
    });

    return this;
  }

  /**
   * Sorts the results in descending order by the given key.
   *
   * @method descending
   * @param {(String|String[]|...String} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  descending(...keys) {
    this._order = [];
    return this.addDescending.apply(this, keys);
  }

  /**
   * Sorts the results in descending order by the given key,
   * but can also add secondary sort descriptors without overwriting _order.
   *
   * @method addDescending
   * @param {(String|String[]|...String} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  addDescending(...keys) {
    if (!this._order) {
      this._order = [];
    }
    keys.forEach(key => {
      if (Array.isArray(key)) {
        key = key.join();
      }
      this._order = this._order.concat(key.replace(/\s/g, '').split(',').map(k => {
        return '-' + k;
      }));
    });

    return this;
  }

  /** Query Options **/

  /**
   * Sets the number of results to skip before returning any results.
   * This is useful for pagination.
   * Default is to skip zero results.
   * @method skip
   * @param {Number} n the number of results to skip.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  skip(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('You can only skip by a positive number');
    }
    this._skip = n;
    return this;
  }

  /**
   * Sets the limit of the number of results to return. The default limit is
   * 100, with a maximum of 1000 results being returned at a time.
   * @method limit
   * @param {Number} n the number of results to limit to.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  limit(n) {
    if (typeof n !== 'number') {
      throw new Error('You can only set the limit to a numeric value');
    }
    this._limit = n;
    return this;
  }

  /**
   * Includes nested Parse.Objects for the provided key.  You can use dot
   * notation to specify which fields in the included object are also fetched.
   * @method include
   * @param {String} key The name of the key to include.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  include(...keys) {
    keys.forEach(key => {
      if (Array.isArray(key)) {
        this._include = this._include.concat(key);
      } else {
        this._include.push(key);
      }
    });
    return this;
  }

  /**
   * Restricts the fields of the returned Parse.Objects to include only the
   * provided keys.  If this is called multiple times, then all of the keys
   * specified in each of the calls will be included.
   * @method select
   * @param {Array} keys The names of the keys to include.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */
  select(...keys) {
    if (!this._select) {
      this._select = [];
    }
    keys.forEach(key => {
      if (Array.isArray(key)) {
        this._select = this._select.concat(key);
      } else {
        this._select.push(key);
      }
    });
    return this;
  }

  /**
   * Subscribe this query to get liveQuery updates
   * @method subscribe
   * @return {LiveQuerySubscription} Returns the liveQuerySubscription, it's an event emitter
   * which can be used to get liveQuery updates.
   */
  subscribe() {
    let controller = CoreManager.getLiveQueryController();
    return controller.subscribe(this);
  }

  /**
   * Constructs a Parse.Query that is the OR of the passed in queries.  For
   * example:
   * <pre>var compoundQuery = Parse.Query.or(query1, query2, query3);</pre>
   *
   * will create a compoundQuery that is an or of the query1, query2, and
   * query3.
   * @method or
   * @param {...Parse.Query} var_args The list of queries to OR.
   * @static
   * @return {Parse.Query} The query that is the OR of the passed in queries.
   */
  static or(...queries) {
    var className = null;
    queries.forEach(q => {
      if (!className) {
        className = q.className;
      }

      if (className !== q.className) {
        throw new Error('All queries must be for the same class.');
      }
    });

    var query = new ParseQuery(className);
    query._orQuery(queries);
    return query;
  }
}

var DefaultController = {
  find(className, params, options) {
    var RESTController = CoreManager.getRESTController();

    return RESTController.request('GET', 'classes/' + className, params, options);
  }
};

CoreManager.setQueryController(DefaultController);