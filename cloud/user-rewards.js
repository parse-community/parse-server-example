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

	Parse.Promise.when(promises).then( function(userProfiles) {
//       console.log("user:"+user.toJSON());
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
    	console.log("error:"+error);
      	response.error("failed to query UserProfile:"+error);
    });


	console.log("search with username:"+username);
});

function testQuery(username){
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("username",username);
    return userQuery.find();
}

Parse.Cloud.define("ValidateUserData", function(request, response){
	var username =	request.params.username;

    Parse.Promise.when([testQuery(username), testQuery("asd")]).then(function(results){
        console.log("results.length="+results.length); // Returns 4 NOT 8
       	response.success("results.length="+results.length);
    });
});
