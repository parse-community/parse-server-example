/*
 *	Parse Cloud Code
 *
 *	Documentation:
 *	https://www.parse.com/docs/js/guide#cloud-code
 *	This URL will probably change to a github url
 *
 *	FOLDERS:
 *
 *	config
 *	contains a JSON configuration file that you shouldn't normally need to deal with
 *
 *	cloud
 *	stores your Cloud Code
 *
 *	public
 *	stores any static content that you want to host on the Parse Server
 *
 *	When you are done editing any of these files,
 *	deploy the changes using git/Git Hub/Git Desktop
 */

/*
 *	Barbershop Apps Methods
 *	These are to connect to and use Parse Server
 *
 *
 *	To use Parse Server you need the following:
 *
 *	Application ID
 *	in APP_ID
 *
 *	Database URI
 *	in DATABASE_URI
 *
 *	File Key
 *	in FILE_KEY
 *
 *	Master Key
 *	in MASTER_KEY
 *
 *	Parse Mount Path
 *	PARSE_MOUNT
 *
 *	The Server URL that the app will use
 *	in SERVER_URL
 *
 */

//do I need to require app.js?
//require('./cloud/app.js');


//////////////////////////////////////
//
// hello
//
//////////////////////////////////////
Parse.Cloud.define('hello', function(req, res)
{
  res.success('Hello my main man!');
});


///////////////////////////////////////
//
// status
//
///////////////////////////////////////
Parse.Cloud.define('status', function(request, response)
{
	response.success('Up, Live, Valid');
});

///////////////////////////////////////
//
// barberIdForBarberName
//
///////////////////////////////////////
Parse.Cloud.define('barberIdForBarberName', function(request, response)
{
	var query = new Parse.Query('Barbers');
	query.equalTo('barberName', request.params.barberName);
	query.equalTo('isActive', true);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var barberId = results[0].id;
				response.success(barberId);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one barber found');
			}
			else
			{
				response.error('no barbers found with that name');
			}
		},
		error: function()
		{
			response.error('barber name lookup failed');
		}
	});
});


///////////////////////////////////////
//
// canReplyToUserWithId
//
///////////////////////////////////////
Parse.Cloud.define('canReplyToUserWithId', function(request, response)
{
	var User = Parse.Object.extend('_User');
	var query = new Parse.Query(User);
	query.equalTo('objectId', request.params.userId);
	query.get(
	{
		success: function(result)
		{
			var canReply = result.get('allowsMessages');
			if ( canReply == null )
			{
				canReply = false;
			}
			response.success(canReply);
		},
		error: function()
		{
			response.error('user lookup failed');
		}
	});
});


///////////////////////////////////////
//
// canReplyToUserWithId_B
//
///////////////////////////////////////
Parse.Cloud.define('canReplyToUserWithId_B', function(request, response)
{
	var query = new Parse.Query('_User');
	query.equalTo('objectId', request.params.userId);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var canReply = results[0].get('allowsMessages');
				if ( canReply == null )
				{
					canReply = false;
				}
				response.success(canReply);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one user found');
			}
			else
			{
				response.error('no user found with that objectId');
			}
		},
		error: function()
		{
			response.error('user lookup failed');
		}
	});
});


///////////////////////////////////////
//
// doesMessageToUserWithNoRepeatHashExist
//
///////////////////////////////////////
Parse.Cloud.define('doesMessageToUserWithNoRepeatHashExist', function(request, response)
{
	var userId = request.params.userId;
	var nrHash = request.params.noRepeat;

	var query = new Parse.Query('Messages');
	query.equalTo('userID', request.params.userId);
	query.equalTo('noRepeat', request.params.noRepeat);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				response.success(false);
			}
			else
			{
				response.success(true);
			}
		},
		error: function()
		{
			response.error('message lookup failed');
		}
	});
});


///////////////////////////////////////
//
// nameForUserWithObjectId
//
///////////////////////////////////////
Parse.Cloud.define('nameForUserWithObjectId', function(request, response)
{
	var query = new Parse.Query('_User');
	query.get(request.params.objectId,
	{
		success: function(object)
		{
			// object is an instance of Parse.Object.
			var firstName = object.get('firstName');
			if ( firstName == null )
			{
				firstName = '';
			}
			var lastName = object.get('lastName');
			if ( lastName == null )
			{
				lastName = '';
			}
			var fullName = firstName.trim() + ' ' + lastName.trim();

			response.success(fullName.trim());
		},
		error: function(object, error)
		{
			// error is an instance of Parse.Error.
			response.error('unable to get user with object id');
		}
	});
});


