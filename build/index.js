"use strict";
// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var parse_server_1 = require("parse-server");
var args = process.argv || [];
var test = args.some(function (arg) { return arg.includes('jasmine'); });
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}
var config = {
    databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.ts",
    appId: process.env.APP_ID || 'myAppId',
    masterKey: process.env.MASTER_KEY || '',
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
    liveQuery: {
        classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
    },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey
var app = express_1.default();
// Serve static assets from the /public folder
app.use(express_1.default.static(__dirname + "/public"));
// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
    var api = new parse_server_1.ParseServer(config);
    app.use(mountPath, api);
}
// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
    res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});
// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
    res.sendFile(__dirname + "/public/test.html");
});
var port = Number(process.env.PORT) || 1337;
if (!test) {
    var httpServer = require('http').createServer(app);
    httpServer.listen(port, function () {
        console.log('parse-server-example running on port ' + port + '.');
    });
    // This will enable the Live Query real-time server
    parse_server_1.ParseServer.createLiveQueryServer(httpServer);
}
module.exports = {
    app: app,
    config: config,
};
