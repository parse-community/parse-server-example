// Example express application adding the parse-server module to expose Parse
// compatible API routes.

// Express Always Required
var express 			= require('express');

// Parse Service
var ParseServer 		= require('parse-server').ParseServer;
var path 				= require('path');

// Twilio Service
// Twilio Init
var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
var twilioAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;
var twilioPort			= process.env.TWILIO_PORT || 1338;
var twilioURL			= process.env.TWILIO_URL || '127.0.0.1';
var twilioMount			= process.env.TWILIO_MOUNT || '/';


var twilio 				= require('twilio');
var twilioClient		= new twilio.RestClient(twilioAccountSid, twilioAccountToken);


//
// Parse Init
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri)
{
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer(
{
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  //liveQuery: {
  //  classNames: ["GlobalSettings"] // List of classes to support for query subscriptions
  //}
});


// App Init
var app = express();

// var twilio = require('twilio');
// twilio.initialize(twilioAccountSid,twilioAccountToken);


// Static Assets
//
// Twilio mount /twilio
// Serve static assets from the /cloud/twilio folder
//app.use('/twilio', express.static(path.join(__dirname, '/cloud/twilio')));


// Public mount /public
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Parse mount /barbershop
// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// GETS
//
// no path - Parse default
//
// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I am not really dreaming of being a website, instead I am dreaming of being an app back end!');
});

// Test returns test.html
// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});


// Twilio Incoming SMS Test
// twilioClient.messages.create({
// 	body: 'Hello from Twilio Server SP, I am waiting to communicate.',
// 	to:   '+16172165525',
// 	from: '+18572147755',
// },
// function(mcError, mcMessage)
// {
// 	if (mcError)
// 	{
// 		console.log('error: ' + mcError);
// 	}
// 	else
// 	{
// 		console.log('message successful: ' + mcMessage.sid);
// 	}
// });









	// Create a route that will respond to am HTTP GET request with some
// simple TwiML instructions
// app.get('/hello', function(request, response)
// {
//
// 	var callerResponse = new twilio.TwimlResponse();
//
// 	callerResponse.say('You have dialled 8 5 7, 2 1 4, double 7 double 5.',
// 	{
// 		voice: 'male',
// 		language: 'en-gb'
// 	})
//     .pause({ length:2 })
//     .say('This message confirms Server S P status is live.',
//     {
//         voice:'woman',
//         language:'en-au'
//     })
//     .pause( { length:1 })
//     .say('This message confirms Server B A 2 status is live.',
//     {
//         voice:'woman',
//         language:'en-au'
//     })
//     .pause({ length: 2})
//     .say('This call is now ending.',
//     {
//     	voice: 'male',
//     	language: 'en-gb'
//     });
//
// 	console.log(response.toString());
/**
Outputs the following:
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Welcome to Twilio!</Say>
    <Pause length="3"></Pause>
    <Say voice="woman" language="en-gb">Please let us know if we can help during your development.</Say>
    <Play>http://www.example.com/some_sound.mp3</Play>
</Response>
*/
/*
    // Create a TwiML response generator object
    var twiml = new twilioClient.TwimlResponse();

    // add some instructions
    var sayWhat = 'Hello, you have called the messaging number for App Support, we do not accept voice calls. If you need assistance, please use Help and Support from the menu of the app you are using. If you are not able to open the app, you can send an email to App Support at Barbershop Deluxe dot com. Thank you. This call is now disconnecting.';

    twiml.say(sayWhat,
    {
        voice:'man'
    });

    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
    */
//});




// TWILIO SERVER
///var twilioHttp			= require('http'),

//twilioHttp.createServer(function (request, response)
//{
//    //Create TwiML response
//    var twimlResponse = new twilio.TwimlResponse();
//    twiml.say("You have reached 8 5 7, 2 1 4, double 7 double 5. Incoming calls are not supported, please email app //support.");
//
//    response.writeHead(200, {'Content-Type': 'text/xml'});
//    response.end(twiml.toString());
//}).listen(twilioPort, twilioURL);

//console.log('TwiML server running at ' + twilioURL + ':' + twilioPort + twilioMount);

// PARSE SERVER
var port 		= process.env.PORT || 1337;
var httpServer 	= require('http').createServer(app);

httpServer.listen(port, function()
{
    console.log('parse-server running on port ' + port + '.');
});

httpServer.listen(1338, function(request, response)
{
	//Create TwiML response
    var twimlResponse = new twilio.TwimlResponse();
    twiml.say("You have reached 8 5 7, 2 1 4, double 7 double 5. Incoming calls are not supported, please email app support.");

    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiml.toString());
});

// This will enable the Live Query real-time server
//ParseServer.createLiveQueryServer(httpServer);

app.listen();