/**
 * Created by cahlering on 8/20/14.
 */

var _ = require("underscore");
var upload = require("./PhotoUpload");
var push = require("./Push");
var kue = require("kue"), queue = kue.createQueue({jobEvents: false});

var className = "ParseObjectBatch";
var BatchUploadObject = Parse.Object.extend(className);

function processSingleBatch(deflatedBatch) {
  deflatedBatch.className = className;
  var batch = Parse.Object.fromJSON(deflatedBatch);
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
  batch.set("processed", true).save();
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
  if (request.object.existed() == false) {
    var job = queue.create("batch", {batchObj: request.object, deviceId: deviceId}).removeOnComplete(true).save();
    queue.process("batch", function (job, done) {
      processSingleBatch(job.data.batchObj).then(function (newObjects) {
        return upload.clusterUnclusteredForDevice(job.data.deviceId);
      }).then(function (clustered) {
        push.sendPushToDevice(job.data.deviceId, "", "batch", {});
        done();
      });
    });
  }
  response.success();
});
