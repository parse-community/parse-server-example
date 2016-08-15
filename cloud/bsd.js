exports.createSupportCodeForInstallationId = function(installationId) {
	//var numbers = require('./cloud/numbers.js');

	var isUsed = true;
	//String supportCode = String();
	supportCode = "";
	while (isUsed = true) {
		supportCode = stringOfRandomNumbers(5);
		isUsed = supportCodeExists(supportCode);
	}

	var isSaved = saveSupportCodeForInstallationId(supportCode, installationId);
	if (isSaved) {
		return supportCode;
	} else {
		return null;
	}
}

exports.saveSupportCodeForInstallationId = function(supportCode, installationId) {
	var query = new Parse.Query('Installation');
	query.id(installationId);
	query.find( {
		success: function(results) {
			if (results.length != 0) {
				var installObj = results[0];
				installObj.set('supportCode', supportCode);
				installObj.save(null, {
					success: function(installObj) {
						return true;
					},
					error: function(installObj, error) {
						return false;
					}
				});
			} else {
				return false;
			}
		},
		error: function() {
			response.error('error 3 in save Support Code');
		}
	});
}

function supportCodeExists(supportCode) {
	var query = new Parse.Query('Installation');
	query.equalTo('supportCode', supportCode);
	query.find( {
		success: function(results) {
			if (results.length == 0) {
				response.success(false);
			} else {
				response.success(true);
			}
		},
		error: function() {
			response.error('error querying for supportCode');
		}
	});
}
function stringOfRandomNumbers(numDigits) {
	var allDigits = "";

	for (var idx = 1; idx <= numDigits; ++idx) {
		var randomFloat = Math.random() * (9 - 0) + 0; // random 0 - 9
		var randomDigit = Math.floor(randomFloat);
		var digit = String.valueOf(randomDigit);
		allDigits.concat(digit);
	}

	return allDigits
}





