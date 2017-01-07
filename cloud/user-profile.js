// User profile update

//deprecated, but need to keep it for backward compatible
Parse.Cloud.define("updateUserStats", function(request, response) {

	var userId =request.params.userId;
	var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);
    userQuery.limit(1)
    userQuery.find({
    		useMasterKey:true,
    		success: function(results) {
				if(!results[0]){
					response.error("User doesn't exist! "+ userId);
					return;
				}
    			var user = results[0];
    			var totalAppUseTimeScore = user.get("timePlayedTotal")/10 || 0;
                if(totalAppUseTimeScore > 500) {
                		totalAppUseTimeScore = 500 + (totalAppUseTimeScore - 500)/10;
                }
				console.log("userId = " + userId+", totalAppUseTimeScore="+totalAppUseTimeScore);
				var bookQuery =new Parse.Query("PublishedBook");
				bookQuery.equalTo("owner",user);
				bookQuery.find({
						useMasterKey:true,
						success: function(results) {
							var totalReads = 0;
							var totalLikes = 0;
							var totalFeatured = 0;
							var totalBannedBook = 0;
							var totalCheats = 0;

							for (i=0; i < results.length; i++) {
								var book = results[i];
								var isBookActive = book.get("active") || (book.get("active")=== undefined);
								if(isBookActive){
									var bookReads = book.get("playedTimes") || 0;
									var bookLikes = book.get("likedTimes") || 0;
									if (bookReads >= bookLikes) {
										totalReads += bookReads;
										totalLikes += bookLikes;
									}else{
										totalCheats ++;
									}
									totalFeatured += book.get("featuredAccepted") || 0;
								}else{
									totalBannedBook ++;
								}
							}
							var totalScore = totalReads * 10 + totalLikes * 50 + totalFeatured * 250 + totalAppUseTimeScore - totalBannedBook * 250 - totalCheats * 250;
							user.set("totalReadsByOthers", totalReads);
							user.set("totalLikesByOthers", totalLikes);
							user.set("totalScore", totalScore );
							user.set("totalFeatured", totalFeatured );
							user.set("totalBanned", totalBannedBook );
							user.set("totalCheats", totalCheats );
							var userRankQuery = new Parse.Query(Parse.User);
							userRankQuery.greaterThan("totalScore", totalScore);
							userRankQuery.count({
								useMasterKey:true,
								success: function(rank) {
									rank = rank + 1;
									console.log("Rank = "+rank+", userId = " + userId);
									user.set("rank", rank);
									user.save(null, { useMasterKey: true });
									response.success({
										totalScore : totalScore,
										rank: rank
									});
								},
								error: function() {
									response.success({
										totalScore : totalScore
									});
								}
							});


						},
						error: function() {
                            user.set("totalScore", totalAppUseTimeScore )
                            user.save(null, { useMasterKey: true });
							response.success({
								totalScore : totalAppUseTimeScore
							});
						}
				});
    		},
    		error: function() {
    			response.error("User doesn't exist! "+ userId);
    		}
    	});
});

Parse.Cloud.define("UpdateUserProfile", function(request, response) {
	var username =request.params.username;

	var promises = [];

	var userQuery =new Parse.Query("_User");
	userQuery.equalTo("username",username);
    userQuery.limit(1);
	promises.push(userQuery.find());

	var userProfileQuery =new Parse.Query("UserProfile");
	userProfileQuery.equalTo("username", username);
    userProfileQuery.limit(1);
	promises.push(userProfileQuery.find({useMasterKey:true}));

	Parse.Promise.when(promises).then( function(results) {
//       console.log("user:"+user.toJSON());
       var user = results[0][0];
       var userProfile = results[1][0];
       if(userProfile){
			userProfile.set("test","test123")
			response.success(userProfile.toJSON());
		}else{
			response.error("userProfile doesn't exist:"+username);
		}
    }, function(error){
    	console.log("error:"+error);
      	response.error("failed to query UserProfile:"+error);
    });


	console.log("search with username:"+username);
});

function testQuery(username){
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("username",username);
    return userQuery.find();
}

Parse.Cloud.define("ValidateUserData", function(request, response){
	var username =	request.params.username;

    Parse.Promise.when([testQuery(username), testQuery("asd")]).then(function(results){
        console.log("results.length="+results.length); // Returns 4 NOT 8
       	response.success(results);
    }, function(error){
         	console.log("error:"+error);
           	response.error("failed to query UserProfile:"+error);
         });
});
