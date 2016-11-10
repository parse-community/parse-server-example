var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
var twilioAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;
var twilioSendingNumber	= process.env.TWILIO_PHONE_NUMBER;

var twilio 				= require('twilio');
twilio.initialize(twilioAccountSid, twilioAccountToken);


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