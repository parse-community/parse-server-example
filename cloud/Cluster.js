/**
 * Created by cahlering on 7/9/14.
 */

var utils = require("./utils.js");
var _ = require("underscore");

var className = "MediaCluster";
var ClusterObject = Parse.Object.extend(className);

exports.ClusterObject = ClusterObject;

const CLUSTER_THRESHOLD = 5;
exports.CLUSTER_THESHOLD = CLUSTER_THRESHOLD;

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

exports.clusterForDeviceNearLocation = function(deviceId, location, forImage) {
  var clusterQuery = new Parse.Query(ClusterObject);

  clusterQuery.equalTo("deviceId", deviceId).withinKilometers("location", location, CLUSTER_THRESHOLD);

  console.log("clusterQuery: "); console.log(clusterQuery.toJSON());
  return clusterQuery.find().then(function(clusters) {
    var newClusters = [];
    console.log("found clusters: " + clusters.length);
    if (clusters.length == 0) {
      var newCluster = new ClusterObject({location: location, deviceId: deviceId, defaultImage: forImage});
      newClusters.push(newCluster.save());
    } else {
      newClusters = clusters;
    }
    _.each(newClusters, function(cluster) {
      if (!Parse.Promise.is(cluster)) {
        if (cluster.get("defaultImage") == null) {
          console.log("Set default image: " + forImage);
          cluster.set("defaultImage", forImage);
        }
      }
    });
    return Parse.Promise.when.apply(this, newClusters);
  }, function(error) {
    console.log("Error searching for cluster");
    console.log(error);
  });
};

exports.clusterForDevice = function(deviceId) {
  var clusterQuery = new Parse.Query(ClusterObject);

  clusterQuery.equalTo("deviceId", deviceId);

  return clusterQuery.limit(20).find();

};

/**
 *
 * @param deviceId
 * @param location
 * @returns Parse.Promise that should contain the single Cluster closest to the location.
 */
exports.getNearestCluster = function(deviceId, location) {
  var clusterQuery = new Parse.Query(ClusterObject);
  clusterQuery.equalTo("deviceId", deviceId).near("location", location);
  return clusterQuery.first();
};