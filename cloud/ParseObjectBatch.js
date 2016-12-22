/**
 * Created by cahlering on 8/20/14.
 */

var _ = require("underscore");
var upload = require("./PhotoUpload");
var push = require("./Push");

var className = "ParseObjectBatch";
var BatchUploadObject = Parse.Object.extend(className);

function processSingleBatch(batch) {
  var objectArrayStr = batch.get("parseObjectJson");
  var objectType = batch.get("parseObjectType");
  var ParseObject = Parse.Object.extend(objectType);
  var batchObjectArray = JSON.parse(objectArrayStr);

  var createdInBatch = [];
  _.each(batchObjectArray, function (batchObject) {
    var newObject = new ParseObject();
    newObject.set(batchObject);
    createdInBatch.push(newObject.save());
  });
  return Parse.Promise.when.apply(this, createdInBatch);
}

Parse.Cloud.beforeSave(className, function(request,response) {
  var user = request.user;
  if (request.user && request.object.get("user") == null) {
    request.object.set("user", request.user);
  }
  if (!request.object.get("deviceId")) {
    response.error("please provide a deviceId");
  } else {
    response.success();
  }
});

Parse.Cloud.afterSave(className, function(request, response) {
  var deviceId = request.object.get("deviceId");
  request.object.set("processed", true);
  processSingleBatch(request.object).then(function (batchObjects) {
    return upload.clusterUnclusteredForDevice(deviceId);
  }).then(function(clusteredObjects) {
    push.sendPushToDevice(deviceId, "", "batch", {});
  });
  response.success();
});
