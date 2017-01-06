// User login update
Parse.Cloud.define("UpdateUserStats", function(request, response) {

	var username =request.params.username;
	var userQuery =new Parse.Query("_User");
	console.log("search with username:"+username);
	userQuery.equalTo("username",username);
	userQuery.limit(1);
//	userQuery.find().then(function(results) {
//		var user = results[0];
//        return
//       }).then(function(result) {
//         console.log("Updated " + result.id);
//       });

	userQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var user = results[0];
    		  	console.log("found user:"+user.get("email"));
				response.success("user found: "+ user.get("email"));
    		},
    		error: function() {
    			console.log("not found user:"+username);
    			response.error("user doesn't exist:"+username);
    		}
	});
});