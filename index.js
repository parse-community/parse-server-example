// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
// var S3Adapter = require('parse-server').S3Adapter;
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },

  //**** Email Verification ****//
	/* Enable email verification */
	verifyUserEmails: true,
	/* The public URL of your app */
	// This will appear in the link that is used to verify email addresses and reset passwords.
	/* Set the mount path as it is in serverURL */
	publicServerURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
	/* This will appear in the subject and body of the emails that are sent */
	appName: process.env.APP_NAME || "parseCodecraftExample", 

	emailAdapter: {
		module: 'parse-server-mailgun-adapter-template',
		options: {
       // Display name
       displayName: 'Parse Server Test',
        // The address that your emails come from
			fromAddress: process.env.EMAIL_FROM || "test@example.com",
       // Your domain from mailgun.com
			domain: process.env.MAILGUN_DOMAIN || "example.com",
      // Your API key from mailgun.com
			apiKey: process.env.MAILGUN_API_KEY  || "apikey"
		}
	},


  // var fs = require('fs'); //required if loading html from file!


  
  // emailAdapter: {
  //   module: 'parse-server-mailgun-adapter-template',
  //   options: {
  //     // The address that your emails come from
  //     fromAddress: 'no-reply@yourdomain.com',
  //     // Your domain from mailgun.com
  //     domain: 'mg.yourdomain.com',
  //     // Your API key from mailgun.com
  //     apiKey: 'key-0123456789abcdefghijklmnopqrstuv',

  //     // Verification email subject
  //     verificationSubject: 'Please verify your e-mail for %appname%',
  //     // Verification email body
  //     verificationBody: 'Hi,\n\nYou are being asked to confirm the e-mail address %email% with %appname%\n\nClick here to confirm it:\n%link%',
  //     //OPTIONAL (will send HTML version of email):
  //     verificationBodyHTML: fs.readFileSync("./verificationBody.html", "utf8") ||  null,

  //     // Password reset email subject
  //     passwordResetSubject: 'Password Reset Request for %appname%',
  //     // Password reset email body
  //     passwordResetBody: 'Hi,\n\nYou requested a password reset for %appname%.\n\nClick here to reset it:\n%link%',
  //     //OPTIONAL (will send HTML version of email):
  //     passwordResetBodyHTML: "<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml>........"
  //   }
  // }





	
	//**** File Storage ****//
	// filesAdapter: new S3Adapter(
	// 	{
	// 		directAccess: true //allows to load server/asset directly from S3
	// 	}
	// )


};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


// parse-dashboard --dev --appId myAppId --masterKey myMasterKey --serverURL "https://parse-from-real-source.herokuapp.com/parse" --appName parse-test

// Source -  https://www.youtube.com/watch?v=MAiva7qYUbc&list=PL-TLnxxt_AVFEOlCFBHBG_BbpaF3UX-EU&index=13


// s3
// S3_ACCESS_KEY - AKIAY7NPONVIPH4UUC5H
// S3_BUCKET - parse-server-codecraft-example2
// S3_SECRET_KEY - G8O/EElTbOG50ct4e+tnAcfEEef/iVHEduY3pQVa
// SERVER_URL - https://parse-from-real-source.herokuapp.com/parse


const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
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

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
