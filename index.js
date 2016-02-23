var process = {
  env: {
    APP_ID : "krHhv4yJmfmWZUE8mGPraozrcgA4x5WtTO8HyBQR",
    MASTER_KEY : "5dGvOwkNbCQhS3S8o3guzjdtHuAyEhDqfJQvblMa",
    RESTAPI_KEY : "CqtnmJlIuhIaRxq7pPVH0VsPb1HffReRIcCAjJNr",
    JS_KEY : "cHCNFnga1qweiBellnGvar9Qk72Zw5IvI8GNtBqC",
    FILE_KEY : "cd43dc53-2a14-43f2-842e-46115455dd1c",
    MAIL_APIKEY : "key-d02990f041626caa1d336bfaa3f7e405",
    MAIL_DOMAIN : "sandboxfa9696fdd61a4879bf977bd8c3ede7bb.mailgun.org",
    MAIL_FROMADDRESS : "Soin Labs <jquesada@soin.co.cr>",
    DATABASE_URI : "mongodb://localhost:27017/GoodgreensQA",
    VERIFY_EMAILS : true,
    SERVER_URL : "http://localhost:1337/parse"
  }
};

// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  mailConfig: {
    service: 'mailgun',
    apiKey: process.env.MAIL_APIKEY || 'apiKey',
    domain:process.env.MAIL_DOMAIN || 'myEmailDomain',
    fromAddress:process.env.MAIL_FROMADDRESS || 'My company <test@domain>'
  },
  verifyEmails: process.env.VERIFY_EMAILS || false,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  javascriptKey: process.env.JS_KEY || 'myRestKey',
  restAPIKEY: process.env.RESTAPI_KEY || 'myRestKey',
  fileKey: process.env.FILE_KEY || 'myFileKey',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse'
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
