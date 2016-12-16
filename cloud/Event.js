/**
 * Created by cahlering on 7/9/14.
 */

var utils = require("./utils.js");
var _ = require("underscore");
var photoUpload = require("./PhotoUpload.js");
var cluster = require("./Cluster.js");
var push = require("./Push.js");
var moment = require("moment");

var className = "Event";
var EventObject = Parse.Object.extend(className);

Parse.Cloud.beforeSave(className, function(request, response) {
  var user = request.user;
  if (!request.object.get("deviceId")) {
    response.error("please provide a deviceId");
  } else {
    if (request.user && request.object.get("user") == null) {
      request.object.set("user", request.user);
    }
    response.success();
  }
});


/**
 * @param deviceId
 * @param location
 * @returns {Parse.Promise} representing the queried event objects
 */
exports.eventForDeviceNearLocation = function(deviceId, location) {
  var eventQuery = new Parse.Query(EventObject);

  eventQuery.equalTo("deviceId", deviceId).withinKilometers("location", location, 3.5);

  return eventQuery.find();

};

/**
 * @param deviceId
 * @returns {Parse.Promise} representing the queried event objects
 */
exports.eventsForDeviceId = function(deviceId) {
  var clusterQuery = new Parse.Query(EventObject);

  clusterQuery.equalTo("deviceId", deviceId).decending("mostRecentImageTakenTs");

  return clusterQuery.find();

};

exports.createEventForLatest = function(deviceId, completionCallback) {

  var oneHourAgo = new Date(new Date().getTime() - (90 * 60 * 1000)); // set cutoff for considering events, 90 minutes prior to now
  var latestEventCreated = new Date(new Date().getTime() - (2192 * 60 * 60 * 1000)); // set a default in the case of no events
  var latestEvent = new Parse.Query(EventObject);
  latestEvent.equalTo("deviceId", deviceId);
  latestEvent.descending("mostRecentImageTakenTs");
  latestEvent.first().then(function(event) {

    // update the latest event created date if we have one.
    if (typeof event != 'undefined' && event.get("mostRecentImageTakenTs") != null) {
      latestEventCreated = event.get("mostRecentImageTakenTs");
    }
    return Parse.Promise.as(latestEventCreated);

  }).then(function(latestEventCreatedTime) {

    console.log(latestEventCreatedTime);
    return photoUpload.getItemsForDeviceSortedByDateTaken(deviceId);

  }).then(function (photos) {

    var eventPhotos = {};
    _.each(photos, function (photo) {
      var photoDate = new Date(photo.get("dateImageTakenTs"));
      if (photoDate.getTime() > latestEventCreated && photoDate.getTime() <= oneHourAgo && photo.get("longitude") != 0 && photo.get("latitude") != 0){
        console.log("photo has appropriate recency and valid location: " + photo.id);

        var primaryCluster = photo.get("primaryCluster");
        if (primaryCluster == null) {
          photoUpload.updatePrimaryCluster(photo);
        }
        if (primaryCluster != null) {
          var clusterPhotos = eventPhotos[primaryCluster.id];
          if (clusterPhotos == null) {
            clusterPhotos = new Array();
            eventPhotos[photo.get("primaryCluster").id] = clusterPhotos;
          }
          clusterPhotos.push(photo);
        }
      }
    });
    console.log("eventPhotos:" + Object.keys(eventPhotos).length);;
    var promises = [];
    Object.keys(eventPhotos).forEach(function(cluster) {
      var clusterPhotos = _.sortBy(eventPhotos[cluster], function(photo){ return photo.get("dateImageTakenTs") });

      var currentPartition, partitions = [];
      var trailingMoment = moment(0);
      _.each(clusterPhotos, function(photo) {
        var photoMoment = moment(photo.get("dateImageTakenTs"));
        var momentGap = photoMoment.diff(trailingMoment, "minutes");
        console.log("Gap: " + momentGap);
        if (momentGap > 180) {
          currentPartition = [];
          partitions.push(currentPartition)
        }
        currentPartition.push(photo);
        trailingMoment = photoMoment;
      });

      _.each(partitions, function(partitionedPhotos) {
        if (partitionedPhotos.length >= 3) {
          var mostRecentImageTakenTs = 0;
          _.each(partitionedPhotos, function (photo) {
            if (photo.get("dateImageTakenTs") > mostRecentImageTakenTs) {
              mostRecentImageTakenTs = photo.get("dateImageTakenTs");
            }
          });
          var event = new EventObject();
          event.set("deviceId", deviceId);
          event.set("mostRecentImageTakenTs", mostRecentImageTakenTs);
          var mediaRelation = event.relation("media");
          mediaRelation.add(partitionedPhotos);
          event.set("defaultImage", partitionedPhotos[0]);
          promises.push(event.save());
        }
      });
    });
    console.log("promises:" + promises.length);
    if (promises.length > 0) {
      var msg = "We've created an story for you";
      push.sendPushToDevice(deviceId, msg, "event", {
        success: function() {
          console.log("Send Push message for event creation to " + deviceId);
        },
        error: function (error) {
          console.log(error);
        }
      });
    }
    return Parse.Promise.when.apply(this, promises);
  }).done(function () {
      completionCallback();
    }
  );
};
