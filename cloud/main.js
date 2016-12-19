Parse.Cloud.define("testPush", function(request, response) {
   var query = new Parse.Query("Installation");
   query.equalTo("profileId", "xdIy97hRiC");
   Parse.Push.send({
      where: query,
      data: {
         alert: "Kyle sent his first push notificaiton."
      }
   }, {
      success: function(results) {
         response.success("push sent");
      },
        
      error: function(error) {
         response.error();
      } 
   });
});
  
// Prevent adding user to a game they've already joined
// var User_Game = Parse.Object.extend("User_Game");
Parse.Cloud.beforeSave("User_Game", function(request, response) {
   var query = new Parse.Query("User_Game");
   query.equalTo("gameId", request.object.get("gameId"));
   query.equalTo("profileId", request.object.get("profileId"));
  
   query.first({
       success: function(object) {
       if (object) {
          response.error("A User_Game object with this gameId and profileId already exists.");
       } else {
          response.success();
       }
     },
     error: function(error) {
        response.error("Could not validate uniqueness for this User_Game object: " + error.message);
     }
  });
});
 
Parse.Cloud.afterSave("User_Game", function(request, response) {
  var profileId = request.object.get("profileId");
  var gameId = request.object.get("gameId");
  
  // Make sure the joined players attribute on Game object matches number of
  // players joined in User_Game
  var query = new Parse.Query("User_Game");
  query.equalTo("gameId", gameId);
  query.count({
    success: function(count) {
  
      // Do something with the returned Parse.Object values
      var joinedPlayersCount = count;
      var Game = Parse.Object.extend("Game");
      var queryGameObject = new Parse.Query(Game);
      queryGameObject.equalTo("objectId", gameId);
      queryGameObject.first({
        success: function(gameObject) {
          if (gameObject) {
            gameObject.set("numPlayers", joinedPlayersCount);
            console.error("num players set to " + gameObject.get("numPlayers"));
            gameObject.save();
          } else {
            console.error("A game with id " + gameId + " was not found.");
          };
        },
        error: function(error) {
          console.error("Error querying Game objects.");
        }
      });
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
  
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Installation);
  query.equalTo("profileId", profileId);
  query.find({
    success: function(results) {
       for (var i = 0; i < results.length; i ++) {
            var installation = results[i];              
            installation.addUnique("channels", gameId);
            installation.save(null, {
               success: function(object) {
                  console.error("sccess: " + object);
               },
               error: function (object, error) {
                  console.error("error" + error);
               }
            });
       }
    },
    error: function(error) {
      console.error(error);
    }
  });
});
  
Parse.Cloud.afterSave("Activity", function(request, response) {
   var type = request.object.get("type");
   if ("type" != "typeGameJoined")
   {
      return;
   }
  
   var profileId = request.object.get("profileId");
   var gameId = request.object.get("gameId");
   
   Parse.Cloud.useMasterKey();
   var query = new Parse.Query("Activity");
   query.equalTo("profileId", profileId);
   query.equalTo("gameId", gameId);
   query.equalTo("type", "typeGameCreated");
  
   query.get({
      success: function(foundObject) {
          request.object.destroy({
            success:function() {
                 console.error("Successfully destroyed unnecessary joined activity after creating.")
            },
            error:function(error) {
                 response.error('Could not delete object.');
            }
          });
      },
      error: function(error) {
         console.error(error);
      }
   });
  
   var joinedQuery = new Parse.Query("Activity");
   joinedQuery.equalTo("profileId", profileId);
   joinedQuery.equalTo("gameId", gameId);
   joinedQuery.equalTo("type", "typeGameJoined");
  
   joinedQuery.first({
      success: function(duplicateActivity) {
            duplicateActivity.destroy({
            success:function() {
                 console.error("Successfully destroyed duplicate joined activity.")
            },
            error:function(error) {
                 response.error('Could not delete object.');
            }
          });
      },
      error: function(error) {
         console.error(error);
      }
   });
  
   response.success()
});
  
Parse.Cloud.afterSave('Game', function(request, response) {
   var updated = new Date(request.object.get("updatedAt"));
   var created = new Date(request.object.get("createdAt"))
   if (updated.getTime() !== created.getTime())
   {
      console.error("Push object is not new");
      return;
   }
  
   var query = new Parse.Query(Parse.Installation);
   var id = request.object.id;
   query.equalTo("channels", id);
     
   Parse.Push.send({
      where: query,
      data: {
         alert: request.object.get('groupName') + ' is starting soon!'
      },
      push_time: new Date(request.object.get('eventDate') - (30 * 60000))
   }, {
         useMasterKey: true,
         success:function(results) {
  
         }, 
  
         error:function(error) {
            console.error("push error: " + error.message);
         }
      });
});
  
Parse.Cloud.define("findUser", function(request, response) {
var query = new Parse.Query("User");
query.equalTo("facebookId", "10154350328395203");
query.find({
    success: function(results) {
        // do something with the resulting user at results[0], if found
        response.success("success funind fb usr");
        console.error(results[0]);
    },
    error: function() {
        response.error("lookup failed");
    }
});
});
  
// Prevent invcoming duplicates from saving
var GameInvites = Parse.Object.extend("GameInvites");
Parse.Cloud.beforeSave("GameInvites", function(request, response) {
    var query = new Parse.Query(GameInvites);
    query.equalTo("gameId", request.object.get("gameId"));
    query.equalTo("toUserObjectId", request.object.get("toUserObjectId"));
    query.notEqualTo("objectId", request.object.get("objectId"))
    query.first({
       success: function(object) {
       if (object) {
          response.error("BeforeSave: A GameInvites object with this gameId and profileId already exists.");
          // object.destroy({
          //   success:function() {
          //         console.error("The existing GameInvites object was destroyed, and new object saved.");
          //         response.success();
          //   },
          //   error:function(error) {
          //        response.error('Could not delete object.');
          //   }
          // });
       } else {
          // Query games table to check if the user has already joined this game before trying to save the invite object.
          var UserGame = Parse.Object.extend("User_Game");
          var queryGames = new Parse.Query(UserGame);
          queryGames.equalTo("gameId", request.object.get("gameId"));
          queryGames.equalTo("profileId", request.object.get("toUserObjectId"));
          queryGames.first({
            success:function() {
              if (object) {
                response.error("The invited user has already joined the game.");
              }
              else {
                response.success();
              }
            },
            error:function(error) {
              response.error("Error retreiving game data for invited user.");
            }
          });
  
          response.success();
       }
     },
     error: function(error) {
        response.error("Could not validate uniqueness for this GameInvites object.");
     }
  });
});
 
Parse.Cloud.afterSave("GameInvites", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Installation);
  query.equalTo("profileId", request.object.get("toUserObjectId"));
 
  Parse.Push.send({
      where: query,
      data: {
         alert: "You've been invited to join " + request.object.get("gameNameString")
      }
   }, {
        useMasterKey: true,
         success:function(results) {
  
         }, 
  
         error:function(error) {
            console.error("push error: " + error.message);
         }
      });
});

Parse.Cloud.afterSave("FollowRequests", function(request, response) {
  Parse.Cloud.useMasterKey();

  var profileQuery = new Parse.Query("Profile");
  var fromObjId = request.object.get("fromProfileId")
  profileQuery.equalTo("objectId", fromObjId);

  profileQuery.first({
      success: function(foundObject) {

        // do something with the resulting user at results[0], if found
        var handle = foundObject.get("handle");
        var toId = request.object.get("toProfileId");
        var query = new Parse.Query(Parse.Installation);
        query.equalTo("profileId", toId);
        console.error("sending push to profileID " + toId)
        Parse.Push.send({
            where: query,
            data: {
               alert: handle + " has sent you a friend request!"
            }
         }, {
            useMasterKey: true,
            success:function(results) {
                console.error("followrequest push success");
            }, 
            error:function(error) {
                console.error("followrequest push failed");
            }
        });
    },
    error: function() {
        console.error("followrequest lookup failed");
    }
  });
});
