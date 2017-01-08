// User profile update
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

	var productQuery =new Parse.Query("Product");
	promises.push(productQuery.find({useMasterKey:true}));

	Parse.Promise.when(promises).then( function(results) {
//       console.log("user:"+user.toJSON());
	       var user = results[0][0];
	       var userProfile = results[1][0];
		   var products = results[2];
		   console.log("found products:" + products);

	       if(userProfile){
			 	console.log("found existing userProfile:" + userProfile);
		 		return Parse.Promise.as(createUserProfileHolder(userProfile, products));
			}else{
				return createUserProfile(user, request.params, products);
			}
	    }, function(error){
	    	console.log("error:"+error);
	      	response.error("failed to query UserProfile:"+error);
		}).then( function (userProfileHolder){
			return applyDailyReward(userProfileHolder);
	    }).then( function (userProfileHolder){
				var responseString = JSON.stringify(userProfileHolder);
				response.success(responseString);
			}, function(error){
	    	console.log("error:"+error);
	      	response.error("failed to return UserProfile:"+error);
	    });

	console.log("search with username:"+username);
});

//return a promise contains updated userProfileHolder
function applyDailyReward (userProfileHolder) {
	var userProfile = userProfileHolder.userProfile;
	var lastDailyRewardDate = userProfile.get("last_daily_reward_date") ||  userProfile.get("createdAt");
	if(lastDailyRewardDate.toDateString() === new Date().toDateString()) {
		return Parse.Promise.as(userProfileHolder);
	}else{
		userProfile.set("last_daily_reward_date", new Date());
		return applyProductToUser(userProfileHolder, findProductByName(userProfileHolder.products, "daily_reward"));
	}
}

function createUserProfile(user, params, products){
	var UserProfileClass = Parse.Object.extend("UserProfile");
	userProfile = new UserProfileClass();
	userProfile.set("username", user.get("username"));
	userProfile.set("email", params.email || user.get("email") );
	console.log("creating new userProfile:" + userProfile);
	//apply inital register rewards
	var initialReward = findProductByName(products, "register_reward");
	return applyProductToUser(createUserProfileHolder(userProfile, products), initialReward);
}

function createUserProfileHolder(userProfile, products){
	return {
		userProfile: userProfile, //parse object
		products: products,
		purchaseHistories: [] //array of purchaseHistory parse object
	};
}

function findProductByName(products, name){
	for (var i = 0; i < products.length; i++) {
		if(products[i].get("name") == name  ){
			return products[i];
		}
	}
	console.log("error: could not find product:" + name);
}

//return a promise contains userProfileHolder
function applyProductToUser(userProfileHolder, product, amount){
	amount = amount || 1;

	var userProfile = userProfileHolder.userProfile;
	console.log("apply product to user:"+product.get("name")+" - "+ userProfile.get("username"));

	var coinsChange = - product.get("price")* amount;
	userProfile.increment("coins", coinsChange);

	var promises = [];
	promises.push(userProfile.save(null, { useMasterKey: true }));
	promises.push(recordUserPurchaseHistory(userProfile, product, amount, coinsChange));

	return Parse.Promise.when(promises).then( function(results) {
		userProfileHolder.userProfile = results[0];
		var purchaseHistory = results[1];
		purchaseHistory.set("description", product.get("description"));
		purchaseHistory.set("description_cn", product.get("description_cn"));
		userProfileHolder.purchaseHistories.push(purchaseHistory); // add new purchaseHistory
		console.log("updated userProfileHolder:" + JSON.stringify(userProfileHolder));
		return Parse.Promise.as(userProfileHolder);
	});
}

// return a promise contains userPurchaseHistory
function recordUserPurchaseHistory(userProfile, product, amount, coinsChange){
	var UserPurchaseHistoryClass = Parse.Object.extend("UserPurchaseHistory");
	userPurchaseHistory = new UserPurchaseHistoryClass();
	userPurchaseHistory.set("username", userProfile.get("username"));
	userPurchaseHistory.set("product_name", product.get("name"));
	userPurchaseHistory.set("amount", amount);
	userPurchaseHistory.set("coins_change", coinsChange);
	console.log("creating new userPurchaseHistory:" + userPurchaseHistory);

	return userPurchaseHistory.save(null, { useMasterKey: true });
}

//deprecated, but need to keep it for backward compatible
Parse.Cloud.define("updateUserStats", function(request, response) {

	var userId =request.params.userId;
	var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);
    userQuery.limit(1);
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
                            user.set("totalScore", totalAppUseTimeScore );
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
