Parse.Cloud.define('pushChannelMedidate', function(request, response) {

  // request has 2 parameters: params passed by the client and the authorized user
  var params = request.params;
  var user = request.user;

  var custom = params.custom;//JSON string of push
  var users = params.attenders;//ids of relevant users
  console.log("#### Push Data " + custom);
  
  //Parsing Json for iOS Platforms
  var jsonObject= JSON.parse(custom);
  var alert = jsonObject.alert;
  var session_alert = jsonObject.session_alert;
  var push_title = jsonObject.push_title;
  var push_type = jsonObject.push_type;
  var message_object_id = jsonObject.message_object_id;
  var push_notification_id = jsonObject.push_notification_id;
  var push_object_id = jsonObject.push_object_id;
  
  console.log("#### Push Type " + push_type);

  //Filter only users with thier ids in it
  // var userQuery = new Parse.Query(Parse.User);
  // userQuery.containedIn("objectId", users);
  // for (var i = 0; i < users.length; i++) {
  //   console.log("#### User Id " + users[i]);
  // }

  var pushQuery = new Parse.Query(Parse.Installation);
  // switch (push_type) {
  //     case 0:
  //         pushQuery.equalTo("session_changed_push", true);
  //         console.log("#### session_changed_push");
  //         break;
  //     case 1:
  //         pushQuery.equalTo("user_followed_push", true);
  //         console.log("#### user_followed_push");
  //         break;
  //     case 2:
  //         pushQuery.equalTo("session_attender_push", true);
  //         console.log("#### session_attender_push");
  //         break;
  //     case 3:
  //         pushQuery.equalTo("new_follower_push", true);
  //         console.log("#### new_follower_push");
  //         break;
  //     case 4:
  //         //NOTHING TO FILTER
  //         console.log("#### session_deleted_push");
  //         break;
  //     case 5:
  //         pushQuery.equalTo("session_message_push", true);
  //         console.log("#### session_message_push");
  //         break;
  //     default:
  //         pushQuery.equalTo("session_changed_push", true);
  //         console.log("#### session_changed_push");
  //         break;
  // }
  // pushQuery.containedIn("user", userQuery);

  // Note that useMasterKey is necessary for Push notifications to succeed.
  Parse.Push.send({
      where: pushQuery, 
      data: {
        alert: alert,
        title: push_title,
        session_alert: session_alert,
        push_title: push_title,
        push_type: push_type,
        message_object_id: message_object_id,
        push_notification_id: push_notification_id,
        push_object_id: push_object_id,
        custom: custom
      }
  }, { success: function() {
     console.log("#### PUSH OK");
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});
