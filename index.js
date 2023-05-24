// Example express application adding the parse-server module to expose Parse
// compatible API routes.

//Loading required packages and module
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const path = require("path");
const http = require("http");

// Defining databaseURL and environment type
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI ;
var ENVIRONMENT = 'development';
//ENVIRONMENT = 'production';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}


// Configuring Object for ParseServer Instance 
const config = {
  // DatabaseURI we can give the mongodb locally url and remote url too
  databaseURI: process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.2',
  // Giving the path of the function for cloud
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  // Defining our appId and also pass into request body as key "_ApplicationId":
  appId: process.env.APP_ID || 'myAppId',
  //Master key and nothing to do till now
  masterKey: process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  // The serverURL of ParseServer
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

//Creating an instance of express 
const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/parse';
  const server = new ParseServer(config);
  server.start();
  //Defining /parse endpoint here and configuration
  app.use(mountPath, server.app);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

if (!process.env.TESTING) {
  const port = process.env.PORT || 1337;
  const httpServer = http.createServer(app);
  httpServer.listen(port,function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}
