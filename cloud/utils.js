
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
						var ownerCountry = owner.get("country_code");
						var ownerUserId = owner.get("username");
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