///////////////////////////////////////
//
// serviceIdForBarberNameAndServiceName
//
///////////////////////////////////////
Parse.Cloud.define('serviceIdForBarberNameAndServiceName', function(request, response)
{
	var query = new Parse.Query('Services');
	query.equalTo('barberName', request.params.barberName);
	query.equalTo('serviceName', request.params.serviceName);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var service = results[0];
				var isActive = service.get('isActive');
				var serviceId = '';
				if ( isActive == true )
				{
					serviceId = service.id;
				}
				else
				{
					var replacement = service.get('replacement');
					if ( replacement != null )
					{
						serviceId = replacement.id;
					}
					else
					{
						serviceId = null;
					}
				}
				response.success(serviceId);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one service found');
			}
			else
			{
				response.error('no services found for barber name and service name');
			}
		},
		error: function()
		{
			response.error('service name lookup failed');
		}
	});
});


///////////////////////////////////////
//
// serviceIdForServiceIdReplacement
//
///////////////////////////////////////
Parse.Cloud.define('serviceIdForServiceIdReplacement', function(request, response)
{
	var query = new Parse.Query('Services');
	query.equalTo('objectId', request.params.serviceId);
	query.equalTo('isActive', false);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				response.success(request.params.serviceId);
			}
			else
			{
				var replacement = results[0].get('replacement');
				response.success(replacement.id);
			}
		},
		error: function()
		{
			response.error('service id replacement lookup failed');
		}
	});
});

///////////////////////////////////////
//
// servicesForBarberId
//
///////////////////////////////////////
Parse.Cloud.define('servicesForBarberId', function(request, response)
{
	var query = new Parse.Query('Barbers');
	query.equalTo('objectId', request.params.barber);
	query.find( {
		success: function(results)
		{
			var relation = results[0].get('services');
			var relationQuery = relation.query;
			relationQuery.equalTo('isActive', true);
			relationQuery.find( {
				success: function(results)
				{
					response.success(results);
				},
				error: function()
				{
					response.error('services lookup failed');
				}
			});
		},
		error: function()
		{
			response.error('barber lookup failed');
		}
	});
});


///////////////////////////////////////
//
// incrementNewAppointmentTally
//
///////////////////////////////////////
Parse.Cloud.define('incrementNewAppointmentTally', function(request, response)
{
	var globalSettings = Parse.Object.extend('GlobalSettings');
	var query = new Parse.Query(globalSettings);
	query.equalTo('settingName', 'newAppointmentTally');

	query.find(
	{
		success: function(results)
		{
			var resultObject = results[0];
			var tally = parseInt(resultObject.get('settingValue'));
			tally++;

			var tallyString = String.valueOf(tally);
			//resultObject.set('settingValue', tallyString);
			resultObject.save({'settingValue':tallyString});

			response.success(tally);
		},
		error: function(error)
		{
			response.error(error);
		}
    }),
});


///////////////////////////////////////
//
// getUnreadMessageCount
//
///////////////////////////////////////
Parse.Cloud.define('getUnreadMessageCount', function(request, response)
{
	// Unread Messages
	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', request.params.installId);
	query.doesNotExist('readAt');
	query.get(
	{
		success: function(result)
		{
			response.success(result.count);
		},
		error: function()
		{
			response.error('unable to get unread messages');
		}
	});
});


///////////////////////////////////////
//
// convertMessagesFromDeviceToUser
//
///////////////////////////////////////
Parse.Cloud.define('convertMessagesFromDeviceToUser', function(request, response)
{
	// All Messages
	var installId = request.params.installId;
	var userId = request.params.userId;

	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', installId);
	query.doesNotExist('userID');
	query.find(
	{
		success: function(results)
		{
			conditionalLog(debugging,'Testing Converting')
			conditionalLog(debugging,'found: ' + results.length);
			if ( results.length == 0 )
			{
				response.success('no messages to convert');
				//console.log('none to convert');
			}
			else
			{
				for (m = 0; m < results.length; m++)
				{
					//console.log(results[m].objectId);
					if ( m == 0 )
					{
						results[m].set('userID', userId);
						results[m].save();
					}
				}
				var count = results.length;
				var countStr  = count.toString();
				var reply = 'converted ' + countStr + ' messages';
				response.success(reply);
			}
		},
		error: function()
		{
			response.error('unable to convert messages');
		}
	});
});


