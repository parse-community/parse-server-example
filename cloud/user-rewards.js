// User login update
Parse.Cloud.define("UpdateUserStats", function(request, response) {

	var username =request.params.username;
	var userQuery =new Parse.Query("_User2");
	console.log("search with username:"+username);
	userQuery.equalTo("username",username);
	userQuery.limit(1);
	userQuery.find({useMasterKey:true})
		.then(
			function(results) {
				var user = results[0];
				if(user){
					console.log("found user:"+user.get("email"));
					response.success("user found: "+ user.get("email"));
				}else{
					response.error("user doesn't exist:"+username);
				}
			},
			function(error) {
			  response.error("failed to query user by username:"+username);
			}
		   );

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