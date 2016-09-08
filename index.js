'use strict';
// Example express application adding the parse-server module to expose Parse
// compatible API routes.
const express        = require('express');
const ParseServer    = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path           = require('path');

// Parse configuration
const PORT            = process.env.PORT || 1337;
const DATABASE_URI    = process.env.DATABASE_URI || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/dev';
const SERVER_URL      = process.env.SERVER_URL || 'http://localhost:1337/parse';
const APP_ID          = process.env.APP_ID || 'myAppId';
const MASTER_KEY      = process.env.MASTER_KEY || 'myMasterKey';
const MASTER_REST_KEY = process.env.MASTER_REST_KEY || 'myRestApiKey';
const APP_NAME        = process.env.APP_NAME || 'myAddName';
const JAVASCRIPT_KEY  = process.env.JAVASCRIPT_KEY || 'myJavascriptKey';
const PARSE_MOUNT     = process.env.PARSE_MOUNT || '/parse';
const CLOUD_CODE_MAIN = process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js';

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

let ServerConfig = {
    databaseURI     : DATABASE_URI,
    cloud           : CLOUD_CODE_MAIN,
    appId           : APP_ID,
    masterKey       : MASTER_KEY,
    serverURL       : SERVER_URL,
    restAPIKey      : MASTER_REST_KEY,
    verifyUserEmails: false,
    publicServerURL : SERVER_URL,
    appName         : APP_NAME,
    //liveQuery       : {
    //    classNames: ['GalleryComment']
    //},
    // Ionic Cordova Parse Push Plugin
    // https://github.com/taivo/parse-push-plugin
    // Uncomment for Push
    // push : {
    //     android: {
    //         senderId: 'yourSenderId',
    //         apiKey  : 'yourApiKey'
    //     },
    //     ios    : {
    //         pfx       : 'pfx',
    //         bundleId  : 'bundleId',
    //         production: 'production'
    //     }
    // }
};

var api = new ParseServer(ServerConfig);
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

// Parse Dashboard
const DASHBOARD_URL      = process.env.DASHBOARD_URL;
const DASHBOARD_USER     = process.env.DASHBOARD_USER;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;
if (DASHBOARD_USER) {
    const dashboard = new ParseDashboard({
        apps       : [
            {
                appName  : APP_NAME,
                serverURL: SERVER_URL,
                appId    : APP_ID,
                masterKey: MASTER_KEY,
                iconName : 'parse-logo.png'
            }
        ],
        users      : [
            {
                user: DASHBOARD_USER, // Used to log in to your Parse Dashboard
                pass: DASHBOARD_PASSWORD
            }
        ],
        iconsFolder: 'icons'
    }, true);

    // make the Parse Dashboard available at /dashboard
    app.use(DASHBOARD_URL, dashboard);
}

var httpServer = require('http').createServer(app);
httpServer.listen(PORT, function() {
    console.log('parse-server-example running on port ' + PORT + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
