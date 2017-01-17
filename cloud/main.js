require('./user-profile');
require('./book-stats');
require('./admin');
require('./utils');

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi from anitales');
});


Parse.Cloud.define("addBookVideoLink", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");
	var bookGuId =request.params.bookGuId;
	var videoLink = request.params.videoLink;
	bookQuery.equalTo("guid",bookGuId);
	bookQuery.limit(1);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    		  	book.set("videoLink", videoLink);
    		  	book.save(null, { useMasterKey: true });
				response.success("update book: "+  book.get("title")+ " -  videoLink = " + book.get("videoLink"));
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
});

Parse.Cloud.define("addedFriend", function(request, response) {
	var query = new Parse.Query(Parse.User);
	query.equalTo("objectId", request.params.guid);
	// Find devices associated with these users
	var pushQuery = new Parse.Query(Parse.Installation);
	// need to have users linked to installations
	pushQuery.matchesQuery('user', query);

	query.find({
		success: function(results) {
			var language = results[0].get("language");
            var alertText;
			if(language === "CHINESE") {
				alertText = "你已經收到了一個朋友的要求。";
			} else {
				alertText = "You've recieved a friend request.";
			}
			Parse.Push.send({
			    where: pushQuery,
			    data: {
				    alert: alertText
			    }
			}, {
			    success: function () {
				response.success("Friend request sent with text: "+alertText);
			    },
			    error: function (error) {
				response.error(error);
			    }
			});
		},
		error: function() {

			response.error("Guid doesn't exist!");
		}
	});
});

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
								totalReads += book.get("playedTimes") || 0;
								totalLikes += book.get("likedTimes") || 0;
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