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
				var promises = [];
				for (i=0; i < results.length; i++) {
					var book = results[i];
					book.set("featuredAccepted", accept);
					if(accept){
						book.set("featuredActive", true);
						//add aninews
						var aninews = createAninews("book_featured", book);
						promises.push(aninews.save(null, { useMasterKey: true }));
					}
					promises.push(book.save(null, { useMasterKey: true }));
				}
				Parse.Promise.when(promises).then( function() {
					response.success("accept FeaturedBooks: "+ results.length);
				}, function(error){
                 		console.log("error:"+error);
                 		response.error(error);
                 	});
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
			var promises = [];
			for (i=0; i < results.length; i++) {
					var book = results[i];
					if(i>0){
						accept = false;
						var aninews = createAninews("book_featured", book);
                        promises.push(aninews.save(null, { useMasterKey: true }));
					}
					book.set("featuredAccepted", accept);
					if(accept){
						book.set("featuredActive", true);
					}
					promises.push(book.save(null, { useMasterKey: true }));
    			}
			Parse.Promise.when(promises).then( function() {
				response.success("accept FeaturedBooks: "+ results.length);
			}, function(error){
					console.log("error:"+error);
					response.error(error);
				});
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
});



//Aninews Field:
//		type
//    	message
//		ownerUsername
//		relatedUsername
//		relatedBookGuid
//		relatedBookName
//
//Aninews Type:
//    publish_book,
//    book_featured,
//    like_book,
//    made_friend,
//    status_update,
//
function createAninews(type, book, ownerUsername, relatedUsername){
	var AninewsClass = Parse.Object.extend("Aninews");
	var aninews = new AninewsClass();

	if( book && book.guid){
		aninews.set("relatedBookGuid", book.guid);
		aninews.set("relatedBookName", book.title);
		aninews.set("ownerUsername", book.AuthorName);
	}
	if(ownerUsername){
			aninews.set("ownerUsername", ownerUsername);
		}

	if(relatedUsername){
    		aninews.set("relatedUsername", relatedUsername);
    }
	if(type){
        aninews.set("type", type);
     }
	var message;
	switch (type) {
			case "book_featured":
				message = book.AuthorName + "'s story '" + book.title + "' has been featured!"
				break;
			}
	if(message){
			aninews.set("message", message);
		 }
	console.log("creating new aninews:" + aninews);
	return aninews;
}