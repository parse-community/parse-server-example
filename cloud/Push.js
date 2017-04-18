//var photoUpload = require("cloud/PhotoUpload.js"); adding this file as a dependency to PhotoUpload created a circular dependency that broke the cli deployment.
// manually loading photo upload locally for now

var imageClassName = "ImageMedia";
var photoUpload = Parse.Object.extend(imageClassName);

//var uploadQuery = new Parse.Query(photoUpload.ClassObject);
var uploadQuery = new Parse.Query(photoUpload);

uploadQuery.descending("dateImageTakenTs");

Parse.Cloud.define("pushios", function(request, response) {
  var query = new Parse.Query(Parse.Installation);
  query.equalTo('deviceType', 'ios');

  Parse.Push.send({
    where: query, // Set our Installation query
    data: {
      alert: "See what you've done today."
    }
  }, {
    success: function () {
      // Push was successful
      response.success();
    },
    error: function (error) {
      // Handle error
      response.error(error);
    }
  });
});

Parse.Cloud.define("push", function(request, response) {
  var deviceId = request.params.deviceId;
  var msg = request.params.msg;
  var streamGroup = request.params.streamGroup;
  if (msg == null) msg = "See what you've done today.";
  exports.sendPushToDevice(deviceId, msg, streamGroup, {
    success: function () {
      // Push was successful
      response.success("ok");
    },
    error: function (error) {
      // Handle error
      response.error(error);
    }
  });
});

exports.sendPushToDevice = function(deviceId, msg, streamGroup, options) {
  var query = new Parse.Query(Parse.Installation);
  query.equalTo("deviceId", deviceId);

  Parse.Push.send({
    where: query, // Set our Installation query
    data: {
      alert: msg,
      streamGroup: streamGroup
    }
  }, options);
}
