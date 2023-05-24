//
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata")

Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});

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
