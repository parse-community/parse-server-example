// Parse.Cloud.define('hello', req => {
//   req.log.info(req);
//   return 'Hi';
// });

// Parse.Cloud.define('asyncFunction', async req => {
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   req.log.info(req);
//   return 'Hi async';
// });

// Parse.Cloud.beforeSave('Test', () => {
//   throw new Parse.Error(9001, 'Saving test objects is not available.');
// });

const Posts = Parse.Object.extend("Posts");
const Comments = Parse.Object.extend("Comments");

// End point for User Sign Up
Parse.Cloud.define("signUp" , async ( req )=>{
  try {
    const { username , password , email } = req.params ;
    const user = new Parse.User();
    if( !( username && password && email ) ){
      throw new Error("Missing Params");
    }
    const data = {
      username,
      password,
      email:email.toLowerCase()
    }
    // user.set("username",username);
    // user.set("password",password);
    // user.set("email",email.toLowerCase());
    // let result = await user.singUp(null,{useMasterKey:true}); in case already set the key value pair
    let result = await user.signUp(data,{useMasterKey:true});
    return result ;
  } catch (error) {
    console.error(error);
    throw error ; 
  }
});


// End point for user login
Parse.Cloud.define("userLogin", async ( req )=>{
  try {
    const { username, password } = req.params ;
    if( !( username && password ) ){
      throw new Error("Missing either password or username");
    }
    let user = await Parse.User.logIn(username,password);
    return user;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

// Logout endpoint
Parse.Cloud.define("logOut", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access");
    }
    const user = await Parse.User.logOut();
    return user ;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

// Creating Post 
Parse.Cloud.define("createPost", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const { title, description, comments }= req.params;
    const post = new Posts();
    const data = {
      title,
      description,
      comments:comments || []
    };
    let result = await post.save(data);
    return result ;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

//Get post 
Parse.Cloud.define("post", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const { postId } = req.params ;
    const query = new Parse.Query(Posts);
    const result = await query.get(postId);
    return result;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

//Get all posts
Parse.Cloud.define("posts", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const query = new Parse.Query(Posts);
    const posts = await query.find();
    return posts ;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

// Create Comments for post
Parse.Cloud.define("createComment", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const { postId, commentDescription } = req.params ;
    let query = new Parse.Query(Posts);
    const post = await query.get(postId);
    const Comment = Parse.Object.extend("Comment");
    const comment = new Comment();
    const result = await comment.save({commentDescription,postId},{useMasterKey:true});
    post.add("comments",result.id);
    await post.save();
    return result; 
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

//Get comment
Parse.Cloud.define("comment", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const { commentId } = req.params;
    const query = new Parse.Query(Comments);
    const comment = await query.get(commentId);
    return comment;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

//Get All Comments
Parse.Cloud.define("comments", async( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const query = new Parse.Query(Comments);
    const comments = await query.find();
    return comments ;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});

//Update post 
Parse.Cloud.define("updatePost", async ( req )=>{
  try {
    if( !req.user ){
      throw new Error("Unauthorized Access!");
    }
    const { postId ,title, description , comments  } = req.params ;
    const query = new Parse.Query(Posts);
    console.log("__________",postId ,title, description , comments ,"________");
    const post = await query.get(postId);
    if( !post ){
      post.set("title", title || post.title);
      post.set("description" , description  || post.description );
      post.set("comments" , comments || post.comments );
    }
    return post ;
  } catch (error) {
    console.error(error);
    throw error ;
  }
});