/*
 *	Twilio Methods
 *	These are to connect to and use Twilio
 *
 *
 *	To use Twilio's API you need the following:
 *
 *	Twilio Account SID
 *	in TWILIO_ACCOUNT_SID
 *
 *	Twilio Account Authorisation Token
 *	in TWILIO_ACCOUNT_TOKEN
 *
 *	Twilio Service SID
 *	in TWILIO_SERVICE_SID
 *
 *	Twilio Service Authorisation Token / Password
 *	in TWILIO_SERVICE_TOKEN
 */


 require('./cloud/twil.js');

var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
var twilioAuthToken		= process.env.TWILIO_ACCOUNT_TOKEN;
var twilioPhoneNumber	= process.env.TWILIO_PHONE_NUMBER;
var twilioServiceSid	= process.env.TWILIO_SERVICE_SID;
var twilioServiceToken	= process.env.TWILIO_SERVICE_TOKEN;

var language            = 'en';
var languages           = ['en','en-CA','en-GB','en-US'];

var twilio = require('twilio')(twilioAccountSid, twilioAuthToken);

var twilioDebug 			= true;


///////////////////////////////////////
//
// getTwilioPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define('getTwilioPhoneNumber', function(request, response)
{
	Parse.Cloud.useMasterKey();

	response.success(twilioPhoneNumber);
});

///////////////////////////////////////
//
// sendCodeEmail
//
///////////////////////////////////////
Parse.Cloud.define('sendCodeEmail', function(req, res) {
	var emailAddress	= req.params.emailAddress;
	var lang			= req.params.language;
	var phoneNumber		= req.params.phoneNumber;
	phoneNumber			= phoneNumber.replace(/\D/g, '');

	if ( lang !== undefined && languages.indexOf(lang) != -1 )
	{
		language = lang;
	}

	if ( !emailAddress )
	{
		return res.error('Missing Email Address');
	}

	if ( !phoneNumber )
	{
		return res.error('Missing Phone Number');
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);

	query.equalTo('email', emailAddress + '');
	query.first().then(function(result)
	{
		var num = randomNumberWithNumberOfDigits(5);

		//for(d = 0; d < 4; d++)
		//{
		//	var min = 0;
		//	var max = 1;
		//	var digit = Math.floor(Math.random() * (max - min + 1)) + min;
		//
		//	num = num + digit.toString();
		//}

		if ( result )
		{
			result.setUsername(phoneNumber);
			result.setPassword(twilioServiceToken + '-' + num);
			result.set('language', language);
			result.save().then(function()
			{
				return sendCodeSms(phoneNumber, num, language);
			}).then(function()
			{
				res.success('verification code sent');
			}, function(err) {
				res.error(err);
			});
		}
		else
		{
			var user = new Parse.User();
			user.setUsername(phoneNumber);
			user.setPassword(twilioServiceToken + '-' + num);
			user.set('language', language);
			user.setACL({});
			user.save().then(function(a)
			{
				return sendCodeSms(phoneNumber, num, language);
			}).then(function()
			{
				res.success('verification code sent');
			}, function(err)
			{
				res.error(err);
			});
		}
	},
	function (err)
	{
		res.error(err);
	});
});

