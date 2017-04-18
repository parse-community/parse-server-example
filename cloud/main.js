/* 
 * FoodChain Cloud Code using Parse Cloud Hosting
 * Copyright by FoodChain, Inc.
 * 
 */

/*
Parameters
parseObject: post objectid we are working with
participantId: userid of the interaction
interactionType: Boolean for tried or trashed
*/
 
Parse.Cloud.define("saveInteraction", function(request, response) {
   
 
 //set variables to parameters
    var post = request.params.parseObject;
    var user = request.params.participantId;
    var interaction = request.params.interactionType;

 
 //create the json item
    var item = {}
    item["interaction"] = interaction;
    item["userid"] = String(user);
 
    var obj = item;
    
    //array to keep jsons in
    var jsonArray = [];
    

 

    //query the post class for the specific post item
    var Post = Parse.Object.extend("Post");
    var query = new Parse.Query(Post);
    query.equalTo("objectId", post);
    query.find({
        success: function(results) {
    // Do something with the returned Parse.Object value
    for (var i = 0; i < results.length; i++) {
      var object = results[i];
      
      //get the array
      var parseArray = object.get('userinteraction');
      //var parseArray = JSON.parse(parseItem);
      //console.log(parseItem);
      //check if the array is nil
      if (parseArray == undefined){
          console.log("in the undefined");
          //array is nil so create new array and add item to save
          var temp = [];
          temp.push(obj);
          var finished = JSON.stringify(temp);
          var testfinal = JSON.parse(finished)
          object.set("userinteraction",testfinal);
        
      }else
      //not nill so we must check to see if user has already interacted
      {
          console.log("in the else");
  
                   
          var found = false;
          var atmp = parseArray
          //loop through all items in the array
          for (var f = 0; f < parseArray.length; f++){
              var theinteraction = parseArray[f];
              
              var interacteduser = theinteraction['userId'];
              //get the user id
              //must check for userid as well due to an error
              if (interacteduser == null){
                  interacteduser = theinteraction['userid'];
              }
              //now check if it is equal
              if (interacteduser == user){
                  //are equal so update
                  found = true;
                 jsonArray.push(item)
                  
              }else{
                  //do nothing and let loop
                  jsonArray.push(theinteraction)
              }
              
              
              
          }
         
          //must check if it has been found now
          
          if (found == false){
              //not found so add to array
              console.log("in the false");
              jsonArray.push(item);
              var finaledit = JSON.stringify(jsonArray);
              var finalarray = JSON.parse(finaledit);
              
              var arr = [];
              for(var d in finalarray){
                 
                  //var hopefully = JSON.stringify(finalarray[d]);
                   console.log(finalarray[d]);
                  arr.push(finalarray[d]);
              }
              
              object.set("userinteraction",arr);
          }else{
              //it was found already and the item has been updated so do nothing
              console.log("in the found else");
              var finaledit = JSON.stringify(jsonArray);
              var finalarray = JSON.parse(finaledit);
              object.set("userinteraction",finalarray);
              
          }
          
          
          
      }
      
        object.save(null, {
        success: function(gameScore) {
    // Execute any logic that should take place after the object is saved.
    response.success('Yeaaa Success');
  },
        error: function(gameScore, error) {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    response.error(error);
  }
});
    }
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});
    
 
//end
     
}); 
/*
Parameters
particpantName: Username of the person who initiates the interaction
participantId: the Parse objectId of the user who initiated the interaction
interactionType: the interaction code - will determine the message sent as well as the uri for the relevant activity (android only)
recipientId: the username of the person who will be receiving the notification. Will be found associated with and installation
postId: the id of the post on which the interaction has occurred
*/
  
Parse.Cloud.define("sendPushToUser", function(request, response) {
  var participantName = request.params.participantName; //username of person that the notification is from
  var participantId = request.params.participantId;
  var recipientUsername = request.params.recipientId;
  var interactionType = request.params.interactionType;
  var postId = request.params.postId;
   
 //set interaction codes
  var TRIED_IT_CODE = 0;
  var TRASHED_IT_CODE = 1;
  var SHARED_CODE = 3;
  var FLAGGED_CODE = 4;
  var FOLLOWED_USER_CODE = 5;
  var TAGGED_USER_CODE = 6;
  var COMMENT_CODE = 2;
  var message;
    
    //determine which message should be sent based on interaction type
    switch (interactionType) {
            case TRIED_IT_CODE:
                message = participantName + " would try one of your posts!";
                break;
            case TRASHED_IT_CODE:
                message = participantName + " would trash one of your posts!";
                break;
            case SHARED_CODE:
                message = participantName + " has shared one of your posts!";
                break;
  
            case FOLLOWED_USER_CODE:
                message = participantName + " has followed you!";
                break;
            case TAGGED_USER_CODE:
                message = participantName + " has tagged you in a post!";
                break;
            case COMMENT_CODE:
                message = participantName + " has commented on one of your posts!";
                break;
            //still send push notification even if an interaction type that is not supported is used
            default:
                message = participantName + " has sent you a notification!";
                break;
        }
          
        //set which uri will launch on android
        var androidURI = "mainActivity://foodchain.co/a?activityId=notification" ;
        /*if(interactionType == FOLLOWED_USER_CODE){
                //send to user profile
                androidURI = "userProfileActivity://foodchain.co/a?userId="+participantId;
        }else{
                //send to post
                androidURI = "CommentOnPostScrollActivity://foodchain.co/a?postId="+postId;
        }*/
    
  // Send the push.
  // Find devices associated with the recipient user
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("username", recipientUsername);
  // Send the push notification to results of the query
  Parse.Push.send({
  where: pushQuery,
  data: {
    alert: message,
    badge: "Increment",
    sound: 'default',
    title: "FoodChain",
    uri: androidURI
  }
}, {
  success: function() {
    console.log('##### PUSH OK');
  },
  error: function(error) {
    console.log('##### PUSH ERROR');
  },
  useMasterKey: true
});
   


});
  
//ignore below this line for now -Chris
var Buffer = require('buffer').Buffer;
Parse.Cloud.define("generatePullRequest", function (request, response){
      
    //get query parameters
      
    //save to parse
      
    //open github issue
    //return "This has been ran";
    Parse.Cloud.httpRequest({
        method: 'GET',
          
        url: 'https://api.github.com/users/username/repos/username/repo/issues',
        followRedirects: true,
        headers: {
              
            'Authorization': 'Basic ' + new Buffer('username:password', 'base64'),
            //'Authorization': 'Basic ' + 'username:password',
            'User-Agent': 'username'
        }/*,
        body: {
            title: 'Vote for Pedro',
            body: 'If you vote for Pedro, your wildest dreams will come true'
        }*/
}).then(function(httpResponse) {
  console.log(httpResponse.text);
  response.success(httpResponse.text);
}, function(httpResponse) {
  console.error('Request failed with response code ' + httpResponse.status);
  response.error('Request failed with response code ' + httpResponse.status);
  
})
  
response.success
  
});
  
  
Parse.Cloud.define('testing', function(req, res) {
  res.success('Hi from the foodchain Inc. cloud testing function!!');
});
