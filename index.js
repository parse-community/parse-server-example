// Example express application adding the parse-server module to expose Parse
// compatible API routes.

// Express Always Required
var express 	= require('express');

// Parse Service
var ParseServer = require('parse-server').ParseServer;
var path 		= require('path');

// Twilio Service
var twilio		= require('twilio');

//
// Parse Init
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri)
{
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer(
{
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  //liveQuery: {
  //  classNames: ["GlobalSettings"] // List of classes to support for query subscriptions
  //}
});

//
// Twilio Init
var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
var twilioAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;

var twilio = require('twilio')(twilioAccountSid, twilioAccountToken);
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


// App Init
var app = express();

// var twilio = require('twilio');
// twilio.initialize(twilioAccountSid,twilioAccountToken);


// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I am not really dreaming of being a website, instead I am dreaming of being an app back end!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server running on port ' + port + '.');
});

// This will enable the Live Query real-time server
//ParseServer.createLiveQueryServer(httpServer);
