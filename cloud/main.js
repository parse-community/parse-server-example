Parse.Cloud.define('pushChannelMedidate', function(request, response) {

  // request has 2 parameters: params passed by the client and the authorized user
  var params = request.params;
  var user = request.user;

  var customData = params.customData;//JSON of push
  var users = params.attenders;//ids of relevant users
  console.log("#### Data " + customData);

  //Filter only user with thier ids in it
  var userQuery = new Parse.Query(Parse.User);
  userQuery.containedIn("objectId", users);
  for (var i = 0; i < users.length; i++) {
     console.log("#### User Ids " + users[i]);
  }

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.containedIn("user", userQuery);

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
