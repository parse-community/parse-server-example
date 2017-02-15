// User purchase with coins (include read_book_reward)
Parse.Cloud.define("UserPurchase", function(request, response) {
	var username =request.params.username;
	var productName = request.params.productName;
	var amount = request.params.amount || 1;
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

		if(!user){
			response.error("User doesn't exist! "+ username);
		}
		if(userProfile){
			console.log("found existing userProfile:" + userProfile);
			return Parse.Promise.as(createUserProfileHolder(user, userProfile, products));
		}else{
			return createUserProfileInHolder(user, request.params, products);
		}
	}).then( function (userProfileHolder){
		var product = findProductByName(userProfileHolder.products, productName);
		if(product.get("type") == "rewards" && (product.get("name") != "read_book_reward" || amount != 1)){
			return Parse.Promise.error("error_could_not_buy_rewards:"+productName);
		}
        return applyProductToUser(userProfileHolder, product, amount, request.params);
	}).then( function (userProfileHolder){
		var responseString = JSON.stringify(userProfileHolder);
		response.success(responseString);
	}, function(error){
		console.log("error:"+error);
		response.error(error);
	});
});

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

	var bookQuery =new Parse.Query("PublishedBook");
	bookQuery.equalTo("AuthorName",username);
	promises.push(bookQuery.find({useMasterKey:true}));

	var books;
	Parse.Promise.when(promises).then( function(results) {
//       console.log("user:"+user.toJSON());
	       var user = results[0][0];
	       var userProfile = results[1][0];
		   var products = results[2];
			books = results[3];
		   if(!user){
			   response.error("User doesn't exist! "+ username);
		   }

	       if(userProfile){
			 	console.log("found existing userProfile:" + userProfile);
		 		return Parse.Promise.as(createUserProfileHolder(user, userProfile, products));
			}else{
				return createUserProfileInHolder(user, request.params, products);
			}
	    }, function(error){
	    	console.log("error:"+error);
	      	response.error("failed to query UserProfile:"+error);
		}).then( function (userProfileHolder){
			return refreshUserStats(userProfileHolder, books);
		}).then( function (userProfileHolder){
			var rewards_promises = [];
			rewards_promises.push(applyDailyReward(userProfileHolder));
			rewards_promises.push(applyLevelUpReward(userProfileHolder));
            rewards_promises.push(applyBookLikesByOthersReward(userProfileHolder));
            return Parse.Promise.when(rewards_promises).then(function (results) {
            			return Parse.Promise.as(userProfileHolder);
            		});
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

//return a promise contains updated userProfileHolder
function applyLevelUpReward (userProfileHolder) {
	var userProfile = userProfileHolder.userProfile;
	var currentUserLevel = userProfileHolder.user.get("user_level")
	var lastUserLevel = userProfile.get("last_user_level") ||  1;
	if(currentUserLevel > lastUserLevel) {
		userProfile.set("last_user_level", currentUserLevel);
		if(currentUserLevel<=10){
			return applyProductToUser(userProfileHolder, findProductByName(userProfileHolder.products, "level_up_reward_low"), currentUserLevel - lastUserLevel);
		}else{
			return applyProductToUser(userProfileHolder, findProductByName(userProfileHolder.products, "level_up_reward"), currentUserLevel - lastUserLevel);
		}

	}else{
		return Parse.Promise.as(userProfileHolder);
	}
}

function applyBookLikesByOthersReward (userProfileHolder) {
	var userProfile = userProfileHolder.userProfile;
	var current = userProfileHolder.user.get("totalLikesByOthers")
	var last = userProfile.get("last_totalLikesByOthers") ||  0;
	if(current > last) {
		userProfile.set("last_totalLikesByOthers", current);
		return applyProductToUser(userProfileHolder, findProductByName(userProfileHolder.products, "like_by_other_reward"), current - last);
	}else{
		return Parse.Promise.as(userProfileHolder);
	}
}

//function applyBookReadsByOthersReward (userProfileHolder) {
//	var userProfile = userProfileHolder.userProfile;
//	var current = userProfileHolder.user.get("totalReadsByOthers")
//	var last = userProfile.get("last_totalReadsByOthers") ||  0;
//	if(current > last) {
//		userProfile.set("last_totalReadsByOthers", current);
//		return applyProductToUser(userProfileHolder, findProductByName(userProfileHolder.products, "read_by_other_reward"), current - last);
//	}else{
//		return Parse.Promise.as(userProfileHolder);
//	}
//}

function createUserProfileInHolder(user, params, products){
	var UserProfileClass = Parse.Object.extend("UserProfile");
	userProfile = new UserProfileClass();
	userProfile.set("username", user.get("username"));
	userProfile.set("email", params.email || user.get("email") );
	console.log("creating new userProfile:" + userProfile);
	//apply inital register rewards
	var initialReward = findProductByName(products, "register_reward");
	return applyProductToUser(createUserProfileHolder(user, userProfile, products), initialReward);
}

function createUserProfileHolder(user, userProfile, products){
	return {
		user: user,
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
	throw new Error("no_such_product:"+name);
}


function applyProductChange(userProfile, product,  amount, params) {
	console.log("applying product to user:"+product.get("name")+" - "+ userProfile.get("username"));

	var coinsChange = - product.get("price")* amount;
	if((userProfile.get("coins")+ coinsChange) <0){
		throw new Error("error_not_enough_coin");
	}
	userProfile.increment("coins", coinsChange);

	switch (product.get("name")) {
		case "max_book_pages":
			var current = userProfile.get("max_page_number") || 50; //default max page number
			userProfile.set("max_page_number", current + amount);
			break;
		case "max_avatars":
			var current = userProfile.get("max_avatar_number") || 3; //default max avatar number
			userProfile.set("max_avatar_number", current + amount);
			break;
		case "max_record_secs":
			var current = userProfile.get("max_recording_length") || 10; //default max recording length
			userProfile.set("max_recording_length", current + amount);
			break;
		case "max_custom_assets":
			var current = userProfile.get("max_custom_asset_number") || 20; //default max custom asset number
			userProfile.set("max_custom_asset_number", current + amount);
			break;
		case "max_custom_scenes":
			var current = userProfile.get("max_custom_scenes_number") || 3; //default max custom scene number
			userProfile.set("max_custom_scenes_number", current + amount);
			break;
		case "unlock_item":
			var current = userProfile.get("unlock_items") || ""; //default max custom scene number
			userProfile.set("unlock_items", current + unlockedItem+";");
			break;
	}
	return coinsChange;
}

//return a promise contains userProfileHolder
function applyProductToUser(userProfileHolder, product, amount, params){
	amount = amount || 1;

	var userProfile = userProfileHolder.userProfile;
	try{
		var coinsChange = applyProductChange(userProfile, product,  amount, params);

		var promises = [];
		promises.push(userProfile.save(null, {useMasterKey: true}));
		promises.push(recordUserPurchaseHistory(userProfile, product, amount, coinsChange, params));

		return Parse.Promise.when(promises).then(function (results) {
			userProfileHolder.userProfile = results[0];
			var purchaseHistory = results[1];
			purchaseHistory.set("description", product.get("description"));
			purchaseHistory.set("description_cn", product.get("description_cn"));
			userProfileHolder.purchaseHistories.push(purchaseHistory); // add new purchaseHistory
			console.log("updated userProfileHolder:" + userProfileHolder);
			return Parse.Promise.as(userProfileHolder);
		});
	}catch (e) {
		return Parse.Promise.error(e.message);
	}
}

// return a promise contains userPurchaseHistory
function recordUserPurchaseHistory(userProfile, product, amount, coinsChange, params){
	var UserPurchaseHistoryClass = Parse.Object.extend("UserPurchaseHistory");
	userPurchaseHistory = new UserPurchaseHistoryClass();
	userPurchaseHistory.set("username", userProfile.get("username"));
	userPurchaseHistory.set("product_name", product.get("name"));
	userPurchaseHistory.set("amount", amount);
	userPurchaseHistory.set("coins_change", coinsChange);
	if(params.transactionData){
		userPurchaseHistory.set("transactionData", params.transactionData);
	}
	if(params.unlockedItem){
		userPurchaseHistory.set("unlockedItem", params.unlockedItem);
	}
	console.log("creating new userPurchaseHistory:" + userPurchaseHistory);

	return userPurchaseHistory.save(null, { useMasterKey: true });
}

//return a promise contains updated user with stats
function refreshUserStats(userProfileHolder, books){
	var user = userProfileHolder.user;
	var totalReads = 0;
	var totalLikes = 0;
	var totalFeatured = 0;
	var totalBannedBook = 0;
	var totalCheats = 0;
	var totalAppUseTimeScore = user.get("timePlayedTotal")/10 || 0;
	if(totalAppUseTimeScore > 500) {
		totalAppUseTimeScore = 500 + (totalAppUseTimeScore - 500)/10;
	}
	for (i=0; i < books.length; i++) {
		var book = books[i];
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

	updateUserLevelInfo(user);

	var userRankQuery = new Parse.Query(Parse.User);
	userRankQuery.greaterThan("totalScore", totalScore);
	return userRankQuery.count({
				useMasterKey:true
			}).then(function (rank){
				user.set("rank", rank+1)
				return user.save(null, { useMasterKey: true });
			}).then( function (user){
				return Parse.Promise.as(userProfileHolder);
			});
}

function updateUserLevelInfo(user){
	var score = user.get("totalScore");
	var userlevel;
	var percentToNextLevel;
	if(score >= 10){
		userlevel = Math.floor((Math.log(Math.floor(score/10))/Math.log(2)) + 2);
		var levelLowerScore = Math.pow(2,userlevel - 2) * 10;
		percentToNextLevel = (score - levelLowerScore)/levelLowerScore;
	}else{
		userlevel = 1;
		percentToNextLevel = 0;
	}
	user.set("user_level", userlevel);
	user.set("percent_to_next_level", percentToNextLevel);
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
						success: function(books) {
							var totalReads = 0;
							var totalLikes = 0;
							var totalFeatured = 0;
							var totalBannedBook = 0;
							var totalCheats = 0;

							for (i=0; i < books.length; i++) {
								var book = books[i];
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
