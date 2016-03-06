Parse.Cloud.define('pushChannelMedidate', function(request, response) {

  // request has 2 parameters: params passed by the client and the authorized user
  var params = request.params;
  var user = request.user;

  // extract out the channel to send
  var action = params.action;
  var message = params.message;
  var customData = params.customData;

  // use to custom tweak whatever payload you wish to send
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("deviceType", "android");
  pushQuery.equalTo("deviceType", "ios");

  var payload = {"data": {
      "alert": message,
      "action": action,
      "customdata": customData}
                };

  // Note that useMasterKey is necessary for Push notifications to succeed.

  Parse.Push.send({
  where: pushQuery,      // for sending to a specific channel                                                                                                                                 data: payload,
  }, { success: function() {
     console.log("#### PUSH OK");
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});
