
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
var _ = require("underscore");
var moment = require("moment");
var cluster = require("./Cluster.js");
var event = require("./Event.js");
var photoUpload = require("./PhotoUpload.js");
var objectBatch = require("./ParseObjectBatch.js");
var strategy = require("./strategy.js");
var pushNote = require("./Push.js");
var social = require("./social.js");

var message = require('./message.js');

Parse.Cloud.define("nearLocation", function(request, response) {
  var lat = request.params.latitude;
  var lng = request.params.longitude;

  var searchRadiusInKilometers = 3.5;

  photoUpload.getItemsNearLocation(request.params.deviceId, lat, lng, searchRadiusInKilometers, function(results) {
    response.success(results);
  });

}, function(req) {
  return req.params.latitude != null && req.params.longitude != null;
});

var photoMixSort = function(o1, o2) {
  var o1Val = o1.get("lastPhotoMixResponse");
  if (o1Val == null) o1Val = 0;
  var o2Val = o2.get("lastPhotoMixResponse");
  if (o2Val == null) o2Val = 0;
  return o1Val - o2Val;
};

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

var photoMix = function(request, response) {

  photoUpload.getClusterBag(request.params.deviceId).then(function() {
    console.log("retrieved clusters: " + arguments.length);
    if (arguments.length > 0) {
      var responseResult = [];
      _.each(arguments, function (mixResult) {
        responseResult = responseResult.concat(shuffle(mixResult));
      });
      return Parse.Promise.as(shuffle(responseResult));
    } else {
      return photoUpload.getPhotoUploadQueryForDevice(request.params.deviceId).find();
    }
  }).then(function(responseResult) {

    responseResult = _.uniq(responseResult, false, function(obj) { return obj.id; });

    responseResult = responseResult.sort(photoMixSort);

    responseResult = _.first(responseResult, _.min([request.params.count, 20]));

    var now = Date.now();
    var nowFomatted = moment();
    var hydratedResponse = [];
    _.each(responseResult, function(uploadObject) {
      uploadObject.set("lastPhotoMixResponse", now);
      uploadObject.set("lastPhotoMixFormatted", nowFomatted.format());
      hydratedResponse.push(new Parse.Query(photoUpload.ClassObject).get(uploadObject.id));
    });
    Parse.Object.saveAll(responseResult);
    Parse.Promise.when(hydratedResponse).then(function() {
      response.success(arguments[0]);
    });
  }, function(errors) {
    response.error("Errors retrieving photoMix");
  });
};

Parse.Cloud.define("photoMix", function(request, response) {
  photoMix(request, response);
});

Parse.Cloud.define("autoEvent", function(request, response) {
  var EventLog = Parse.Object.extend("CallLog");
  var eventLog = new EventLog();
  eventLog.set("apiCall", "autoEvent");
  eventLog.set("parameters", request.params);
  eventLog.save();
  event.createEventForLatest(request.params.deviceId, function () {
    response.success("created");
  });
});

Parse.Cloud.define("recent", function(request, response) {
  photoUpload.getItemsForDeviceSortedByDateTaken(request.params.deviceId).then(function(responseResult) {
    response.success(_.first(responseResult, 25));
  }, function(errors) {
    response.error(errors);
  });
});

Parse.Cloud.define("index", function(request, response) {
  var photoMixResponse = {
    successResponse: null,
    errorResponse: null,
    success: function(result) {
      this.successResponse = result;
    },
    error: function(error) {
      this.errorResponse = error;
    }
  };
  photoMix(request, photoMixResponse);

  response.success(photoMixResponse.successResponse);
});

