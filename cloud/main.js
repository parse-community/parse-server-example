require('./user-profile');
require('./book-stats');
require('./admin');

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
