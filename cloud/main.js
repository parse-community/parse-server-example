
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

//Push Notification for messages that are received
Parse.Cloud.afterSave("Messages", function(request) {
  var messageText = request.object.get('msg');
  var usersReceived = request.object.get('to');
  var currentUser = Parse.User.current();
  var pushQuery = new Parse.Query(Parse.Installation);
      pushQuery.equalTo('user', usersReceived);
      //pushQuery.notEqualTo('user', currentUser);
        Parse.Push.send({
            where: pushQuery, // Set our Installation query
            data: {
              alert: "New message: " + messageText
             }
            }, {
      success: function() {
      // Push was successful
          },
      error: function(error) {
        throw "Got an error " + error.code + " : " + error.message;
          }
            });
});
