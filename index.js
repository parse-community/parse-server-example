'use strict';

// Note: using staging server url, remove .testing() for production
var lex = require('letsencrypt-express').testing();
var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var email = 'user@example.com'; // the email for the responsable for the ssl cert
var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI
var doSSL = true;
if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey'
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();
if (doSSL == true)
{
	lex.create({
	  configDir: './letsencrypt.config'                 // ~/letsencrypt, /etc/letsencrypt, whatever you want

	, onRequest: app                                    // your express app (or plain node http app)

	, letsencrypt: null                                 // you can provide you own instance of letsencrypt
	                                                    // if you need to configure it (with an agreeToTerms
	                                                    // callback, for example)

	, approveRegistration: function (hostname, cb) {    // PRODUCTION MODE needs this function, but only if you want
	                                                    // automatic registration (usually not necessary)
	                                                    // renewals for registered domains will still be automatic
	    cb(null, {
	      domains: [hostname]
	    , email: email
	    , agreeTos: true              // you 
	    });
	  }
	}).listen([80], [443, 5001], function () {
	  console.log("ENCRYPT __ALL__ THE DOMAINS!");
	});
}

// Example express application adding the parse-server module to expose Parse
	// compatible API routes.
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
