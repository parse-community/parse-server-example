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
