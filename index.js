// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

//Using S3Adapter for File Storage and nodeMailerAdapter to send Mail
var S3Adapter = require('parse-server').S3Adapter;
var nodeMailerAdapter = require('./nodeMailerAdapter');

//Using Config File for localhost variables
var process = require('./config');

// Declares Database URI
var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;
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
  apiConfig.fileKey = process.env.FILE_KEY;
  apiConfig.filesAdapter = new S3Adapter(
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY,
    process.env.BUCKET_NAME,
    {directAccess: true, bucketPrefix: process.env.BUCKET_PREFIX}
  );
}

if (process.env.VERIFY_EMAILS){
  // Defaults Email Verification to False,
  // in case Heroku variable is set to true,
  // it transforms it to boolean, because Heroku only accepts strings.
  apiConfig.verifyUserEmails = false;
  if (process.env.VERIFY_EMAILS == "true"){
    apiConfig.verifyUserEmails = true;
  }
}
if (process.env.MAIL_EMAIL) {
  // Uses a nodemailer custom adapter, instead of the parse-server default
  // Needs email and password from the sender
  apiConfig.emailAdapter = nodeMailerAdapter({
    email: process.env.MAIL_EMAIL || 'email@provider.com',
    password:process.env.MAIL_PASSWORD || 'myPassword',
    fromAddress:process.env.MAIL_FROMADDRESS || 'My company <test@domain>'
  });
}
if (process.env.INVALID_LINK_URL) {
  apiConfig.customPages = {
    invalidLink: process.env.INVALID_LINK_URL,
    verifyEmailSuccess: process.env.VERIFY_EMAIL_URL,
    choosePassword: process.env.CHOOSE_PASSWORD_URL,
    passwordResetSuccess: process.env.PASSWORD_RESET_SUCCESS_URL
  };
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
