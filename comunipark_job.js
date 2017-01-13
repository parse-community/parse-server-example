var Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.REST_KEY, process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;
Parse.Cloud.useMasterKey();

var today = new Date();
var days = 1;
var time = (days * 60 * 60 * 1000);
var expirationDate = new Date(today.getTime() - (time));
    
var query = new Parse.Query('ParkingSpaces');
    query.lessThan('updatedAt', expirationDate);
    query.find().then(function (spots) {
		var arrayLength = spots.length;
		console.log("found "+arrayLength+" spots relevant");
		for (var i = 0; i < arrayLength; i++) {
			spots[i].destroy();
			console.log("destroyed.")
		}
		console.log("finished.");
    }, function (error) {});