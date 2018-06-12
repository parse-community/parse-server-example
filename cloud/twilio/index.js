// Include Cloud Code module dependencies
var express = require('express');
var twilio  = require('twilio');

// Create an Express web app (more info: http://expressjs.com/)
var app = express();

// Serve static assets from the /public folder
app.use('/cloud/twilio', express.static(path.join(__dirname, '/cloud/twilio')));

// Create a route that will respond to am HTTP GET request with some
// simple TwiML instructions
app.get('/hello', function(request, response)
{
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();

    // add some instructions
    twiml.say('Hello, you have called the messaging number for App Support, we do not accept voice calls. If you need assistance, please use Help and Support from the menu of the app you are using. If you are not able to open the app, you can send an email to App Support at Barbershop Deluxe dot com. Thank you. This call is now disconnecting.',
    {
        voice:'man'
    });

    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
});

// Start the Express app
app.listen();
