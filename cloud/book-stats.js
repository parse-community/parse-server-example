
Parse.Cloud.define("incrementFeaturedBookStats", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookId =request.params.bookRemoteId;
	var bookLikeAddCount = request.params.likedTimes || 1;
	var bookReadAddCount = request.params.readTimes || 1;
	console.log("search with ids:"+bookId);
	bookQuery.equalTo("objectId",bookId);
	bookQuery.limit(1);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    			book.increment("playedTimes", bookReadAddCount);
    			book.increment("likedTimes", bookLikeAddCount);
    			book.save(null, { useMasterKey: true });
    			response.success("incrementBookStats with Book only");
    		},
    		error: function() {
    			response.error("bookId doesn't exist!"+request.params.bookRemoteId);
    		}
	});
});

Parse.Cloud.define("incrementBookReport", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookId =request.params.bookRemoteId;
	console.log("search with ids:"+bookId);
	bookQuery.equalTo("objectId",bookId);
	bookQuery.limit(1);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    			book.increment("reportedTimes");
    			book.save(null, { useMasterKey: true });
    			response.success("incrementBookReport with Book only");
    		},
    		error: function() {
    			response.error("bookId doesn't exist!"+request.params.bookRemoteId);
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