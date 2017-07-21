// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var SimpleMailgunAdapter = require('parse-server-simple-mailgun-adapter');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '12341234',
  masterKey: process.env.MASTER_KEY || '43214321', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  appName: 'MoodMeter',
  publicServerURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  emailAdapter: SimpleMailgunAdapter({
    apiKey: 'key-475d9a79e4ba7db4a447084c03a1a96e',
    domain: 'sandbox79046e0018c94c6289943caee39d6a74.mailgun.org',
    fromAddress: 'support@moodmeterapp.com',
  }),
   // Optional only if you want to provide you own pages hosted on your web server
  customPages: {
    invalidLink: 'http://yourdomain.com/invalid_link.html',
    verifyEmailSuccess: 'http://yourdomain.com/verify_email_success.html',
    choosePassword: 'http://localhost:1337/choose_password',
    passwordResetSuccess: 'http://localhost:1337/password_reset_success'
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

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

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

// app.get('/choose_password', function(req, res) {
//   res.sendFile(path.join(__dirname, '/node_modules/parse-server/views/choose_password'));
// });

app.get('/choose_password', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/choose_password.html'));
});

app.get('/password_reset_success', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/password_reset_success.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
