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
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
			for (i=0; i < results.length; i++) {
					if(i>0){
						accept = false;
					}
					var book = results[i];
					book.set("featuredAccepted", accept);
					if(accept){
						book.set("featuredActive", true);
					}
					book.save(null, { useMasterKey: true });
    			}
				response.success("accept FeaturedBook: "+ accept+ " - " + book.get("title"));
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
});