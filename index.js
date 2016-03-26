// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var azurePushAdapter = require('parse-server-azure-push');
var AzureStorageAdapter = require('parse-server-azure-storage').AzureStorageAdapter;
var ParseServer = require('parse-server').ParseServer;
var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337'  // Don't forget to change to https if needed
}

var pushConnectionString = process.env['CUSTOMCONNSTR_MS_NotificationHubConnectionString'];
if (!pushConnectionString) {
  console.log('Push connection string unspecified, disabling push');
} else {
  config.push = _ => azurePushAdapter({
    ConnectionString: pushConnectionString,
    HubName: process.env['MS_NotificationHubName']
  });
}

var storageName = process.env.STORAGE_NAME;
if (!storageName) {
  console.log('Storage account unspecified, disabling storage');
} else {
  config.filesAdapter = new AzureStorageAdapter(process.env.STORAGE_NAME, 'parse', {
    accessKey: process.env.STORAGE_KEY,
    directAccess: false
  });
}

var api = new ParseServer(config);
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
