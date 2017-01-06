// User login update
function updateUserProfile(user, response) {
	console.log("update userProfile:"+user.get("email"));
	var userProfileQuery =new Parse.Query("UserProfile");
	userProfileQuery.equalTo("username",username);
	userProfileQuery.limit(1);
	userProfileQuery.find({useMasterKey:true})
			.then(function(results) {
				console.log("results:"+results.toJSON());
				var userProfile = results[0];
				if(userProfile){
					console.log("userProfile:"+userProfile.toJSON());
					userProfile.set("test","test123")
					response.success(userProfile.toJSON());
				}else{
					response.error("userProfile doesn't exist:"+username);
				}
			},
			function(error) {
			  response.error("failed to query UserProfile:"+error);
			});
};

Parse.Cloud.define("UpdateUserStats", function(request, response) {

	var username =request.params.username;
	var userQuery =new Parse.Query("_User");
	console.log("search with username:"+username);
	userQuery.equalTo("username",username);
	userQuery.limit(1);
	userQuery.find({useMasterKey:true})
		.then(
			function(results) {
				var user = results[0];
				if(user){
					console.log("found user:"+user.get("email"));
					updateUserProfile(user, {
						success: function(returnValue) {
						  response.success(returnValue);
						},
						error: function(error) {
						  response.error(error);
						}
					  });
				}else{
					response.error("user doesn't exist:"+username);
				}
			},
			function(error) {
			  response.error("failed to query user by username:"+username);
			});

//	userQuery.find({
//			useMasterKey:true,
//			success: function(results) {
//    		  	var user = results[0];
//    		  	if(user){
//    		  		console.log("found user:"+user.get("email"));
//                	response.success("user found: "+ user.get("email"));
//    		  	}else{
//    		  		response.error("user doesn't exist:"+username);
//    		  	}
//    		},
//    		error: function() {
//    			console.log("not found user:"+username);
//    			response.error("user doesn't exist:"+username);
//    		}
//	});
});


