require("cloud/app.js");

var twilioAccountSid = 'AC41f33775dcd6bf3cefdc566ad94b3224';
var twilioAuthToken = '24fed833ada4e89a8dbfc2bc869a3504';
var twilioPhoneNumber = '+18456584278';
var secretPasswordToken = 'MagistaTai';

var language = "en";
var languages = ["en", "es", "ja", "kr", "pt-BR"];

var twilio = require('twilio')(twilioAccountSid, twilioAuthToken);

Parse.Cloud.define("sendCode", function(req, res) {
	var phoneNumber = req.params.phoneNumber;
	phoneNumber = phoneNumber.replace(/\D/g, '');

	var zipcode = req.params.zipcode;
	zipcode = zipcode.replace(/\D/g, '');

	if (!phoneNumber || (phoneNumber.length != 10 && phoneNumber.length != 11)) return res.error('Invalid Parameters');
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query(Parse.User);
	query.equalTo('phonenumber', phoneNumber + "");
	query.first().then(function(result) {
		var min = 1000; var max = 9999;
		var num = Math.floor(Math.random() * (max - min + 1)) + min;

		if (result) {
			result.setPassword(secretPasswordToken + num);
			result.set("zipcode", zipcode);
			result.save().then(function() {
				return sendCodeSms(zipcode,phoneNumber, num, language);
			}).then(function() {
				res.success({});
				
			}, function(err) {
				res.error(err);
			});
		} else {
			var user = new Parse.User();
			user.setUsername(phoneNumber);
			
			user.setPassword(secretPasswordToken + num);
			user.set("zipcode", zipcode);
			user.set("phonenumber",phoneNumber);
			//user.set("impressions",0);
			var custom_useracl = new Parse.ACL();
				custom_useracl.setPublicReadAccess(true);
				

			user.setACL(custom_useracl);
			user.save().then(function(a) {
				return sendCodeSms(zipcode, phoneNumber, num, language);
			}).then(function() {
				res.success({});
			
			}, function(err) {
				res.error(err);
			});
		}
	}, function (err) {
		res.error(err);
	});
});

Parse.Cloud.define("logIn", function(req, res) {
	Parse.Cloud.useMasterKey();

	var phoneNumber = req.params.phoneNumber;
	phoneNumber = phoneNumber.replace(/\D/g, '');

	if (phoneNumber && req.params.codeEntry) {
		Parse.User.logIn(phoneNumber, secretPasswordToken + req.params.codeEntry).then(function (user) {
			res.success(user.getSessionToken());
		}, function (err) {
			res.error(err);
		});
	} else {
		res.error('Invalid parameters.');
	}
});

function sendCodeSms(zipcode, phoneNumber, code, language) {
	var prefix ="+";
	var promise = new Parse.Promise();
	twilio.sendSms({
		to:  prefix +zipcode.replace(/\D/g, '') + phoneNumber.replace(/\D/g, ''),
		from: twilioPhoneNumber.replace(/\D/g, ''),
		body: 'Your login code for Wyntr-Beta is :' + ' '+ code
	}, function(err, responseData) {
		if (err) {
			console.log(err);
			promise.reject(err.message);
		} else {
			promise.resolve();
		}
	});
	return promise;
}




