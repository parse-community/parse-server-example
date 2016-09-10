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
	query.find( 
	{
		success: function(results)
		{
			var relation = results[0].get('services');
			var relationQuery = relation.query;
			relationQuery.equalTo('isActive', true);
			relationQuery.find( 
			{
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
// incrementNewAppointmentTally TWO
//
///////////////////////////////////////
Parse.Cloud.define('incrementNewAppointmentTallyTwo', function(request, response)
{
	var globalSettings = Parse.Object.extend('GlobalSettings');
	var query = new Parse.Query(globalSettings);
	query.equalTo('settingName', 'newAppointmentTally');

	query.find(
	{
		success: function(results)
		{
			var resultObject = results[0];
			resultObject.increment('settingValue');

			var tally = resultObject.get('settingValue');
			resultObject.save();

			response.success(tally);
		},
		error: function()
		{
			response.error('unable to increment');
		}
	});
});


///////////////////////////////////////
//
// incrementNewAppointmentTally DEFINE
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
	});
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
			conditionalLog('Testing Converting');
			conditionalLog('found: ' + results.length);
			if ( results.length == 0 )
			{
				response.success('no messages to convert');
				//console.log('none to convert');
			}
			else
			{
				for ( m = 0; m < results.length; m++ )
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


///////////////////////////////////////
//
// conditionalLog - not public
//
///////////////////////////////////////
function conditionalLog(logText)
{
	var doLog = env.process.DEBUG_LOG
	if ( doLog == "True" )
	{
		console.log(logText);
	}
}

/*
 *
 *	Twilio Functions
 *
 */

 // Account SID
 //
 // Auth Token
 //
 // App SID
 //
 // App Password

 require("./cloud/twil.js");

var twilioAccountSid    = 'AC31fd04d3ce8f6369308dc42d2cb16559';
var twilioAuthToken     = 'f20e0042726b0d9cca9e017e68d1f579';
var twilioPhoneNumber   = '+16172199117';
var secretPasswordToken = '4B9CAEC3-E9BF-42D0-B57B-6109D90A4E07';
var twilioMessagingSID  = 'MGb685587f2b87ff3e94536ef258cfced9';
var language            = "en";
var languages           = ["en","en-GB"];

var twilio = require('twilio')(twilioAccountSid, twilioAuthToken);

var debugging 			= true;


///////////////////////////////////////
//
// indigoSMSService
//
///////////////////////////////////////

Parse.Cloud.define("processIncomingSMSM", function(request, response)
{
    Parse.Cloud.useMasterKey();

	var userAgent       = 'Indigo SMS Service 0.0.0 (beta)'

    var messageBody     = request.params.Body;
    var messageFrom     = request.params.From;

    var dateObject      = new Date();
    var timeStamp       = dateObject.getUTCDate();

	var rycardo = {
					baseURL: "http://tdot.coubur.com",
					port: '8176',
					username: 'indigo',
					password: '1nd190Server',
					from: 'twilioFrom',
					time: 'twilioTimeStamp',
					message: 'twilioMessage'
					};

	var account = {
					name: '16172165525',
					info: rycardo
					}

	var accounts = [account];

	var messageAccount = null;

	for ( a = 0; a < accounts.count; a++ )
	{
		var thisAccount = accounts[a];
		if ( thisAccount["name"] == messageFrom )
		{
			messageAccount = thisAccount["info"];
			break;
		}
	}

	if ( messageAccount == null )
	{
		response.error("not authorised");
	}

	var baseURL		= messageAccount["baseURL"];
	var port		= messageAccount["port"];
	var username	= messageAccount["username"];
	var password	= messageAccount["password"];
	var fromVar		= messageAccount["from"];
	var timeVar		= messageAccount["time"];
	var messageVar	= messageAccount["message"];


	var extURL 	= username + ":" + password + "@" + baseURL + ":" + port + "/variables/";

	var fromURL = extURL + fromVar;
	var timestampURL = extURL + timeVar;
	var bodyURL = extURL + messageVar;

	Parse.Cloud.httpRequest(
	{
		method: 'POST',
		url: fromURL,
		followRedirects: true,
		headers:
		{
			'UserAgent': userAgent
		},
		params:
		{
			_method : 'put',
			value : messageFrom
		}
	}).then(function(httpResponse)
	{
		// Success
		response.success(httpResponse.text);

	}, function(httpResponse)
	{
		// error
		response.error(httpResponse.status);
	});


    //response.success("Success");
});

function processCurl(extURL, username, password, varName, varValue)
{


}
///////////////////////////////////////
//
// getTwilioPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define("getTwilioPhoneNumber", function(request, response)
{
	Parse.Cloud.useMasterKey();

	response.success(twilioPhoneNumber);
});

///////////////////////////////////////
//
// sendCodeEmail
//
///////////////////////////////////////
Parse.Cloud.define("sendCodeEmail", function(req, res) {
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

	query.equalTo('email', emailAddress + "");
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
			result.setPassword(secretPasswordToken + '-' + num);
			result.set("language", language);
			result.save().then(function()
			{
				return sendCodeSms(phoneNumber, num, language);
			}).then(function()
			{
				res.success("verification code sent");
			}, function(err) {
				res.error(err);
			});
		}
		else
		{
			var user = new Parse.User();
			user.setUsername(phoneNumber);
			user.setPassword(secretPasswordToken + '-' + num);
			user.set("language", language);
			user.setACL({});
			user.save().then(function(a)
			{
				return sendCodeSms(phoneNumber, num, language);
			}).then(function()
			{
				res.success("verification code sent");
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
Parse.Cloud.define("sendCode", function(req, res) {

	conditionalLog(debugging, "sendCode function called")

	var phoneNumber = req.params.phoneNumber;
	phoneNumber 	= phoneNumber.replace(/\D/g, '');

	conditionalLog(debugging, "phoneNumber: [" + phoneNumber + "]")

	var resend		= req.params.resend;

	conditionalLog(debugging, "resend: [" + resend + "]")

	var lang 		= req.params.language;

	conditionalLog(debugging, "lang: [" + language + "]")

	if ( lang !== undefined && languages.indexOf(lang) != -1 )
	{
		language = lang;
		conditionalLog(debugging,"language set to default");
	}

	if ( !phoneNumber || phoneNumber.length != 10 )
	{
		conditionalLog(debugging,"invalid phone number [" + phoneNumber + "]");
		return res.error('Invalid Phone number');
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);

	query.equalTo('username', phoneNumber + "");
	query.first().then(function(result)
	{
		var num = randomNumberWithNumberOfDigits(5);
		conditionalLog(debugging,"will send 5 digit verification number");
		if ( result )
		{
			var expiry = result.get("alternateDeviceExpiry");
			var isLinking = isWithinFiveMinutes(expiry);

			if ( resend != null)
			{
				conditionalLog(debugging,"resend request");
				isLinking = false;
			}

			if ( isLinking )
			{
				conditionalLog(debugging,"linking, will obtain from other device");
				res.success("obtain verification code from existing device");
			}
			else
			{
				result.setPassword(secretPasswordToken + '-' + num);
				result.set("language", language);
				result.save().then(function()
				{
					conditionalLog(debugging,"ready to send code to phone");
					return sendCodeSms(phoneNumber, num, language);
				}).then(function()
				{
					conditionalLog(debugging,"sent code");
					res.success("verification code sent");
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
