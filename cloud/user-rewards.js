// User profile update
Parse.Cloud.define("UpdateUserStats", function(request, response) {
	var username =request.params.username;

	var promises = [];

	var userQuery =new Parse.Query("_User");
	userQuery.equalTo("username",username);
    userQuery.limit(1);
	promises.push(userQuery.find());

//	var userProfileQuery =new Parse.Query("UserProfile");
//	userProfileQuery.equalTo("username", username);
//    userProfileQuery.limit(1);
//	promises.push(userProfileQuery.find({useMasterKey:true}));

	Parse.Promise.when(promises).then(function(users,userProfiles){
       console.log("user:"+user.toJSON());
       console.log("userProfile:"+userProfile.toJSON());
       var userProfile = results[0];
       if(userProfile){
			console.log("userProfile:"+userProfile.toJSON());
			userProfile.set("test","test123")
			response.success(userProfile.toJSON());
		}else{
			response.error("userProfile doesn't exist:"+username);
		}
    }, function(error){
      	response.error("failed to query UserProfile:"+error);
    })


	console.log("search with username:"+username);
});


