Parse.Cloud.define('pushChannelMedidate', function(request, response) {

  // request has 2 parameters: params passed by the client and the authorized user
  var params = request.params;
  var user = request.user;

  // var action = params.action;
  // var message = params.message;
  var customData = params.customData;//JSON of push
  var users = params.attenders;

  // use to custom tweak whatever payload you wish to send
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.containedIn("user", users);
  // pushQuery.equalTo('channels', 'MSessions');
  // pushQuery.equalTo("deviceType", "android");
  // pushQuery.equalTo("deviceType", "ios");

  // Note that useMasterKey is necessary for Push notifications to succeed.
  Parse.Push.send({
      where: pushQuery, 
      data: {
        customdata: customData
      }
  }, { success: function() {
     console.log("#### PUSH OK");
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});
