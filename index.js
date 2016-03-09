// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
//Ophir Test Initialize MailAdapter
var simpleMailgunAdapter = require('parse-server/lib/Adapters/Email/SimpleMailgunAdapter')({
  apiKey: process.env.MAILGUN_KEY || 'key-c101ac1bf89065d49887ba4d2ef69771',
  domain: process.env.DOMAIN || 'medidatewith.me',
  fromAddress: process.env.MAILGUN_FROM_ADDRESS || 'no-reply@medidatewith.me'
});

//Mailgun - reset password
// var SimpleMailgunAdapter = require('parse-server/lib/Adapters/Email/SimpleMailgunAdapter');
// var simpleMailgunAdapter = new SimpleMailgunAdapter({
//   apiKey: process.env.MAILGUN_KEY || 'key-c101ac1bf89065d49887ba4d2ef69771',
//   domain: process.env.DOMAIN || 'medidatewith.me',
//   fromAddress: process.env.MAILGUN_FROM_ADDRESS || 'no-reply@medidatewith.me'
// });

//Push Adapter
var OneSignalPushAdapter = require('parse-server/lib/Adapters/Push/OneSignalPushAdapter');
var oneSignalPushAdapter = new OneSignalPushAdapter({
  oneSignalAppId:process.env.ONE_SIGNAL_APP_ID,
  oneSignalApiKey:process.env.ONE_SIGNAL_REST_API_KEY
});

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  appName: 'Medidate',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337',  // Don't forget to change to https if needed
  publicServerURL: process.env.PUBLIC_SERVER_URL,
  emailAdapter: simpleMailgunAdapter,
  push: {
     adapter: oneSignalPushAdapter
  }
  //,
  // push: pushConfig,
 //  push: {
	// android: {
	// 	senderId: process.env.GCM_SENDER_ID, // The Sender ID of GCM
	// 	apiKey: process.env.GCM_API_KEY // The Server API Key of GCM
	// 	}
	// 	,
	// ios: {
	// 	pdx: __dirname + '/ios_push/Medidate_prod_p12_new.p12', // the path and filename to the .p12 file you exported earlier. 
	// 	bundleId: process.env.IOS_PUSH_BUNDLEID, // The bundle identifier associated with your app
	// 	production: true
	// 	}
	// }
   ,
   customPages: {
     invalidLink: process.env.SERVER_URL + 'invalid_link.html',
     verifyEmailSuccess: process.env.SERVER_URL + 'verify_email_success.html',
     choosePassword: 'http://matandahan.wix.com/medidate#!reset-password/ldxuc',
     passwordResetSuccess: process.env.SERVER_URL + 'password_reset_success.html'
   }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a web site.');
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
