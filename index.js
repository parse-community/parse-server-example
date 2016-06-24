var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

//Using Config File for localhost environment variables
//process.env = require('./config');

// Declares Database URI
var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI || process.env.MONGODB_URI;
if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var apiConfig = {
  databaseURI: databaseUri,
  serverURL: process.env.SERVER_URL,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  appName: process.env.APP_NAME,
  masterKey: process.env.MASTER_KEY,
  javascriptKey: process.env.JS_KEY,
  restAPIKEY: process.env.RESTAPI_KEY,
  publicServerURL: process.env.SERVER_URL,
  liveQuery: {
    classNames: [] // List of classes to support for query subscriptions
  }
};

if (process.env.FILE_KEY){
  //Using S3Adapter for File Storage
  var S3Adapter = require('parse-server').S3Adapter;
  apiConfig.fileKey = process.env.FILE_KEY;
  apiConfig.filesAdapter = new S3Adapter(
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY,
    process.env.BUCKET_NAME,
    {directAccess: true, bucketPrefix: process.env.BUCKET_PREFIX}
  );
}
if (process.env.VERIFY_EMAILS){
  //Sets Email Verification for user account authentication
  apiConfig.verifyUserEmails = ((process.env.VERIFY_EMAILS == "true") ? true : false);
}
if (process.env.MAIL_EMAIL) {
  //Uses a nodemailer custom adapter for mail sending
  var nodeMailerAdapter = require('./nodeMailerAdapter');
  apiConfig.emailAdapter = nodeMailerAdapter({
    email: process.env.MAIL_EMAIL || 'email@provider.com',
    password:process.env.MAIL_PASSWORD || 'myPassword',
    fromAddress:process.env.MAIL_FROMADDRESS || 'My company <test@domain>'
  });
}
if (process.env.INVALID_LINK_URL) {
  //Uses custom parse links for email verification pages
  apiConfig.customPages = {
    invalidLink: process.env.INVALID_LINK_URL,
    verifyEmailSuccess: process.env.VERIFY_EMAIL_URL,
    choosePassword: process.env.CHOOSE_PASSWORD_URL,
    passwordResetSuccess: process.env.PASSWORD_RESET_SUCCESS_URL
  };
}
if (process.env.PROD_PUSH_CERT_PATH){
  //Using Parse Push Default Adapter
  apiConfig.push = {
    ios: [
      {
        pfx: process.env.DEV_PUSH_CERT_PATH, // Dev PFX or P12
        bundleId: process.env.DEV_PUSH_CERT_BUNDLE,
        production: false // Dev
      },
      {
        pfx: process.env.PROD_PUSH_CERT_PATH, // Prod PFX or P12
        bundleId: process.env.PROD_PUSH_CERT_BUNDLE,  
        production: true // Prod
      }
    ]
  }
}
if (process.env.SNS_ACCESS_KEY){
  //Using Amazon SNS Push Service Adapter
  var pushConfig =  { 
    pushTypes : { 
      android: {
        ARN: process.env.SNS_PUSH_ANDROID_ARN
      },
      ios: {
        ARN: process.env.SNS_PUSH_IOS_ARN, 
        production: ((process.env.SNS_PROD_ENV == "true") ? true : false), 
        bundleId: process.env.SNS_PUSH_CERT_BUNDLE
      }
    },
    accessKey: process.env.SNS_ACCESS_KEY,
    secretKey: process.env.SNS_SECRET_ACCESS_KEY,
    region: process.env.SNS_PUSH_REGION
  };
  var SNSPushAdapter = require('parse-server-sns-adapter');
  var snsPushAdapter = new SNSPushAdapter(pushConfig);
  pushConfig['adapter'] = snsPushAdapter;
  apiConfig.push = pushConfig;
}

//Custom Parse Server Options
var api = new ParseServer(apiConfig);

// Starts Parse Server App using express
var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

//Starts Parse Server on Port 1337 or one set by Heroku Variables
var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
