Parse.Cloud.define('hello', function(request, response) {
   console.log("hellow LOG0"); 
   var initValue = 0;
   response.success('Hi NEW 0'+initValue);
});


 Parse.Cloud.define("sendPushToChannels", function(request, response) {
  
  var pushChannel2Cloud = request.params.pushChannel2Cloud;
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("deviceType", "android");
  pushQuery.equalTo("channels", pushChannel2Cloud);
  
  Parse.Push.send({
    channels: [ request.params.pushChannel2Cloud],
    data:{
		    location : request.params.location,
			describe : request.params.describe,
			ParseUserObjId : request.params.ParseUserObjId,
			detectTime : request.params.detectTime,
			detectPPM : request.params.detectPPM                                            
		 }
  }, { useMasterKey: true }).then(function() {
      response.success("########Push was sent successfully.")
  }, function(error) {
      response.error("##########Push failed to send with error: " + error.message);
  });
});

Parse.Cloud.define("sendPushToSingle", function(request, response) {
  var senderUser = request.user;
  var pushSingle2Cloud = request.params.pushSingle2Cloud;

 
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('username', request.params.pushSingle2Cloud);
 
  // Send the push notification to results of the query
  Parse.Push.send({
    where: pushQuery,
     data:{
		    location : request.params.location,
			describe : request.params.describe,
			ParseUserObjId : request.params.ParseUserObjId,
			detectTime : request.params.detectTime,
			detectPPM : request.params.detectPPM                                            
		 }
  }, { useMasterKey: true }).then(function() {
	   console.log("#### PUSH OK for : " + request.params.pushSingle2Cloud )
      response.success("Push was sent successfully.")
  }, function(error) {
	   console.log("#### PUSH ERROR" + error.message);
      response.error("Push failed to send with error: " + error.message);
  });
});


Parse.Cloud.define('pushChannelTest', function(request, response) {
 
  var params = request.params;
  var user = request.user;
 
  var customData = params.customData;
  var launch = params.launch;
  var broadcast = params.broadcast;

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("deviceType", "android");

  var payload = {};

  if (customData) {
      payload.customdata = customData;
  }
  else if (launch) {
      payload.launch = launch;
  }
  else if (broadcast) {
      payload.broadcast = broadcast;
  }

  Parse.Push.send({
  where: pushQuery,      // for sending to a specific channel
  data: payload,
  }, { success: function() {
     console.log("#### PUSH OK" + payload );
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});

Parse.Cloud.define("averageStars", function(request, response) {
  var query = new Parse.Query("Review");
  query.equalTo("movie", request.params.movie);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get("stars");
      }
      response.success(sum / results.length);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});

Parse.Cloud.run('averageStars', { movie: 'The Matrix' },{success: function(result) {console.log("sucess");}, error: function(error) { }}).then(function(ratings) {
  console.log("ratings = "+ratings); 
});

//Parse.Cloud.beforeSave(Parse.User, function(request, response) {
//  var user = request.object;
//  if (!user.get("email")) {
//    response.error("Every user must have an email address..........beforeSave");
//  } else {
//    response.success();
//  }
//});