///////////////////////////////////////
//
// sendCode
//
///////////////////////////////////////
Parse.Cloud.define('sendCode', function(req, res) {

	conditionalLog(twilioDebug, 'sendCode function called')

	var phoneNumber = req.params.phoneNumber;
	phoneNumber 	= phoneNumber.replace(/\D/g, '');

	conditionalLog(twilioDebug, 'phoneNumber: [' + phoneNumber + ']')

	var resend		= req.params.resend;

	conditionalLog(twilioDebug, 'resend: [' + resend + ']')

	var lang 		= req.params.language;

	conditionalLog(twilioDebug, 'lang: [' + language + ']')

	if ( lang !== undefined && languages.indexOf(lang) != -1 )
	{
		language = lang;
		conditionalLog(twilioDebug,'language set to default');
	}

	if ( !phoneNumber || phoneNumber.length != 10 )
	{
		conditionalLog(twilioDebug,'invalid phone number [' + phoneNumber + ']');
		return res.error('Invalid Phone number');
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);

	query.equalTo('username', phoneNumber + '');
	query.first().then(function(result)
	{
		var num = randomNumberWithNumberOfDigits(5);
		conditionalLog(twilioDebug,'will send 5 digit verification number');
		if ( result )
		{
			var expiry = result.get('alternateDeviceExpiry');
			var isLinking = isWithinFiveMinutes(expiry);

			if ( resend != null)
			{
				conditionalLog(twilioDebug,'resend request');
				isLinking = false;
			}

			if ( isLinking )
			{
				conditionalLog(twilioDebug,'linking, will obtain from other device');
				res.success('obtain verification code from existing device');
			}
			else
			{
				result.setPassword(twilioServiceToken + '-' + num);
				result.set('language', language);
				result.save().then(function()
				{
					conditionalLog(twilioDebug,'ready to send code to phone');
					return sendCodeSms(phoneNumber, num, language);
				}).then(function()
				{
					conditionalLog(twilioDebug,'sent code');
					res.success('verification code sent');
				}, function(err)
				{
					res.error(err);
				})
			};
		} else
		{
			return res.error('No user found with phone number');
		}
	}, function (err)
	{
		res.error(err);
	});
});

//
// NEED TO TEST THIS FUNCTION
// my user id is 4QdhsyAE6f
// my 6S install id is fiaMOaoayk
// my devices are:
/*
['PgoonPHzn4','NvIBzlqhSp','4qBsUH1qvM','6FFKwmNQJn','uxKKefqhgc','Jc6l0HcbKe','V3Zifgsm7Z','xw71pHUMcR','PVIvUjFTgl']
*/
///////////////////////////////////////
//
// sendPushToUser   NEED TO TEST
//
///////////////////////////////////////
Parse.Cloud.define('sendPushToUser', function(request, response)
{
	Parse.Cloud.useMasterKey();

	var userId				= request.params.userId;
	var message				= request.params.message;
	var badgeNumber			= request.params.badgeNumber;
	var soundName			= request.params.soundName;
	var actionName			= request.params.actionName;
	var expirationInterval	= request.params.expirationInterval;

	// User ID and Message are required
	if ( !userId || !message )
	{
		response.error('Missing required informaiton');
	}

	conditionalLog(twilioDebug, 'User ID: ' + userId);

	// Badge Number defaults to 1
	if ( !badgeNumber )
	{
		badgeNumber = 1;
	}

	conditionalLog(twilioDebug, 'Badge Number: ' + badgeNumber);

	// Sound Name defaults to timbre
	if ( !soundName )
	{
		soundName = 'timbre.caf';
	}

	conditionalLog(twilioDebug, 'Sound Name: ' + soundName);

	// Action Not Required
	if ( !actionName )
	{
		actionName = '';
	}

	conditionalLog(twilioDebug, 'Action Name: ' + actionName);

	// Time Interval Not Required
	if ( !expirationInterval )
	{
		expirationInterval = 0;
	}

	conditionalLog(twilioDebug, 'Expiration Interval: ' + expirationInterval);

	var query = new Parse.Query(Parse.User);
	query.get(userId,
	{
		success: function(userResult)
		{
			if ( userResult )
			{
				conditionalLog(twilioDebug, 'Found User: ' + userResult.get('firstName') + ' ' + userResult.get('lastName'))

				var installIds = userResult.get('installoids');

				var devCount = installIds.length;
				conditionalLog(twilioDebug, 'Devices Count: ' + devCount);

				var pushQuery = new Parse.Query(Parse.Installation);
				pushQuery.containedIn('objectId', installIds);
				pushQuery.descending('updatedAt');
				pushQuery.limit(10);

				conditionalLog(twilioDebug, 'Mark 1');

				Parse.Push.send(
				{
					where: pushQuery,
					expiration_interval: expirationInterval,
					data:
					{
						alert: message,
						badge: badgeNumber,
						sound: soundName,
						category: actionName
					}
				},
				{
					success: function()
					{
						if ( twilioDebug == true )
						{
							pushQuery.get(
							{
								success: function(devices)
								{
									conditionalLog(twilioDebug, 'devices found: ' + devices.length);
									for ( d = 0; d < devices.length; d++ )
									{
										var deviceId = devices[d].objectId;
										conditionalLog(twilioDebug, deviceId);
									}
								},
								error: function(devices, error)
								{
									conditionalLog(twilioDebug, error);
								}
							});
						}
						conditionalLog(twilioDebug, 'Push Sent');
						response.success('push notification sent');
					},
					error: function(error)
					{
						conditionalLog(twilioDebug, 'Error: ' + error);
						response.error(error);
					}
				});
			}
			else
			{
				// no user found
				conditionalLog(twilioDebug, 'No User Found');
				response.error('no user found');
			}
		},
		error: function(userResult, error)
		{
			conditionalLog(twilioDebug, 'User Query Failed: ' + error);
			response.error(error);
		}
	});
});

