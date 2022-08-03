Parse.initialize("myAppID");
Parse.serverURL = 'https://parse-server-codecraft-test.herokuapp.com/parse';

var TEAMS_JSON_URL = "https://gist.githubusercontent.com/jawache/0be7f073eb27762d97cac34972ea3468/raw/e8b4f92e7ca677da38700e43e506971d9d592a2a/premier_teams.json";

var PLAYERS_JSON_URL = "https://gist.githubusercontent.com/jawache/e281399ba5d63dc10bd170dd2b0f707f/raw/9821e89146b13dc42abcf8fb7e69939c55ee5886/premier_football_players.json";

var COFFEE_JSON_URL = "https://gist.githubusercontent.com/jawache/2a11d6fb31e79dcf827e2d42d1326e4b/raw/403a967604107e9b9f24df23ce6ba5cb6c7fc5d0/coffee_shops_east_london.json";

var Team = Parse.Object.extend("Team");
var Player = Parse.Object.extend("Player");
var Place = Parse.Object.extend("Place");

var TEAMS_MAP = {};

function deletePlaces() {
  var promise = new Parse.Promise();	
	var q = new Parse.Query("Place");
	q.limit(1000);	
  q.find().then(function(places) {
    Parse.Object.destroyAll(places).then(function() {
			console.log("Places deleted... ");
			promise.resolve();			
		});
	});
	return promise;		
}

function deleteTeams() {
  var promise = new Parse.Promise();	
	var q = new Parse.Query("Team");
	q.limit(1000);	
  q.find().then(function(teams) {
    Parse.Object.destroyAll(teams).then(function() {
			console.log("Teams deleted... ");
			promise.resolve();			
		});
	});
	return promise;	
}


function deletePlayers() {
  var promise = new Parse.Promise();	
	var q = new Parse.Query("Player");
	q.limit(1000);	
  q.find().then(function(players) {
    Parse.Object.destroyAll(players).then(function() {
			console.log("Players deleted... ");
			promise.resolve();
		});
	});
	return promise;
}

function createTeams() {	
  var promise = new Parse.Promise();		
	console.log("Creating teams...");		
	var promises = [];
	$.getJSON( TEAMS_JSON_URL, function( data ) {
		data.forEach(function(item, index) {
			console.log("Saving team " + item.name);
			if (item.squadMarketValue) {
  			item.squadMarketValue = parseFloat(item.squadMarketValue.slice(0, -1).replace(',',''));				
			}
			var team = new Team();
			promises.push(team.save(item));
			TEAMS_MAP[item.code] = team;
		});
	});

	Parse.Promise.when(promises).then(function() {
		console.log("All teams created");
			promise.resolve();		
	}, function error(err) {
		console.error(err);
	});	
	return promise;	
}


function createPlayers() {	
  var promise = new Parse.Promise();		
	console.log("Creating players...");	
	var promises = [];
	$.getJSON( PLAYERS_JSON_URL, function( data ) {
		console.log("Got data ", data);	
		//noprotect
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			console.log("Saving player " + item.name);
			if (item.marketValue) {
  			item.marketValue = parseFloat(item.marketValue.slice(0, -1).replace(',',''));			
			}
			if (item.dateOfBirth) {
				item.dateOfBirth = new Date(item.dateOfBirth);				
			}
			if (item.contractUntil) {
				item.contractUnitl = new Date(item.contractUntil);				
			}
			if (item.teamCode) {
				item.team = TEAMS_MAP[item.teamCode];
			}
			var player = new Player();
			promises.push(player.save(item));			
		}
		
		Parse.Promise.when(promises).then(function() {
			console.log("All players created");
			promise.resolve();					
		}, function error(err) {
			console.error(err);
		});			

	});
	return promise;			
}


function createPlaces() {	
  var promise = new Parse.Promise();		
	console.log("Creating places...");		
	var promises = [];
	$.getJSON( COFFEE_JSON_URL, function( data ) {
		data.forEach(function(item, index) {
			console.log("Saving place " + item.name);			
			delete item['id'];	
			delete item['distance'];				
			if (item.location) {

        var lat = item.location.coordinate.latitude;
        var lon = item.location.coordinate.longitude;		
				var point = new Parse.GeoPoint({latitude: lat, longitude: lon});
				item.geo = point;
			}
			var place = new Place();
			promises.push(place.save(item));
		});
	});

	Parse.Promise.when(promises).then(function() {
		console.log("All places created");
			promise.resolve();		
	}, function error(err) {
		console.error(err);
	});	
	return promise;	
}


deleteTeams()
	.then(createTeams)
	.then(deletePlayers)
	.then(createPlayers)
  .then(deletePlaces)
	.then(createPlaces);






//Source - https://jsbin.com/maboca/89/edit?html,js,output