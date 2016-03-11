var process = {
  env: {
    APP_NAME: "GoodgreensQA",
    APP_ID : "krHhv4yJmfmWZUE8mGPraozrcgA4x5WtTO8HyBQR",
    MASTER_KEY : "5dGvOwkNbCQhS3S8o3guzjdtHuAyEhDqfJQvblMa",
    RESTAPI_KEY : "CqtnmJlIuhIaRxq7pPVH0VsPb1HffReRIcCAjJNr",
    JS_KEY : "cHCNFnga1qweiBellnGvar9Qk72Zw5IvI8GNtBqC",
    FILE_KEY : "cd43dc53-2a14-43f2-842e-46115455dd1c",
    MAIL_APIKEY : "key-d02990f041626caa1d336bfaa3f7e405",
    MAIL_DOMAIN : "sandboxfa9696fdd61a4879bf977bd8c3ede7bb.mailgun.org",
    MAIL_FROMADDRESS : "GoodgreensQA <no-reply@goodgreens.cr>",
    DATABASE_URI : "mongodb://localhost:27017/GoodgreensQA",
    VERIFY_EMAILS : true,
    SERVER_URL : "http://localhost:1337/parse",
    AWS_ACCESS_KEY_ID: "AKIAI3E24Y6BOYMUSNPA",
    AWS_SECRET_ACCESS_KEY: "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",
    BUCKET_NAME: "goodgreens",
    BUCKET_PREFIX: "images/",
    INVALID_LINK_URL: "http://localhost:4000/invalid",
    VERIFY_EMAIL_URL: "http://localhost:4000/user/emailVerified",
    CHOOSE_PASSWORD_URL: "http://localhost:4000/user/reset",
    PASSWORD_RESET_SUCCESS_URL: "http://localhost:4000/user/reset/success"
  }
};

// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var mailGunAdapter = require('./mailGunAdapter');

var emailAdapter = mailGunAdapter({
  apiKey: process.env.MAIL_APIKEY || 'apiKey',
  domain:process.env.MAIL_DOMAIN || 'myEmailDomain',
  fromAddress:process.env.MAIL_FROMADDRESS || 'My company <test@domain>'
});

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  appName: process.env.APP_NAME || 'myApp',
  masterKey: process.env.MASTER_KEY || '',
  javascriptKey: process.env.JS_KEY || 'myRestKey',
  restAPIKEY: process.env.RESTAPI_KEY || 'myRestKey',
  fileKey: process.env.FILE_KEY || 'myFileKey',
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY,
    process.env.BUCKET_NAME,
    {directAccess: true, bucketPrefix: process.env.BUCKET_PREFIX}
  ),
  verifyUserEmails: process.env.VERIFY_EMAILS || true,
  emailAdapter: emailAdapter,
  customPages: {
    invalidLink: process.env.INVALID_LINK_URL,
    verifyEmailSuccess: process.env.VERIFY_EMAIL_URL,
    choosePassword: process.env.CHOOSE_PASSWORD_URL,
    passwordResetSuccess: process.env.PASSWORD_RESET_SUCCESS_URL
  },
  publicServerURL: process.env.SERVER_URL || 'http://localhost:1337/parse'
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