///////////////////////////////////////
//
// logIn
//
///////////////////////////////////////
Parse.Cloud.define('logIn', function(req, res) {
	Parse.Cloud.useMasterKey();

	// Phone Number
	var phoneNumber		= req.params.phoneNumber;
	phoneNumber			= phoneNumber.replace(/\D/g, '');

	// Verification Code
	var verificationCode = req.params.verificationCode;
	verificationCode = verificationCode.replace(/\D/g, '');

	if (!phoneNumber || phoneNumber.length != 10)
	{
		return res.error('Phone Number missing or invalid length');
	}

	if (!verificationCode || verificationCode.length < 4 || verificationCode.length > 6)
	{
		return res.error('Verification Code missing or invalid length');
	}

	Parse.User.logIn(phoneNumber, twilioServiceToken + '-' + verificationCode).then(function (user)
	{
		res.success(user.getSessionToken());
	}
	,function (err)
	{
		res.error(err);
	});
});

function conditionalLog(doLog, logText)
{
	if ( doLog )
	{
		console.log(logText);
	}
}

function randomNumberWithNumberOfDigits(numDigits)
{
	var num = '';

	for(d = 0; d < numDigits; d++)
	{
		var min = 0;
		var max = 9;
		var digit = Math.floor(Math.random() * (max - min + 1)) + min;

		num = num + digit.toString();
	}

	return num;
}

