Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi from anitales');
});

// Use Parse.Cloud.define to define as many cloud functions as you want.
Parse.Cloud.define("updateReportedBook", function(request, response) {
	var publishedBookQuery =new Parse.Query("PublishedBook");
	var bookId =request.params.bookGuId;
	var isActive=request.params.isActive;
	console.log("search with ids:"+bookId);
	publishedBookQuery.equalTo("guid",bookId);
	publishedBookQuery.limit(1);
	publishedBookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    			book.set("checked",true);
    			book.set("active",isActive )
    			book.save(null, { useMasterKey: true });
				response.success("book updated to "+ book.get("active"));
    		},
    		error: function() {
    			response.error("book doesn't exist!"+request.params.bookGuId);
    		}
	});
});

Parse.Cloud.define("markFeedbackAsRead", function(request, response) {
	var feedbackQuery =new Parse.Query("UserFeedback");

	var feedbackId =request.params.feedbackRemoteId;
	console.log("search with ids:"+feedbackId);
	feedbackQuery.equalTo("objectId",feedbackId);
	feedbackQuery.limit(1);
	feedbackQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var feedback = results[0];
    			feedback.set("read_date", new Date())
    			feedback.save(null, { useMasterKey: true });
				response.success("UserFeedback updated read_date to "+ feedback.get("read_date"));
    		},
    		error: function() {
    			response.error("feedbackId doesn't exist!"+request.params.feedbackRemoteId);
    		}
	});
});

Parse.Cloud.define("incrementFeaturedBookPlay", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookId =request.params.bookRemoteId;
	console.log("search with ids:"+bookId);
	bookQuery.equalTo("objectId",bookId);
	bookQuery.limit(1);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    			book.increment("playedTimes");
    			book.save(null, { useMasterKey: true });
    			response.success("incrementBookPlay with Book only");
    		},
    		error: function() {
    			response.error("bookId doesn't exist!"+request.params.bookRemoteId);
    		}
	});
});

// Use Parse.Cloud.define to define as many cloud functions as you want.
Parse.Cloud.define("incrementFeaturedBookLike", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookId =request.params.bookRemoteId;
	bookQuery.equalTo("objectId",bookId);
	bookQuery.limit(1);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    			book.increment("likedTimes");
    			book.save(null, { useMasterKey: true });
    			response.success("incrementBookLikes with Book only");
    		},
    		error: function() {
    			response.error("bookId doesn't exist!"+request.params.bookRemoteId);
    		}
	});
});

Parse.Cloud.define("acceptFeaturedBooks", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookGuIds =request.params.bookGuIds;
	var accept = request.params.accept;
	bookQuery.containedIn("guid",bookGuIds);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
				for (i=0; i < results.length; i++) {
					var book = results[i];
					book.set("featuredAccepted", accept);
					if(accept){
						book.set("featuredActive", true);
					}
					book.save(null, { useMasterKey: true });
				}
				response.success("accept FeaturedBooks: "+ results.length);
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
});

Parse.Cloud.define("acceptFeaturedBook", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookGuId =request.params.bookGuId;
	var accept = request.params.accept;
	bookQuery.equalTo("guid",bookGuId);
	bookQuery.limit(1);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    		  	book.set("featuredAccepted", accept);
    		  	if(accept){
    		  		book.set("featuredActive", true);
    		  	}
    			book.save(null, { useMasterKey: true });
				response.success("accept FeaturedBook: "+ accept+ " - " + book.get("title"));
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
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

Parse.Cloud.define("transferFeatureBookStats", function(request, response) {
	var query = new Parse.Query("FeaturedBook");
	query.include("book");
	query.descending("createdAt");
    query.limit(1000);
	query.find({
		useMasterKey:true,
		success: function(results) {
		  	console.log("Found "+results.length+" FeaturedBook");
			  for (var i = 0; i < results.length; i++) {
                  var featuredBook = results[i];
                  var book = featuredBook.get("book");
                  if(book){
                  	  if(featuredBook.get("likedTimes")){
                  	  	book.set("likedTimes", featuredBook.get("likedTimes"));
                  	  }
					  if(featuredBook.get("playedTimes")){
					   	book.set("playedTimes", featuredBook.get("playedTimes"));
					  }

					  book.set("featuredSubmitted",true);
					  book.set("featuredAccepted",true);
					  book.set("featuredActive",featuredBook.get("isActive"));
					  console.log("updated book: "+book.get("title"));
                  }
                }

            Parse.Object.saveAll(results,{
            				 useMasterKey:true,
                              success: function(objects) {
                                response.success("done!");
                              },
                              error: function(objects, error) {
                               response.error("could not save changes"+error);
                              }
                            });

		},
		error: function(objects, error) {
			response.error("FeaturedBook failed! "+error);
		}
	});
});

Parse.Cloud.define("transferPublishedBookCountryCode", function(request, response) {
	var query = new Parse.Query("PublishedBook");
	query.include("owner");
	query.descending("createdAt");
	query.limit(1000);
	query.find({
		useMasterKey:true,
		success: function(results) {
		  	console.log("Found "+results.length+" PublishedBook");
			  for (var i = 0; i < results.length; i++) {
                  var publishedBook = results[i];
                  if(publishedBook && publishedBook.get("owner")){
						var owner = publishedBook.get("owner");
						var ownerCountry = owner.get("country_code")
						var ownerUserId = owner.get("username")
	//					console.log("Found user "+ownerUserId+","+ownerCountry);
						if(ownerCountry){
						results[i].set("countryCode", ownerCountry);
						}
						if(ownerUserId){
						results[i].set("AuthorName", ownerUserId);
						}
						console.log("updated book: "+publishedBook.get("title"));
					  }
                  }
                Parse.Object.saveAll(results,{
                  useMasterKey:true,
                  success: function(objects) {
                   	response.success("done!");
                  },
                  error: function(objects, error) {
                   response.error(error);
                  }
                });

		},
		error: function() {
			response.error("bookId doesn't exist!"+request.params.bookRemoteId);
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
			if(language === "CHINESE") {
				var alertText = "你已經收到了一個朋友的要求。";
			} else {
				var alertText = "You've recieved a friend request.";
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

							for (i=0; i < results.length; i++) {
								var book = results[i];
								totalReads += book.get("playedTimes") || 0;
								totalLikes += book.get("likedTimes") || 0;
							}
							var totalScore = totalReads * 10 + totalLikes * 50 + totalAppUseTimeScore;
							user.set("totalReadsByOthers", totalReads);
							user.set("totalLikesByOthers", totalLikes);
							user.set("totalScore", totalScore )
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