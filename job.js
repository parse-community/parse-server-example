var Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.REST_KEY, process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;
Parse.Cloud.useMasterKey();

var today = new Date();
var minutes = 5;
var time = (minutes * 60 * 1000);
var expirationDate = new Date(today.getTime() - (time));
    
var query = new Parse.Query('ParkingSpaces');
    query.lessThan('createdAt', expirationDate);
	query.equalsTo('taken', false);
    query.find().then(function (spots) {
		var arrayLength = spots.length;
		console.log("found "+arrayLength+" spots relevant");
		for (var i = 0; i < arrayLength; i++) {
			//if ( spots[i].get('taken') == false ){
			console.log("found free spot, setting taken");
			spots[i].set('taken', null);
			spots[i].save();
			//}
		}
		console.log("finished.");
    }, function (error) {});