function isWithinFiveMinutes(timeStamp)
{
	var currentTS = new Date();

	var elapsed = (currentTS - timeStamp);

	if ( elapsed < ( 5 * 60 ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}

function sendCodeSms(phoneNumber, code, language) {
	var prefix = '+1';
	if ( typeof language !== undefined && language == 'en-GB')
    {
		// UK Add +44 and remove 0
		// 07547 835 213 becomes +44 7547 835 213
		prefix = '+44';
		phoneNumber = phoneNumber.substring(1);
	}

	var promise = new Parse.Promise();
	twilio.sendSms(
	{
		to: prefix + phoneNumber.replace(/\D/g, ''),
		from: twilioPhoneNumber.replace(/\D/g, ''),
		body: 'Your Verification Code for the Barbershop Deluxe app is ' + code
	}
	,function(err, responseData)
	{
		if (err) {
			console.log(err);
			promise.reject(err.message);
		}
		else
		{
			promise.resolve();
		}
	});
	return promise;
}


/*
 *
 *	Price Increase Functions
 *
 */


function dateFromString(dateString)
{
	if ( dateString.length == 10 )
	{
		dateString = dateString + ' 00:00:00';
	}
	else if ( dateString.length == 16 )
	{
		dateString = dateString + ':00';
	}

	//var dateString = '2010-08-09 01:02:03';
	var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
	var dateArray = reggie.exec(dateString);
	var dateObject = new Date(
		(+dateArray[1]),
		(+dateArray[2])-1, // Careful, month starts at 0!
		(+dateArray[3]),
		(+dateArray[4]),
		(+dateArray[5]),
		(+dateArray[6])
	);

	return dateObject;
}

///////////////////////////////////////
//
// updateServiceWithPriceEffectiveExpiry
//
///////////////////////////////////////
Parse.Cloud.define('updateServiceWithPriceEffectiveExpiry', function(request, response)
{


	var objectId 	= request.params.serviceId;
	var effective	= request.params.effective;
	var expiry		= request.params.expiry;
	var amount		= request.params.price;

	conditionalLog(twilioDebug,'updateServiceWithPriceEffectiveExpiry');
	conditionalLog(twilioDebug,'serviceId [' + objectId + ']');
	conditionalLog(twilioDebug,'price [' + amount + ']');
	conditionalLog(twilioDebug,'effective [' + effective + ']');
	conditionalLog(twilioDebug,'expiry [' + expiry + ']');

	if ( objectId == undefined || effective == undefined || expiry == undefined || amount == undefined )
	{
		console.log('missing data');
		return response.error('Missing or malformed data')
	}

	Parse.Cloud.useMasterKey();

	if ( effective.length == 10 )
	{
		effective = effective + ' 00:00:00';
	}

	if ( expiry.length == 10 )
	{
		expiry = expiry + ' 23:59:59';
	}

	var dtEffective = dateFromString(effective);
	var dtExpiry    = dateFromString(expiry);
	var nmPrice		= amount; //.parseFloat;
	conditionalLog(twilioDebug,'nmPrice: [' + nmPrice + ']');

	// add to Service
	var query = new Parse.Query('Services');

	query.get(objectId).then(function(result)
	{
		if ( result )
		{
			conditionalLog(twilioDebug,'service: ' + objectId);
			conditionalLog(twilioDebug,'barber: ' + result.get('barberName') + ' service: ' + result.get('serviceName'));

			var servicePrice = new Parse.Object('ServicePrice');
			servicePrice.set('effective', dtEffective);
			servicePrice.set('expiry', dtExpiry);
			servicePrice.set('price', nmPrice);
			servicePrice.setACL({});
			servicePrice.save().then(function()
			{
				if ( servicePrice )
				{
					conditionalLog(twilioDebug,'servicePrice object created');

					var pricesRelation = result.relation('prices');
					pricesRelation.add(servicePrice);

					//result.addRelation('prices', servicePrice);
					result.save().then(function()
					{
						conditionalLog(twilioDebug,'added service price record to service');
						response.success('added service price record to service');
					}, function(err)
					{
						console.log('part 3');
						console.log(err);
						result.error(err);
					});
				}
				else
				{
					console.log('no servicePrice record');
					result.error('unable to create service price record');
				}
			});
			/*
			if ( servicePrice )
			{
				result.add('prices', servicePrice);
				result.save().then(function()
				{
					console.log('added service price record to service');
					response.success('added service price record to service');
				}, function(err)
				{
					console.log('part 3');
					console.log(err);
					response.error(err);
				});
			}
			else
			{
				console.log('no servicePrice record');
				response.error('unable to create service price record');
			}
			*/
			/*
			var servicePrice = new Parse.Object('ServicePrice');
			servicePrice.set('effective', dtEffective);
			servicePrice.set('expiry', dtExpiry);
			servicePrice.set('price', nmPrice);
			servicePrice.setACL({});
			servicePrice.save().then(function()
			{
				if ( servicePrice )
				{
					result.add('prices', servicePrice);
					result.save().then(function()
					{
						console.log('added service price record to service');
						response.success('added service price record to service');
					}, function(err)
					{
						console.log('part 3');
						console.log(err);
						result.error(err);
					});
				}
				else
				{
					console.log('no servicePrice record');
					result.error('unable to create service price record');
				}
			});
			*/
		}
		else
		{
			return response.error('No service found with that id');
		}
	}, function (err)
	{
		console.log('part 4');
		console.log(err);
		response.error(err);
	});
});

///////////////////////////////////////
//
// updateManageURLForUserWithEmailAddress
//
///////////////////////////////////////
Parse.Cloud.define('updateManageURLForUserWithEmailAddress', function(request, response)
{
	twilioDebug = true;
	var manageURL 		= request.params.manageURL;
	var emailAddress	= request.params.emailAddress;

	conditionalLog(twilioDebug,'updateManageURLForUserWithEmailAddress');
	conditionalLog(twilioDebug,'manageURL [' + manageURL + ']');
	conditionalLog(twilioDebug,'emailAddress [' + emailAddress + ']');

	if ( manageURL == undefined || emailAddress == undefined )
	{
		console.log('missing data');
		return response.error('Missing or malformed data')
	}

	Parse.Cloud.useMasterKey();

	// Find User
	var query = new Parse.Query(Parse.User);

	query.equalTo('email', emailAddress + '');
	query.first().then(function(result)
	{
		if ( result )
		{
			result.set('gbManageURL', manageURL);
			result.save().then(function()
			{
				response.success('updated user record');
			}, function(err)
			{
				console.log('unable to update user record');
				console.log(err);
				result.error(err);
			});
		}
		else
		{
			return response.error('No user found with that email');
		}
	},
	function (err)
	{
		response.error(err);
	});
});


