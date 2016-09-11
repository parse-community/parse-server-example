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
    twiml.say('Hello, you have called the outgoing messaging number for 4 X Q, we do not accept voice calls. If you need assistance, please use Help and Support from the menu of the app you are using. Thank you. This call is now disconnecting.', 
    {
        voice:'woman'
    });

    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
});

// Start the Express app
app.listen();
