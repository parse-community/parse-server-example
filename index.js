// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express     = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter   = require('parse-server').S3Adapter;
var cors        = require('cors');
var kue         = require('kue');
var ui          = require('kue-ui');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URL
var redisUri    = process.env.REDIS_URI  || 'redis://localhost:6379'

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || process.env.MONGODB_URL || 'mongodb://localhost:27017/dev',
  cloud: './cloud/main.js',
  appId: process.env.APP_ID || '1234',
  masterKey: process.env.MASTER_KEY || '1234',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337',
  push: {
    android: {
      senderId: process.env.GCM_SENDER_ID || 'not_specified', // The Sender ID of GCM
      apiKey: process.env.GCM_API_KEY || 'not_specified' // The Server API Key of GCM
    },
    ios: {
      pfx: '/certificate/' + process.env.CERTIFICATE_NAME, // The filename of private key and certificate in PFX or PKCS12 format from disk
      bundleId: process.env.BUNDLE_ID || 'com.my_app.my_awesome_app', // The bundle identifier associate with your app
      production: process.env.NOTIFICATION_PRODUCTION || false // Specifies which environment to connect to: Production (if true) or Sandbox
    }
  },
  allowClientClassCreation: true,
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS_KEY_ID || "S3_ACCESS_KEY",
    process.env.AWS_SECRET_ACCESS_KEY || "S3_SECRET_KEY",
    process.env.BUCKET_NAME || "S3_BUCKET",
    {directAccess: true, region: 'eu-west-1'}
  ),
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Handles CORS requests and allows preflight requests.
var corsOptions = {
  origin: true,
  methods: 'GET,PUT,POST,DELETE,OPTIONS',
  maxAge: 1728000,
  credentials: true,
  preflightContinue: true
};

app.use(cors(corsOptions));


kue.createQueue({
  redis: redisUri
});

ui.setup({
  apiURL: '/jobs',
  baseURL: '/kue',
  updateInterval: 5000
});


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use('/jobs', kue.app);
app.use('/kue', ui.app);

app.listen(3000);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a web site.');
});

app.get('/job_generator', function(req, res) {
  require('./job_generator')
  res.status(200).send("<a href='jobs'>You can check created jobs here</a>");
});



var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
