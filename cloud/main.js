var PubNub = require('./pubnub');

/*var clientz = require('cloud/test.js');*/
 
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
Parse.Cloud.define("getPossibleMatches", function(request, response){
	Parse.Cloud.useMasterKey();
	var queryLike = new Parse.Query("_User");
	queryLike.include("sObject");
	queryLike.get(request.params.userId, {
		success: function(likeUser){

		
	var query = new Parse.Query("Search");
	var mainQuery;
	var queryArray=[];
	query.equalTo("reference", request.params.userId);
	query.find().then(function(results){
	for(var i = 0; i < results.length; i++)
	{
		queryArray[i] = new Parse.Query("_User");
		queryArray[i].containedIn("intent", results[0].get("intent"));		
	}
	//minMseconds = Date.now() - (1000 * 60 * 60 * 24 * 365 * results[0].get("minmax")[0]);
	//nextAge = (results[0].get("nextAge") != "")? results[0].get("nextAge"): results[0].get("minAge") + 10;
	//maxMSeconds = Date.now() - (1000 * 60 * 60 * 24 * 365 * results[0].get("minmax")[1]);
	/*minDate = new Date(minMseconds);
	maxDate = new Date(maxMSeconds);
	minDateFormat = minDate.getFullYear()+"-"+
		((minDate.getMonth() < 10) ? "0"+ minDate.getMonth() : minDate.getMonth())
	+"-"+((minDate.getDay() < 10) ? "0"+ minDate.getDay() : minDate.getDay());
	maxDateFormat = maxDate.getFullYear()+"-"+
		((maxDate.getMonth() < 10) ? "0"+ maxDate.getMonth() : maxDate.getMonth())
	+"-"+((maxDate.getDay() < 10) ? "0"+ maxDate.getDay() : maxDate.getDay());*/
	//mainQuery.greaterThanOrEqualTo("user_birthday", new Date(maxDateFormat));
	//mainQuery.lessThanOrEqualTo("user_birthday", new Date(minDateFormat));
	point = new Parse.GeoPoint({latitude: request.params.latitude, longitude: request.params.longitude});
	
	mainQuery = Parse.Query.or.apply(Parse.Query, queryArray);
	mainQuery.include("sObject");
	mainQuery.notEqualTo("objectId", request.params.userId);
	mainQuery.containedIn("i_am_a", results[0].get("lookingFor"));
	mainQuery.containedIn("religious_belief", results[0].get("religiousBelief"));
	mainQuery.greaterThanOrEqualTo("age", results[0].get("minmax")[0]);
	mainQuery.lessThanOrEqualTo("age", results[0].get("minmax")[1]);
	mainQuery.withinKilometers("userLocation", point, 100);
	mainQuery.notContainedIn("objectId", likeUser.get("sObject").get("user_seen"));

	mainQuery.limit(25);
	mainQuery.find({
		success: function(result) {
			response.success(result);
		},
		error: function(error) {
			response.error("We could not find matches near you at this time. Please try again soon");
		}
	});
	});
	},
		error: function(object, error) {
			response.error(result)
		}
	});
});
Parse.Cloud.define("onLike", function(request, response){
	Parse.Cloud.useMasterKey();
	if(request.params.like_type == "like"){
		user_like="user_like"
		user_like_me="user_like_me"
	} else if(request.params.like_type == "dislike"){
		user_like="user_dislike"
		user_like_me="user_dislike_me"
	} else if (request.params.like_type == "super_like") {
		user_like="user_super_like"
		user_like_me="user_super_like_me"
	}
	var query = new Parse.Query("_User");
	var currentUser, targetUser;
	query.containedIn("objectId", [request.params.userId, request.params.targetUserId]);
	query.include("sObject");
	query.find({
		success: function(currentUsers) {
			Parse.Cloud.useMasterKey();
			if(currentUsers[0].id == request.params.userId){
				currentUser = currentUsers[0];
				targetUser  = currentUsers[1];
			} else {
				currentUser = currentUsers[1];
				targetUser  = currentUsers[0];
			}
						currentUser.get("sObject").addUnique(user_like, request.params.targetUserId);
						currentUser.get("sObject").addUnique("user_seen", request.params.targetUserId);
						//currentUser.get("sObject").save();
						
						targetUser.get("sObject").addUnique(user_like_me, request.params.userId);
						//targetUser.get("sObject").save();


			if (request.params.like_type != "dislike") {
			if (currentUser.get("sObject").get("user_like_me").indexOf(request.params.targetUserId) != -1
				|| currentUser.get("sObject").get("user_super_like_me").indexOf(request.params.targetUserId) != -1) {
						currentUser.get("sObject").addUnique("user_matches", request.params.targetUserId);
						targetUser.get("sObject").addUnique("user_matches", request.params.userId);
						
						var pubnub = PubNub({
    						publish_key: 'pub-c-cfa5a241-8cb8-4263-a498-394e2d385909',
    						subscribe_key: 'sub-c-e3913a52-0462-11e6-8c3e-0619f8945a4f'
  						});

  						
  						if (currentUser.get("isNotifyMatches")){
  							pubnub.publish({
    							channel: request.params.userId,
    							message: "Congratulations. You have a new match.",
    							callback: function (result) {
      								console.log("Match");
    							},
	    						error: function (error) {
      								console.log("Error Match");
    							}
						 	});
  						}
  						
  						if (targetUser.get("isNotifyMatches")){
	  						pubnub.publish({
    							channel: request.params.targetUserId,
    							message: "Congratulations. You have a new match.",
    							callback: function (result) {
      								console.log("Match");
    							},
    							error: function (error) {
      								console.log("Error Match");
    							}
						 	});						
  						}

						response.success("Match");

						/*var pushQuery = new Parse.Query(Parse.Installation);
						query.containedIn("user", [request.params.userId, request.params.targetUserId]);
						Parse.Push.send({
							where: pushQuery,
							data: {
								title: "New Aimer match",
								alert: "Congratulations. You have a new match."
							}
						}, {
							success: function(){
								response.success("Match");
							},
							error: function() {}
						});*/
/* Renish code
							var user1 = new Parse.User();
							var user2 = new Parse.User();
							var isError = true;

							var query1 = new Parse.Query(Parse.User);
							query1.get(request.params.userId, {
  								success: function(results) {
    								user1 = results;
    								isError = false;
  								},
						  			error: function() {
						  				isError = true;
  								}
							});

							if (!isError){
								var query2 = new Parse.Query(Parse.User);
								query2.get(request.params.targetUserId, {
  									success: function(results) {
    									user2 = results;
    									isError = false;
  									},
						  			error: function() {
						  				isError = true;   
  									}
								});
							}

							if (!isError){
								var queryPush = new Parse.Query(Parse.Installation);
								queryPush.containedIn("user", [user1, user2]);

								Parse.Push.send({
  										where: queryPush, 
  										data: {
    										alert: "Willie Hayes injured by own pop fly."
  										}
									}, {
					  				success: function() {
    									title: "New Aimer match",
										alert: "Congratulations. You have a new match."
  									},
  									error: function() {
    									response.success("Match");
  									}
								});
							}
*/
					} else {
						if(request.params.like_type == "like")
						{
							response.success("Liked");
						}
						else if (request.params.like_type == "super_like")
						{
							response.success("Super Liked");
						}
					}
					currentUser.get("sObject").save();
					targetUser.get("sObject").save();
				} else {
					response.success("dislike");
				}
				},
		error: function(Object, error) {
				response.error(error.message);
		}
	});	
});
Parse.Cloud.define("onUnmatch", function(request, response){
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query("_User");
	query.containedIn("objectId", [request.params.userId, request.params.targetUserId]);
	query.include("sObject");
	query.find({
		success: function(currentUsers) {
			if(currentUsers[0].id == request.params.userId){
				currentUser = currentUsers[0];
				targetUser  = currentUsers[1];
			} else {
				currentUser = currentUsers[1];
				targetUser  = currentUsers[0];
			}
			currentUser.get("sObject").remove("user_matches", request.params.targetUserId);
			targetUser.get("sObject").remove("user_matches", request.params.userId);
			currentUser.save();
			targetUser.save();
			response.success("Unmatched");
		},
		error: function(Object, error) {
			response.error(error.message);
		}
});
});

