var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
var twilioAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;
var twilioSendingNumber	= process.env.TWILIO_PHONE_NUMBER;
//
// var twilio 				= require('twilio');
// twilio.initialize(twilioAccountSid, twilioAccountToken);


Parse.Cloud.define('sendSMS', function(request, response)
{
	Parse.Cloud.useMasterKey();
	console.log('sendSMS with:');
    console.log(request);

	var tas = twilioAccountSid.substring(1,5);
	var tat = twilioAccountToken.substring(1,5);
	console.log('account sid starts ' + tas);
	console.log('account token starts ' + tat);

    var twilio	= require('twilio')(twilioAccountSid,twilioAccountToken);
	var to 		= request.params.toNumber;
	var message	= request.params.message;

    twilio.sendMessage(
    {
        to: to,
        from: twilioSendingNumber,
        body: message

    }, function(error, responseData)
    {
        if (error)
        {
            response.error(error);
        }
        else
        {
            response.success(responseData);
        }
    });
});


///////////////////////////////////////
//
// sendVerificationCodeBySmsToPhoneNumber
//
///////////////////////////////////////
function sendVerificationCodeBySmsToPhoneNumber(verificationCode,phoneNumber)
{
	console.log('sendSMS to ' + phoneNumber + ' with [' + verificationCode + ']');

	var twilio	= require('twilio')(twilioAccountSid,twilioAccountToken);


	//var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
	//var twilioAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;
	//var twilioSendingNumber	= process.env.TWILIO_PHONE_NUMBER;

	var tas = twilioAccountSid.substring(1,5);
	var tat = twilioAccountToken.substring(1,5);

	console.log('account sid starts ' + tas);
	console.log('account token starts ' + tat);
	console.log('from phone ' + twilioSendingNumber);

	var message	= 'Your Verification Code for the Barbershop Deluxe App is ' + verificationCode + '.';

	var toNumber = '';
	if ( phoneNumber.length == 10 )
	{
		toNumber = '+1' + phoneNumber;
	}
	else if ( phoneNumber.length == 11 )
	{
		toNumber = '+' + phoneNumber;
	}
	else
	{
		toNumber = phoneNumber;
	}

    twilio.sendMessage(
    {
        to: toNumber,
        from: twilioSendingNumber,
        body: message

    }, function(error, responseData)
    {
        if (error)
        {
        	console.log('error sending twilio message:');
            console.log(error);
        }
        else
        {
            response.success(responseData);
        }
    });
}


/*

//const express = require('express');
//const twilio = require('twilio');
const urlencoded = require('body-parser').urlencoded;

//const app = express();

// Parse incoming POST params with Express middleware
app.use(urlencoded({extended: false}));

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/hello', (request, response) =>
{
  // Get information about the incoming call, like the city associated
  // with the phone number (if Twilio can discover it)
  const city = request.body.FromCity;

  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new twilio.TwimlResponse();
  twiml.say(`Never gonna give you up ${city}.`, {
    voice: 'alice',
  });
  twiml.say(`Good bye`, {
  	voice: 'man',
  });

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
app.listen(3000);



*/



// app.get('/hello', function(request, response)
// {
//     // Create a TwiML response generator object
//     var twiml = new twilio.TwimlResponse();
//
//     // add some instructions
//     twiml.say('Hello, you have called the messaging number for App Support, we do not accept voice calls. If you need assistance, please use Help and Support from the menu of the app you are using. If you are not able to open the app, you can send an email to App Support at Barbershop Deluxe dot com. Thank you. This call is now disconnecting.',
//     {
//         voice:'man'
//     });
//
//     // Render the TwiML XML document
//     response.type('text/xml');
//     response.send(twiml.toString());
// });

/*
Parse.Cloud.define("sendMessageWithCode", function(request, response)
{
// Use the Twilio Cloud Module to send an SMS
	var toNumber			= request.params.toNumber;
	var verificationCode	= request.params.verificationCode;

	var message		= 'Your verification code for the Barbershop Deluxe app is ' + verificationCode;

	twilio.sendMessage(
	{
		From: twilioSendingNumber,
		To: toNumber,
		Body: message
	},
	{
		success: function(sendResult)
		{
			response.success('Message was sent');
		},
		error: function(sendError)
		{
			response.error('Message not sent: ' + sendError);
		}
	});
});
*/