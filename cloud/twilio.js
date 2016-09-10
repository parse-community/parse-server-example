// Include Cloud Code module dependencies
var express = require('express'),
    twilio = require('twilio');

// Create an Express web app (more info: http://expressjs.com/)
var app = express();

// Create a route that will respond to am HTTP GET request with some
// simple TwiML instructions
app.get('/hello', function(request, response) {
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();

    // add some instructions
    twiml.say('Hello there! Isn\'t Parse cool?', {
        voice:'woman'
    });

    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
});

// Start the Express app
app.listen();
