// -- CONTENTS --
//
//  --- Triggers:
// beforeSave (user)
// afterSave  (user)

//  --- Funs:
// GetUserData
//   AssembleUserDataObject
//   AssembleUserData
// GetCustomUserData
// SetUserData
// AugmentSkills
// SetUserDataFiles
//   GetMyLeague
// GetLeagueInfo
//   GetLeagueMainInfoAsString
// GetLeagueInfoShort
//   GetFixtureResultAsString
//   GetFixtureEmptyResultAsString
//   GetLeagueSnapshot
// GetServerPlayFixtures
// SavePlayedFixture
// DeleteCurrentPlayer
// obsolete_AssignUserGroupToLeagues

// test_save_file

// FB_LinkToCurrentUser
// FB_SetUserInfo


//   LeagueFindForPlayer
//   LeagueCreateEmptyForLevel
//   LeagueAddPlayer
//   LeaguesAssignUsers
//   LeagueAssignGroup
//   LeaguesStart
//   LeagueStart
//   LeagueFillWithBots
//   LeagueReset
//   LeagueDeleteFixtures
//   LeagueGenerateFixtures
//   LeaguesPrepareNextDay
//   LeaguePrepareNextDay
//   LeaguesNextDay
//   LeagueNextDay
//   LeagueAutoPlay
//   LeaguePromotePlayers
//   LeagueEnd
//   LeagueSaveSnapshot
//   LeagueDeletePlayer
//   LeagueDeleteBots

//   GenUsers_SetName
//   GenUsers


// test_del_users

//  --- Jobs:
//


var LegueNewTimeToStartSeconds = 10 * 60;

var LeagueDayLengthSeconds = 10 * 60;
var LeagueTimeForServerPlaySeconds = 9 * 60;

var LeagueTimePreseasonSeconds = 10 * 60;
var LeagueStartBeforeFirstDaySeconds = 6 * 60;

var LeaguePromotePlayersNum = 0;

var LeagueMaxPlayers = 10;

//var UserDefault_Name = "No Name";
var UserDefault_Currency = {
	Coin : 101,
	LeagueLevelMod : 1
};
var UserDefault_DailyReward = {
	dailyEntrance : 1,
	freeTrainingPoints : 2,
	lastLoginTime : "1/10/2000"
};
var UserDefault_Inventory = {
	Items : [0]
};
var UserDefault_PlayerCharacterParams = {
	Acceleration : 0,
	BackhandPower : 60,
	Balance : 0.1,
	CharacterID : 0,
	CharacterLevel : 0,
	CharacterSkin : 0,
	ClothesBottom : 0,
	ClothesTop : 0,
	ForehandPower : 0,
	FreeSkillPoints : 1,
	HorizontalReach : 0,
	Level : 1,
	LobShotSkill : 20,
	MaxSpeed : 5,
	MaxStamina : 20,
	MaxTurnSpeed : 1080,
	Power : 0.2,
	PowerShot : 0,
	Precision : 2,
	Racquet : 0,
	Reaction : 0,
	ServeHeight : 3,
	ServePower : 30,
	ServePrecision : 1,
	Shoes : 0,
	SmashShotSkill : 1,
	TopSpin : 0.4,
	TopspinPower : 0.5,
	UnderSpin : 0.4,
	UnderspinPower : 0.5,
	UserID : "",
	VerticalReach : 0,
	Volley : 0,
	netFlightOver : 0
};
var UserDefault_PlayerClubParams = {
	ClubLevel : 0,
	ClubType : "England"
};
var UserDefault_Statistics = {
	PlayedDays : 0,
	league_totalMatches : 0,
	league_winMatches : 0,
	learningCount : 0,
	matches_full : 0,
	matches_human : 0,
	matches_totalAgentVsAgent : 0,
	matches_totalAgentVsHuman : 0,
	matches_winAgentVsAgent : 0,
	matches_winAgentVsHuman : 0,
	totalSkillParams : 0,
	training_total : 0,
	training_win : 0
};

var Chatacter_Parameters_Progress_Coeff = 0.1;
var Prices_PlayerCharacterParams = {

	BackhandPower : 0.4,
	Balance : 0.01,
	LobShotSkill : 1,
	MaxSpeed : 0.05,
	MaxStamina : 0.5,
	MaxTurnSpeed : 18,
	Power : 0.01,
	Precision : 0.1,
	ServePower : 0.46,
	ServePrecision : 1,
	SmashShotSkill : 1,
	TopSpin : 0.01,
	UnderSpin : 0.01
};

Parse.Cloud.beforeSave(Parse.User, function (request, response) {

	if (request.object.isNew()) {}
	else {}

	response.success();
});

Parse.Cloud.afterSave(Parse.User, function (request, response) {

	if (request.object.createdAt.toString() == request.object.updatedAt.toString()) {

		// ADDING UserData /////////////////////

		var UserData = Parse.Object.extend("UserData");
		var userData = new UserData();

		var Group = 0;

		userData.set("Player", request.object);
		userData.set("Group", Group);
		userData.set("Level", 1);
		userData.set("PlayerType", 1);
		userData.set("Name", ""); //request.user.get("username"));
		userData.set("Currency", UserDefault_Currency);
		userData.set("DailyReward", UserDefault_DailyReward);
		userData.set("Inventory", UserDefault_Inventory);
		userData.set("PlayerCharacterParams", UserDefault_PlayerCharacterParams);
		userData.set("PlayerClubParams", UserDefault_PlayerClubParams);
		userData.set("Statistics", UserDefault_Statistics);

		userData.save(null, {
			useMasterKey : true,
			success : function (userData) {

				var ArchiveUser = Parse.Object.extend("ArchiveUser");
				var aUser = new ArchiveUser();

				aUser.set("username", request.user.get("username"));
				aUser.set("userID", request.user.id);

				aUser.save(null, {
					success : function (aUserRes) {},
					error : function (userLeagueData, error) {}
				});
			},
			error : function (userData, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.

				alert('Failed to save UserData, with error code: ' + error.message);

			}
		});

	} else {}

});

Parse.Cloud.define("GetUserData", function (request, response) {

	if (request.params.Ver >= 3) {}
	else {
		response.error("Wrong client version! Update please!");
		return;
	};

	var query = new Parse.Query("UserData");
	query.equalTo("Player", request.user);
	query.limit(1);

	query.find({
		useMasterKey : true,
		success : function (results) {
			if (results.length > 0) {

				var obj = AssembleUserDataObject(results[0]);

				response.success(obj);
			} else
				response.error("NO SUCH USER DATA!!!");
		},
		error : function () {
			response.error("UD lookup failed");
		}
	});
});

function AssembleUserDataObject(UD) {

	var st_UD = JSON.stringify(AssembleUserData(UD));

	var obj = {
		"UserData" : st_UD,
		"ACData" : UD.get("ACData"),
		"ACLSData" : UD.get("ACLSData"),
		"RefData" : UD.get("RefData"),
		"__type" : "Object",
		"className" : "UserData",
		//"createdAt" : UD.get("createdAt"),
		"objectId" : UD.id,
		//"updatedAt" : UD.get("updatedAt")
	};

	return obj;
}

function AssembleUserData(UD) {

	var obj;

	var obj_UD = {
		"ID" : UD.get("Player").id,
		"Name" : UD.get("Name"),
		"PlayerCharacterParams" : UD.get("PlayerCharacterParams"),
		"PlayerClubParams" : UD.get("PlayerClubParams"),
		"Currency" : UD.get("Currency"),
		"DailyReward" : UD.get("DailyReward"),
		"Inventory" : UD.get("Inventory"),
		"Statistics" : UD.get("Statistics")
	};

	return obj_UD;
}

Parse.Cloud.define("GetCustomUserData", function (request, response) {

	if (request.params.UserID_or_Email == undefined || request.params.UserID_or_Email == "") {
		response.error("Param UserID_or_Email is not defined!");
		return;
	};

	var UserByID = new Parse.Query(Parse.User);
	UserByID.equalTo("objectId", request.params.UserID_or_Email);
	var QueryByID = new Parse.Query("UserData").matchesQuery("Player", UserByID);

	var UserByName = new Parse.Query(Parse.User);
	UserByName.equalTo("username", request.params.UserID_or_Email);
	var QueryByName = new Parse.Query("UserData").matchesQuery("Player", UserByName);

	var mainQuery = Parse.Query.or(QueryByID, QueryByName);

	mainQuery.limit(1);
	mainQuery.find({
		useMasterKey : true,
		success : function (results) {
			if (results.length > 0)
				response.success(AssembleUserDataObject(results[0]));
			else
				response.error("NO SUCH USER DATA!!!");
		},
		error : function () {
			response.error("UD lookup failed");
		}
	});
});

Parse.Cloud.define("SetUserData", function (request, response) {

	var query = new Parse.Query("UserData");
	query.equalTo("Player", request.user);
	query.limit(1);
	query.find({
		useMasterKey : true,
		success : function (results) {
			if (results.length > 0) {

				var UD_obj = JSON.parse(request.params.UD);
				results[0].set("Name", UD_obj.Name);
				results[0].set("PlayerCharacterParams", UD_obj.PlayerCharacterParams);
				results[0].set("PlayerClubParams", UD_obj.PlayerClubParams);
				results[0].set("Currency", UD_obj.Currency);
				results[0].set("DailyReward", UD_obj.DailyReward);
				results[0].set("Inventory", UD_obj.Inventory);
				results[0].set("Statistics", UD_obj.Statistics);

				results[0].save(null, {
					useMasterKey : true,
					success : function (aUserRes) {
						response.success("UserData saved!");
					},
					error : function (userData, error) {
						response.error("Saving UserData failed!");
					}
				});
			} else
				response.error("NO SUCH USER DATA!!!");
		},
		error : function () {
			response.error("UD lookup failed");
		}
	});
});

Parse.Cloud.define("AugmentSkills", function (request, response) {

	var query = new Parse.Query("UserData");
	query.equalTo("Player", request.user);
	query.limit(1);

	var promise = query.find({
			useMasterKey : true
		});

	var FreeSkillPoints_Needed = 0;

	if ("BackhandPower" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.BackhandPower / (Prices_PlayerCharacterParams.BackhandPower * Chatacter_Parameters_Progress_Coeff);
	if ("Balance" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.Balance / (Prices_PlayerCharacterParams.Balance * Chatacter_Parameters_Progress_Coeff);
	if ("MaxSpeed" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.MaxSpeed / (Prices_PlayerCharacterParams.MaxSpeed * Chatacter_Parameters_Progress_Coeff);
	if ("MaxStamina" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.MaxStamina / (Prices_PlayerCharacterParams.MaxStamina * Chatacter_Parameters_Progress_Coeff);
	if ("MaxTurnSpeed" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.MaxTurnSpeed / (Prices_PlayerCharacterParams.MaxTurnSpeed * Chatacter_Parameters_Progress_Coeff);
	if ("Power" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.Power / (Prices_PlayerCharacterParams.Power * Chatacter_Parameters_Progress_Coeff);
	if ("Precision" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.Precision / (Prices_PlayerCharacterParams.Precision * Chatacter_Parameters_Progress_Coeff);
	if ("ServePower" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.ServePower / (Prices_PlayerCharacterParams.ServePower * Chatacter_Parameters_Progress_Coeff);
	if ("ServePrecision" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.ServePrecision / (Prices_PlayerCharacterParams.ServePrecision * Chatacter_Parameters_Progress_Coeff);
	if ("SmashShotSkill" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.SmashShotSkill / (Prices_PlayerCharacterParams.SmashShotSkill * Chatacter_Parameters_Progress_Coeff);
	if ("TopSpin" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.TopSpin / (Prices_PlayerCharacterParams.TopSpin * Chatacter_Parameters_Progress_Coeff);
	if ("UnderSpin" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.UnderSpin / (Prices_PlayerCharacterParams.UnderSpin * Chatacter_Parameters_Progress_Coeff);
	if ("LobShotSkill" in request.params.Deltas)
		FreeSkillPoints_Needed += request.params.Deltas.LobShotSkill / (Prices_PlayerCharacterParams.LobShotSkill * Chatacter_Parameters_Progress_Coeff);

	FreeSkillPoints_Needed = Math.round(FreeSkillPoints_Needed);

	promise.then(function (results) {
		if (results.length == 0) {
			response.error("No user data found!");
			return;
		}

		var pcp = results[0].get("PlayerCharacterParams");

		if (FreeSkillPoints_Needed <= pcp.FreeSkillPoints) {

			if ("BackhandPower" in request.params.Deltas)
				pcp.BackhandPower += request.params.Deltas.BackhandPower;
			if ("Balance" in request.params.Deltas)
				pcp.Balance += request.params.Deltas.Balance;
			if ("MaxSpeed" in request.params.Deltas)
				pcp.MaxSpeed += request.params.Deltas.MaxSpeed;
			if ("MaxStamina" in request.params.Deltas)
				pcp.MaxStamina += request.params.Deltas.MaxStamina;
			if ("MaxTurnSpeed" in request.params.Deltas)
				pcp.MaxTurnSpeed += request.params.Deltas.MaxTurnSpeed;
			if ("Power" in request.params.Deltas)
				pcp.Power += request.params.Deltas.Power;
			if ("Precision" in request.params.Deltas)
				pcp.Precision += request.params.Deltas.Precision;
			if ("ServePower" in request.params.Deltas)
				pcp.ServePower += request.params.Deltas.ServePower;
			if ("ServePrecision" in request.params.Deltas)
				pcp.ServePrecision += request.params.Deltas.ServePrecision;
			if ("SmashShotSkill" in request.params.Deltas)
				pcp.SmashShotSkill += request.params.Deltas.SmashShotSkil;
			if ("TopSpin" in request.params.Deltas)
				pcp.TopSpin += request.params.Deltas.TopSpin;
			if ("UnderSpin" in request.params.Deltas)
				pcp.UnderSpin += request.params.Deltas.UnderSpin;
			if ("LobShotSkill" in request.params.Deltas)
				pcp.LobShotSkill += request.params.Deltas.LobShotSkill;

			pcp.FreeSkillPoints -= FreeSkillPoints_Needed;
			results[0].set("PlayerCharacterParams", pcp);
		}

		results[0].save(null, {
			useMasterKey : true
		}).then(function () {
			var obj = AssembleUserDataObject(results[0]);
			response.success(obj);
		});
	}, function (err) {
		response.error("Failed : " + JSON.stringify(err));
	});
});

Parse.Cloud.define("SetUserDataFiles", function (request, response) {

	var query = new Parse.Query("UserData");
	query.equalTo("Player", request.user);
	query.limit(1);
	query.find({
		useMasterKey : true,
		success : function (results) {
			if (results.length > 0) {
				results[0].set("ACData", request.params.ACData);
				results[0].set("RefData", request.params.RefData);
				results[0].set("ACLSData", request.params.ACLSData);
				results[0].save(null, {
					useMasterKey : true,
					success : function (aUserRes) {
						response.success("UserData Files saved!");
					},
					error : function (userData, error) {
						response.error("Saving UserData Files failed!");
					}
				});
			} else
				response.error("NO SUCH USER DATA!!!");
		},
		error : function () {
			response.error("UD lookup failed");
		}
	});
});

function GetMyLeague(user) {

	var query = new Parse.Query("UserData");
	query.equalTo("Player", user).include("League");

	return query.first({
		useMasterKey : true
	}).then(function (UData) {
		if (UData == undefined)
			return undefined;
		else
			return (UData.get("League") == undefined) ? UData.get("LastLeague") : UData.get("League");
	});
}

Parse.Cloud.define("GetLeagueInfo", function (request, response) {

	GetMyLeague(request.user).then(function (League) {

		if (League == undefined)
			response.success("{\"code\":400001, \"msg\":\"User not in league\"}");
		else
			if (League.get("CurrentState") == 0 && League.get("LastSnapshot") != undefined) {

				var obj = JSON.parse(League.get("LastSnapshot"));
				var today = new Date();
				var firstDayInSec = Math.round((League.get('FirstDayDateTime') - today) / 1000);
				obj.firstDayInSec = "" + firstDayInSec + "";

				response.success(JSON.stringify(obj));
			} else
				GetLeagueSnapshot(League).then(function (str) {
					response.success(str);
				},
					function (err) {
					response.error("Failed GetLeagueSnapshot(): " + JSON.stringify(err));
				});
	});
});

function GetLeagueMainInfoAsString(League) {
	var today = new Date();
	var str = "";

	str = str + " \"ID\":\"" + League.id + "\",";
	str = str + " \"name\":\"" + League.get('Name') + "\",";
	str = str + " \"level\":" + League.get('Level') + ",";
	str = str + " \"maxDays\":" + League.get('MaxDays') + ",";
	var firstDayInSec = Math.round((League.get('FirstDayDateTime') - today) / 1000);
	str = str + " \"firstDayInSec\":" + firstDayInSec + ",";
	str = str + " \"dayLengthInSec\":" + League.get('DayLengthInSec') + ",";

	return str;
}

Parse.Cloud.define("GetLeagueInfoShort", function (request, response) {

	GetMyLeague().then(function (League) {

		if (League == undefined)
			response.success("{\"code\":400001, \"msg\":\"User not in league\"}");
		else
			response.success(GetLeagueMainInfoAsString(League));
	});
});

function GetFixtureResultAsString(Fixture) {
	var str = "";
	str = str + " \"status\":" + Fixture.get('Status') + ",";
	str = str + " \"score_0\":" + ((Fixture.get('Score0') == undefined) ? "null" : Fixture.get('Score0')) + ",";
	str = str + " \"score_1\":" + ((Fixture.get('Score1') == undefined) ? "null" : Fixture.get('Score1')) + ",";
	var GameFileData = Fixture.get('GameFileID');
	var GameFileURL = ((GameFileData == undefined) ? "" : GameFileData.get('file').url());
	str = str + " \"replayUrl\":\"" + GameFileURL + "\",";
	str = str + " \"matchTime\":" + ((Fixture.get('MatchDurationSeconds') == undefined) ? "null" : Fixture.get('MatchDurationSeconds')) + ",";
	str = str + " \"GameFileID\":" + ((Fixture.get('GameFileID') == undefined) ? "null" : "\"" + Fixture.get('GameFileID').id + "\"") + ",";
	str = str + " \"PlayedType\":" + ((Fixture.get('PlayedType') == undefined) ? "null" : Fixture.get('PlayedType')) + "";
	return str;
}

function GetFixtureEmptyResultAsString() {
	var str = "";
	str = str + " \"status\":0,";
	str = str + " \"score_0\":null,";
	str = str + " \"score_1\":null,";
	str = str + " \"replayUrl\":\"\",";
	str = str + " \"matchTime\":null,";
	str = str + " \"GameFileID\":null,";
	str = str + " \"PlayedType\":null";
	return str;
}

function GetLeagueSnapshot(League) {

	var today = new Date();

	var queryUsers = new Parse.Query("UserData");
	queryUsers.equalTo("League", League);

	var queryFixtures = new Parse.Query("Fixtures");
	queryFixtures.equalTo("League", League);
	queryFixtures.select("objectId", "GameDate", "Player0", "Player1", "GameDay", "Status", "Score0", "Score1", "MatchDurationSeconds", "GameFileID", "PlayedType");
	queryFixtures.include("GameFileID");
	queryFixtures.limit(1000);

	return queryUsers.find({
		useMasterKey : true
	}).then(function (resultsUsers) {

		return queryFixtures.find().then(function (resultsFixtures) {

			///////////////////////////
			var str = "";

			str = str + " { ";

			str = str + GetLeagueMainInfoAsString(League);

			str = str + " \"Players\":[ ";
			for (var i = 0; i < resultsUsers.length; i++) {
				str = str + " { ";
				var object = resultsUsers[i];
				str = str + " \"Player\":\"" + object.get('Player').id + "\",";
				str = str + " \"Email\":\"" + "blocked_in_backend!" + "\",";
				str = str + " \"UserData\":" + JSON.stringify(AssembleUserData(object)) + ","; // JSON.stringify
				var ACData = object.get('ACData');
				var FileURL = ((ACData == undefined) ? "" : ACData.url());
				str = str + " \"ACDataURL\":\"" + FileURL + "\"";
				str = str + " } ";
				if (i < resultsUsers.length - 1)
					str = str + " , ";
			}
			str = str + " ], ";

			var objects = League.get("Players");

			str = str + " \"LeaguePlayers\":[ ";
			for (var i = 0; i < objects.length; i++) {
				str = str + " { ";
				var object = objects[i];
				str = str + " \"ID\":\"" + object.Player + "\",";
				str = str + " \"Score\":" + object.Points + ",";
				str = str + " \"leagueWins\":" + object.Wins + ",";
				str = str + " \"leagueLoses\":" + object.Loses + ",";
				str = str + " \"leagueGames\":" + object.Games + ",";
				str = str + " \"TotalMatchDurationSeconds\":" + object.TotalMatchDurationSeconds;
				str = str + " } ";
				if (i < objects.length - 1)
					str = str + " , ";
			}
			str = str + " ], ";

			str = str + " \"Fixtures\":[ ";
			for (var i = 0; i < resultsFixtures.length; i++) {
				str = str + " { ";
				var object = resultsFixtures[i];
				str = str + " \"id\":\"" + object.id + "\",";
				str = str + " \"playerID_0\":\"" + object.get('Player0').id + "\",";
				str = str + " \"playerID_1\":\"" + object.get('Player1').id + "\",";
				str = str + " \"day\":" + object.get('GameDay') + ",";
				if ((League.get('CurrentDay') == object.get('GameDay') && object.get('Status') == 1 && object.get('PlayedType') == 3) || (object.get('Status') == 2))
					str = str + GetFixtureEmptyResultAsString();
				else
					str = str + GetFixtureResultAsString(object);
				str = str + " } ";
				if (i < resultsFixtures.length - 1)
					str = str + " , ";
			}
			str = str + " ] ";

			str = str + " } ";

			return Parse.Promise.as(str);
			///////////////////////////
		});
	});

}

Parse.Cloud.define("GetServerPlayFixtures", function (request, response) {

	var queryFixtures = new Parse.Query("Fixtures");
	queryFixtures.equalTo("Status", 2);
	queryFixtures.equalTo("SentToPlayAt", undefined);
	queryFixtures.select("objectId", "GameDate", "Player0", "Player1", "GameDay", "Status", "Score0", "Score1", "MatchDurationSeconds", "GameFileID", "PlayedType", "SentToPlayAt");
	queryFixtures.include("GameFileID");
	queryFixtures.limit(10);

	var queryUsers0 = new Parse.Query("UserData");
	queryUsers0.matchesKeyInQuery("Player", "Player0", queryFixtures);
	queryUsers0.include("Player");

	var queryUsers1 = new Parse.Query("UserData");
	queryUsers1.matchesKeyInQuery("Player", "Player1", queryFixtures);
	queryUsers1.include("Player");

	var mainUserQuery = Parse.Query.or(queryUsers0, queryUsers1);

	mainUserQuery.find({
		useMasterKey : true,
		success : function (resultsUsers) {

			queryFixtures.find({
				useMasterKey : true,
				success : function (resultsFixtures) {

					var today = new Date();

					///////////////////////////
					var str = "";

					str = str + " { ";

					str = str + " \"ID\":\"none\",";
					str = str + " \"name\":\"none\",";
					str = str + " \"level\":0,";
					str = str + " \"curDay\":0,";
					str = str + " \"curStep\":0,";
					str = str + " \"maxDays\":0,";

					str = str + " \"Players\":[ ";
					for (var i = 0; i < resultsUsers.length; i++) {
						str = str + " { ";
						var object = resultsUsers[i];
						str = str + " \"Player\":\"" + object.get('Player').id + "\",";
						str = str + " \"Email\":\"blocked\",";
						str = str + " \"UserData\":" + JSON.stringify(AssembleUserData(resultsUsers[i])) + ",";
						var ACData = object.get('ACData');
						var FileURL = ((ACData == undefined) ? "" : ACData.url());
						str = str + " \"ACDataURL\":\"" + FileURL + "\"";
						str = str + " }"
							if (i < resultsUsers.length - 1)
								str = str + ",";
					}
					str = str + " ], ";

					str = str + " \"LeaguePlayers\":[ ";
					str = str + " ], ";

					str = str + " \"Fixtures\":[ ";
					for (var i = 0; i < resultsFixtures.length; i++) {
						str = str + " { ";
						var object = resultsFixtures[i];
						str = str + " \"id\":\"" + object.id + "\",";
						str = str + " \"playerID_0\":\"" + object.get('Player0').id + "\",";
						str = str + " \"playerID_1\":\"" + object.get('Player1').id + "\",";
						str = str + " \"day\":" + ((object.get('GameDay') == undefined) ? "null" : object.get('GameDay')) + ",";
						//str = str + " \"day\":" + object.get('GameDay') + ",";
						str = str + " \"status\":" + object.get('Status') + ",";
						str = str + " \"score_0\":" + ((object.get('Score0') == undefined) ? "null" : object.get('Score0')) + ",";
						str = str + " \"score_1\":" + ((object.get('Score1') == undefined) ? "null" : object.get('Score1')) + ",";
						var GameFileData = object.get('GameFileID');
						var GameFileURL = ((GameFileData == undefined) ? "" : GameFileData.get('file').url());
						str = str + " \"replayUrl\":\"" + GameFileURL + "\",";
						str = str + " \"matchTime\":" + ((object.get('MatchDurationSeconds') == undefined) ? "null" : object.get('MatchDurationSeconds')) + ",";
						str = str + " \"GameFileID\":" + ((object.get('GameFileID') == undefined) ? "null" : "\"" + object.get('GameFileID').id + "\"") + ",";
						str = str + " \"PlayedType\":" + ((object.get('PlayedType') == undefined) ? "null" : object.get('PlayedType')) + "";
						str = str + " }"
							if (i < resultsFixtures.length - 1)
								str = str + ",";

							resultsFixtures[i].set("SentToPlayAt", today);
					}
					str = str + " ] ";

					str = str + " } ";

					Parse.Object.saveAll(resultsFixtures, {
						success : function (listResultsFixtures) {
							response.success(str);
						},
						error : function (error) {
							response.error("Save fixtures by SentToPlayAt failed. Error.message:" + error.message);
						}
					});
				},
				error : function (error4) {
					response.error("queryFixtures failed:" + error4.message);
				}
			});
		},
		error : function (error3) {
			response.error("find UserData failed:" + error3.message);
		}
	});

});

Parse.Cloud.define("SavePlayedFixture", function (request, response) {

	var FixtureID = request.params.FixtureID;
	var Score0 = request.params.Score0;
	var Score1 = request.params.Score1;
	var MatchTime = request.params.MatchTime;

	var queryFixtures = new Parse.Query("Fixtures");
	queryFixtures.equalTo("objectId", FixtureID);
	queryFixtures.select("objectId", "GameDate", "Player0", "Player1", "League", "GameDay", "Status", "Score0", "Score1", "GameFile", "MatchDurationSeconds", "PlayedType");
	queryFixtures.include("League");
	queryFixtures.limit(1);

	var League;

	queryFixtures.find({
		success : function (resultsFixtures) {

			if (resultsFixtures.length == 0) {
				response.success("Ok(empty)");
				return;
			}

			if ((resultsFixtures[0].get("Status") == 1) && (resultsFixtures[0].get("PlayedType") == 1)) {
				response.success("Ok(already played)");
				return;
			}

			League = resultsFixtures[0].get("League");

			var PType = 1; // played in client (normal)
			if ((request.user.id != resultsFixtures[0].get("Player0").id)) // if a Server Play
				PType = 3; // "played on server"

			resultsFixtures[0].set("Status", 1);
			resultsFixtures[0].set("PlayedType", PType);
			resultsFixtures[0].set("Score0", Score0);
			resultsFixtures[0].set("Score1", Score1);
			resultsFixtures[0].set("MatchDurationSeconds", MatchTime);

			resultsFixtures[0].save({
				success : function (res) {

					if (resultsFixtures[0].get("League") == undefined) {
						response.success("Ok! (without save for league users)");
						return;
					}

					var Players = League.get("Players");
					var iP0 = -1;
					var iP1 = -1;
					for (var iP = 0; iP < Players.length; iP++)
						if (Players[iP].Player == resultsFixtures[0].get("Player0").id)
							iP0 = iP;
						else
							if (Players[iP].Player == resultsFixtures[0].get("Player1").id)
								iP1 = iP;

					if ((iP0 == -1) || (iP1 == -1)) {
						response.error("Did not find P0 or P1 in league players!");
						return;
					}

					Players[iP0].Points = Players[iP0].Points + Score0;
					Players[iP0].Wins = (Score0 > Score1) ? Players[iP0].Wins + 1 : Players[iP0].Wins;
					Players[iP0].Loses = (Score0 < Score1) ? Players[iP0].Loses + 1 : Players[iP0].Loses;
					Players[iP0].Games = Players[iP0].Games + 1;
					Players[iP0].TotalMatchDurationSeconds = Players[iP0].TotalMatchDurationSeconds + MatchTime;

					Players[iP1].Points = Players[iP1].Points + Score0;
					Players[iP1].Wins = (Score0 > Score1) ? Players[iP1].Wins + 1 : Players[iP1].Wins;
					Players[iP1].Loses = (Score0 < Score1) ? Players[iP1].Loses + 1 : Players[iP1].Loses;
					Players[iP1].Games = Players[iP1].Games + 1;
					Players[iP1].TotalMatchDurationSeconds = Players[iP1].TotalMatchDurationSeconds + MatchTime;

					League.set("Players", Players);

					League.save({
						success : function () {
							response.success("Ok");
						},
						error : function (error) {
							response.error("League.save failed");
						}
					});

				},
				error : function (error) {
					response.error("resultsFixtures[0].save failed");
				}
			});
		},
		error : function (object, error) {
			response.error("Fixture lookup failed");
		}
	});

});

Parse.Cloud.define("DeleteCurrentPlayer", function (request, response) {

	var PlayerID = request.user.id;

	var User = new Parse.User();
	User.id = PlayerID;

	var query = new Parse.Query("UserData");
	query.equalTo("Player", User);
	query.select("League", "Player");
	query.include("League");
	query.limit(1);
	query.find({
		useMasterKey : true,
		success : function (results) {
			if (results.length == 0) {
				response.success("Ok(empty)!");
				return;
			}

			var League = results[0].get("League");

			var Players = League.get("Players");
			for (var i = 0; i < Players.length; i++)
				if (Players[i].Player == results[0].get("Player").id) {
					Players.splice(i, 1);
					League.set("NumPlayers", League.get("NumPlayers") - 1);
					break;
				}
			League.set("Players", Players);

			League.save().then(function () {
				Parse.Object.destroyAll(results, {
					useMasterKey : true,
					success : function () {
						response.success("Ok!");
					},
					error : function (playersLeague, error) {
						response.error("User delete: failed");
					}
				});
			});
		},
		error : function (object, error) {
			response.error("Find user failed");
		}
	});
})

Parse.Cloud.define("obsolete_AssignUserGroupToLeagues", function (request, response) {

	var UD;
	var LG;

	var GroupNum = 0;
	var GroupSize = 0;

	var QueryUserData = new Parse.Query("UserData");
	QueryUserData.doesNotExist("League");
	QueryUserData.descending("Group");
	QueryUserData.limit(LeagueMaxPlayers);

	var QueryLeagues = new Parse.Query("Leagues");

	var LeagueType = Parse.Object.extend("Leagues");
	var NewEmptyLeague = new LeagueType();
	NewEmptyLeague.set("Level", 1);
	NewEmptyLeague.set("MaxDays", LeagueMaxPlayers - 1);
	NewEmptyLeague.set("NumPlayers", 0);
	NewEmptyLeague.set("Name", "League " + Math.floor((Math.random() * 100000000) + 1));

	NewEmptyLeague.save().then(function () {
		return QueryUserData.find({
			useMasterKey : true
		});
	}).then(function (_UserData) {

		UD = _UserData;

		if (_UserData.length > 0) {

			GroupNum = _UserData[0].get("Group");
			for (var i = 0; i < LeagueMaxPlayers; i++)
				if (_UserData[i].get("Group") == GroupNum)
					GroupSize++;
			QueryLeagues.lessThan("NumPlayers", LeagueMaxPlayers - GroupSize + 1).descending("NumPlayers");

			return QueryLeagues.find();
		} else
			return Parse.Promise.error("No users found.");

	}).then(function (_Leagues) {

		if (_Leagues.length == 0)
			return Parse.Promise.error("No leagues found.");

		LG = _Leagues;

		var Players = LG[0].get("Players");

		for (var j = 0; j < GroupSize; j++) {
			var P;

			P.Player = UD[j].get("Player").id;
			P.Points = 0;
			P.Wins = 0;
			P.Loses = 0;
			P.Games = 0;
			P.PlayerType = UD[j].get("PlayerType");
			P.UserData = UD[j].id;

			Players = [Players, userLeagueData];
		}

		LG[0].set("Players", Players);
		LG[0].set("NumPlayers", LG[0].get("NumPlayers") + GroupSize);

		return LG[0].save();

	}).then(function (object) {

		response.success("Users: " + UD.length + ", Leagues: " + LG.length);

	}, function (error) {
		response.success(error);
	});

})

Parse.Cloud.define("test_save_file", function (request, response) {

	var base64 = "V29ya2luZyBhdCBQYXJzZSBpcyBncmVhdCE=";
	var parseFile = new Parse.File("myfile.txt", {
			base64 : base64
		});
	var pF2 = new Parse.File("myfile2.txt", {
			base64 : base64
		}); ;
	parseFile.save().then(function () {

		var _test = new Parse.Object("Test");
		_test.set("File", parseFile);
		_test.set("FileName", parseFile.name().substr(42, 200));

		var _obj = {
			"File" : JSON.stringify(pF2)
		}; //new Parse.Object();
		//_obj.add("File",parseFile);

		_test.set("FileObject", _obj);

		return _test.save();

	}, function (error) {
		response.error(error);
		// The file either could not be read, or could not be saved to Parse.
	}).then(function () {

		response.success("OK");

	}, function (error) {
		response.error(error);
		// The file either could not be read, or could not be saved to Parse.
	});

})

Parse.Cloud.define("FB_LinkToCurrentUser", function (request, response) {
	//alert("FB_LinkToCurrentUser");
	var User = request.user;

	var str = "{\"facebook\":{\"access_token\":\"" + request.params.access_token + "\",\"expiration_date\":\"" + request.params.expiration_date + "\",\"id\":\"" + request.params.id + "\"}}";

	User.set("authData", str);

	User.save().then(function () {

		var query = new Parse.Query("UserData");
		query.equalTo("Player", request.user);
		query.limit(1);
		return query.find({
			useMasterKey : true
		});
	}).then(function (ud_results) {

		if (ud_results.length > 0) {
			ud_results[0].set("FBID", request.params.id);
			return ud_results[0].save(null, {
				useMasterKey : true
			});
		} else
			return Parse.Promise.error("SetFBFriends: NO USER DATA!");
	}).then(function () {
		response.success("UD saved!");
	}, function (err) {
		response.error("Error: " + JSON.stringify(err));
	});
})

Parse.Cloud.define("FB_SetUserInfo", function (request, response) {

	var friends = [];
	for (var i = 0; i < request.params.friends.data.length; i++)
		friends.push(request.params.friends.data[i].id);

	var UD;
	var query = new Parse.Query("UserData");
	query.equalTo("Player", request.user);
	query.limit(1);
	query.find({
		useMasterKey : true
	}).then(function (ud_results) {

		if (ud_results.length > 0) {
			UD = ud_results[0];

			UD.set("FBID", request.params.id);
			UD.set("FBFriends", friends);

			return Parse.Promise.as("Ok");
		} else
			return Parse.Promise.error("FB_SetInfo: NO USER DATA!");
	}).then(function () {

		var ud_friends = new Parse.Query("UserData");
		ud_friends.containedIn("FBID", friends).descending("Group");
		return ud_friends.find({
			useMasterKey : true
		});
	}).then(function (ud_friends_results) {

		if (UD.get("Group") == undefined || UD.get("Group") == 0)
			if ((ud_friends_results.length > 0) && (ud_friends_results[0].get("Group") > 0)) {
				UD.set("Group", ud_friends_results[0].get("Group"));
			} else
				UD.set("Group", Math.floor((Math.random() * 100000000) + 100));

		return UD.save(null, {
			useMasterKey : true
		});
	}).then(function () {
		response.success("UD saved!");
	}, function (err) {
		response.error("Error: " + JSON.stringify(err));
	});
})

Parse.Cloud.define("FB_GetLinkedUser_to_delete", function (request, response) {

	var query = new Parse.Query("UserData");
	query.equalTo("FBID", request.params.FBID);
	query.limit(1).include("Player");
	query.find({
		useMasterKey : true
	}).then(function (ud_results) {

		if (ud_results.length > 0)
			response.success(ud_results[0].get("Player"));
		else
			response.error("No linked user found!");
	}, function (err) {
		response.error("Error: " + JSON.stringify(err));
	});
})

Parse.Cloud.define("FB_UnlinkOldUser", function (request, response) {

	var Player = undefined;
	var query = new Parse.Query("UserData");
	query.equalTo("FBID", request.params.FBID);
	query.limit(1).include("Player"); ;
	query.find({
		useMasterKey : true
	}).then(function (ud_results) {

		if (ud_results.length > 0) {

			Player = ud_results[0].get("Player");

			ud_results[0].unset("FBID");
			ud_results[0].unset("FBFriends");
			return ud_results[0].save(null, {
				useMasterKey : true
			});
		}

		return Parse.Promise.as("No user found");
	}).then(function () {

		if (Player != undefined) {

			Player.unset("authData");

			//return Parse.Promise.as("Cannot unlink");
			return Player.save(null, {				useMasterKey : true			});
		}

		return Parse.Promise.as("No user found");
	}).then(function () {
		response.success("OK");
	}, function (err) {
		response.error("Error: " + JSON.stringify(err));
	});

})

////////////////////////////////////////////////////////
/////////////    LEAGUE LOGIC    ///////////////////////
////////////////////////////////////////////////////////

Parse.Cloud.define("extLeagueFindForPlayer", function (request, response) {
	LeagueFindForPlayer(1, 0).then(function (League) {
		response.success("OK! League : " + League.id);
	}, function (err) {
		response.error("Failed : " + err);
	});
})

function LeagueFindForPlayer(Level, Group) {

	// Description: Finds a best league of <Level> for <Group>
	// Params:      Level (numeric), Group (numeric)

	var promise = new Parse.Promise();

	var queryL = new Parse.Query("Leagues");
	queryL.lessThan("NumPlayers", LeagueMaxPlayers).equalTo("Level", Level).descending("NumPlayers").limit(1);
	queryL.find().then(function (resultsL) {

		if (resultsL.length > 0)
			promise.resolve(resultsL[0]);
		else
			LeagueCreateEmptyForLevel(Level).then(function (resL) {
				promise.resolve(resL);
			});
	});

	return promise;
}

function LeagueCreateEmptyForLevel(Level) {

	// Description: Creates a league of <Level>
	// Params:      Level (numeric)

	var d = new Date();
	var timeNow = d.getTime();
	var timeThen = timeNow + (LegueNewTimeToStartSeconds * 1000); // 20 minutes. Time is in milliseconds
	var queryDate = new Date();
	queryDate.setTime(timeThen);

	var LeagueType = Parse.Object.extend("Leagues");
	var NewEmptyLeague = new LeagueType();
	NewEmptyLeague.set("Level", Level);
	NewEmptyLeague.set("MaxDays", 0);
	NewEmptyLeague.set("NumPlayers", 0);
	NewEmptyLeague.set("CurrentDay", 0);
	NewEmptyLeague.set("CurrentState", 0);
	NewEmptyLeague.set("Name", "League " + Math.floor((Math.random() * 100000000) + 1));
	NewEmptyLeague.set("NextDayDateTime", queryDate);
	NewEmptyLeague.set("FirstDayDateTime", queryDate);
	NewEmptyLeague.set("DayLengthInSec", LeagueDayLengthSeconds);

	return NewEmptyLeague.save();
}

function LeagueAddPlayer(UserData, League) {

	// Description: Adds a <UserData> into <League>
	// Params:      UserData, League

	var Players = League.get("Players");
	var P = {};
	P.Player = UserData.get("Player").id;
	P.PlayerType = UserData.get("PlayerType");
	P.Points = 0;
	P.Wins = 0;
	P.Loses = 0;
	P.Games = 0;
	P.UserData = UserData.id;
	P.TotalMatchDurationSeconds = 0;

	if (Players == undefined)
		Players = [];
	Players.push(P);

	UserData.set("League", League);

	League.set("Players", Players);
	League.set("NumPlayers", League.get("NumPlayers") + 1);

	return UserData.save(null, {
		useMasterKey : true
	}).then(function () {
		return League.save();
	});
}

Parse.Cloud.define("extLeaguesAssignUsers", function (request, response) {
	LeaguesAssignUsers().then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + err);
	});
})

function LeaguesAssignUsers() {

	var i = 0;
	var GroupUD = [];

	var outer_promise = new Parse.Promise();

	var QueryUserData = new Parse.Query("UserData");
	QueryUserData.equalTo("PlayerType", 1).doesNotExist("League").descending("Group").addDescending("Level").limit(LeagueMaxPlayers);

	QueryUserData.find({
		useMasterKey : true
	}).then(function (_UserData) {

		if (_UserData.length == 0)
			return Parse.Promise.as();

		var GroupLength = 0;
		if (_UserData[0].get("Group") > 0) {
			GroupUD.push(_UserData[0]);
			for (GroupLength = 1; GroupLength < _UserData.length && _UserData[GroupLength].get("Group") == _UserData[0].get("Group") && _UserData[GroupLength].get("Level") == _UserData[0].get("Level"); GroupLength++) {
				GroupUD.push(_UserData[GroupLength]);
			}
		}

		for (var i = 0; i < GroupLength; i++) {
			_UserData.shift();
		}

		var promise = Parse.Promise.as();

		if (GroupLength > 0)
			promise = LeagueAssignGroup(GroupUD);

		//////  AND NOW THE NON-GROUPED

		_UserData.forEach(function (result) {

			promise = promise.then(function () {
					var Level = 1;
					if (result.get("Level") != undefined)
						Level = result.get("Level");
					return LeagueFindForPlayer(Level, result.get("Group")).then(function (League) {
						return LeagueAddPlayer(result, League);
					});
				});
		});

		return promise;

	}).then(function () {
		outer_promise.resolve();
	}, function (err) {
		outer_promise.reject(err);
	});

	return outer_promise;
}

function LeagueAssignGroup(UserData) {

	var LG;
	var GroupLength = UserData.length;

	var QueryLeagues = new Parse.Query("Leagues");
	QueryLeagues.lessThan("NumPlayers", LeagueMaxPlayers - GroupLength + 1).descending("NumPlayers").limit(1);

	return QueryLeagues.find().then(function (_Leagues) {

		var promise = Parse.Promise.as();

		if (_Leagues.length == 0)
			promise = LeagueCreateEmptyForLevel(UserData[0].get("Level")).then(function (_LG) {
					LG = _LG;
					return Parse.Promise.as();
				});
		else
			LG = _Leagues[0];

		return promise;
	}).then(function () {
		var promise = Parse.Promise.as();

		UserData.forEach(function (UD) {
			promise = promise.then(function () {
					return LeagueAddPlayer(UD, LG);
				});
		});
		return promise;
	});

}

function LeaguesStart() {

	var today = new Date();
	today = new Date(today.getTime() + LeagueStartBeforeFirstDaySeconds * 1000);

	var queryL = new Parse.Query("Leagues");
	queryL.limit(3);
	queryL.greaterThan("NumPlayers", 0).equalTo("CurrentDay", 0).lessThanOrEqualTo("FirstDayDateTime", today).ascending("FirstDayDateTime");

	return queryL.find().then(function (resultsL) {

		var promise = Parse.Promise.as();
		resultsL.forEach(function (result) {

			promise = promise.then(function () {
					return LeagueStart(result);
				});
		});
		return promise;
	});
}

Parse.Cloud.define("extLeagueStart", function (request, response) {

	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "CPHQ4s18F8";

	LeagueStart(League).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + err);
	});
})

function LeagueStart(League) {

	return LeagueFillWithBots(League).then(function () {
		return LeagueReset(League);
	});

}

Parse.Cloud.define("extLeagueFillWithBots", function (request, response) {

	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "pvM19wNnft";

	League.fetch().then(function () {
		return LeagueFillWithBots(League);
	}).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + JSON.stringify(err));
	});
})

function LeagueFillWithBots(League) {

	var queryUsers = new Parse.Query("UserData");
	queryUsers.equalTo("PlayerType", 2).equalTo("Level", League.get("Level")).doesNotExist("League").limit(LeagueMaxPlayers - League.get("NumPlayers"));

	return queryUsers.find({
		useMasterKey : true
	}).then(function (resultsUsers) {

		var promise = Parse.Promise.as();
		resultsUsers.forEach(function (result) {

			promise = promise.then(function () {
					return LeagueAddPlayer(result, League);
				});
		});
		return promise;
	});
}

function LeagueReset(League) {

	return LeagueDeleteFixtures(League).then(function () {

		return LeagueGenerateFixtures(League);
	});
}

function LeagueDeleteFixtures(League) {

	var queryServerFixtures = new Parse.Query("Fixtures");
	queryServerFixtures.equalTo("League", League).exists("SentToPlayAt").equalTo("PlayedType", 2);
	queryServerFixtures.limit(1000);

	return queryServerFixtures.find().then(function (resultsServerFixtures) {

		if (resultsServerFixtures.length > 0) {
			for (var i = 0; i < resultsServerFixtures.length; i++)
				resultsServerFixtures[i].unset("League");

			return Parse.Object.saveAll(resultsServerFixtures);
		} else
			return Parse.Promise.as();
	}).then(function () {

		var queryFixtures = new Parse.Query("Fixtures");
		queryFixtures.equalTo("League", League);
		queryFixtures.limit(1000);

		return queryFixtures.find();

	}).then(function (resultsFixtures) {

		return Parse.Object.destroyAll(resultsFixtures);
	});
}

function LeagueGenerateFixtures(League) {

	//// BUILD USER ARRAY ////

	var Players = League.get("Players");

	var NumLeagueUsers = 0;
	NumLeagueUsers = Players.length;

	for (var i = 0; i < Players.length; i++) {
		Players[i].Points = 0;
		Players[i].Wins = 0;
		Players[i].Loses = 0;
		Players[i].Games = 0;
		Players[i].TotalMatchDurationSeconds = 0;
	}

	var arr = [];
	for (var day = 1; day <= Players.length - 1; day++) {
		for (var iUser = 0; iUser < Players.length; iUser++) {

			var Fixtures = Parse.Object.extend("Fixtures");
			var fixture = new Fixtures();

			var Player0 = new Parse.Object("_User");
			Player0.id = Players[iUser].Player;
			var Player1 = new Parse.Object("_User");
			Player1.id = Players[(iUser + day >= Players.length) ? iUser + day - Players.length : iUser + day].Player;

			fixture.set("Player0", Player0);
			fixture.set("Player1", Player1);
			fixture.set("League", League);
			fixture.set("GameDay", day);
			var today = new Date();
			var tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + day);
			fixture.set("GameDate", tomorrow);
			fixture.set("Status", 0);

			arr.push(fixture);
		}
	}

	return Parse.Object.saveAll(arr).then(function () {

		var today = new Date();

		League.set("Players", Players);
		League.set("CurrentDay", 1);
		var timeObject = League.get("FirstDayDateTime");
		timeObject = new Date(timeObject.getTime() + 1000 * 1 * League.get("DayLengthInSec"));
		League.set("NextDayDateTime", timeObject)
		League.set("CurrentState", 1);
		League.set("MaxDays", NumLeagueUsers - 1);

		return League.save();
	});
}

function LeaguesPrepareNextDay() {

	var d = new Date();
	var timeNow = d.getTime();
	var timeThen = timeNow + (LeagueTimeForServerPlaySeconds * 1000); // XXX minutes. Time is in milliseconds
	var queryDate = new Date();
	queryDate.setTime(timeThen);

	var queryL = new Parse.Query("Leagues");
	queryL.limit(3);
	queryL.greaterThan("NumPlayers", 0).greaterThan("CurrentDay", 0).lessThan("NextDayDateTime", queryDate).equalTo("CurrentState", 1);

	return queryL.find().then(function (resultsL) {

		var promise = Parse.Promise.as();
		resultsL.forEach(function (result) {

			promise = promise.then(function () {
					return LeaguePrepareNextDay(result);
				});
		});
		return promise;
	});
}

function LeaguePrepareNextDay(League) {

	var queryFixtures = new Parse.Query("Fixtures");
	queryFixtures.equalTo("League", League);
	queryFixtures.equalTo("GameDay", League.get("CurrentDay"));
	queryFixtures.equalTo("Status", 0);
	queryFixtures.select("objectId", "GameDate", "Player0", "Player1", "GameDay", "Status", "Score0", "Score1", "GameFile", "MatchDurationSeconds", "PlayedType");
	queryFixtures.limit(1000);

	return queryFixtures.find().then(function (resultsFixtures) {

		for (var i = 0; i < resultsFixtures.length; i++) {
			resultsFixtures[i].set("Status", 2);
		}

		return Parse.Object.saveAll(resultsFixtures);
	}).then(function (resultsFixtures) {

		League.set("CurrentState", 2);
		return League.save();
	});
}

function LeaguesNextDay() {console.log('-----in LeaguesNextDay');

	var today = new Date();

	var queryL = new Parse.Query("Leagues");
	queryL.limit(10);
	queryL.greaterThan("NumPlayers", 0).greaterThan("CurrentDay", 0).containedIn("CurrentState", [1, 2]).lessThanOrEqualTo("NextDayDateTime", today).ascending("NextDayDateTime");

	return queryL.find().then(function (resultsL) {

		var promise = Parse.Promise.as();
		resultsL.forEach(function (result) {

			if (result.get("CurrentDay") < result.get("MaxDays"))
				promise = promise.then(function () {
						return LeagueNextDay(result);
					});
			else
				promise = promise.then(function () {
						return LeagueNextDay(result).then(function () {
							return LeagueEnd(result);
						});
					});
		});
		return promise;
	});
}

Parse.Cloud.define("extLeagueNextDay", function (request, response) {

	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "uAmkPtkyKy";

	League.fetch().then(function () {
		return LeagueNextDay(League);
	}).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + JSON.stringify(err));
	});
})

function LeagueNextDay(League) {

	return LeagueAutoPlay(League).then(function () {

		var CurrentDay = League.get("CurrentDay") + 1;
		League.set("CurrentDay", CurrentDay);
		var timeObject = League.get("FirstDayDateTime");
		timeObject = new Date(timeObject.getTime() + 1000 * CurrentDay * League.get("DayLengthInSec"));
		League.set("NextDayDateTime", timeObject)
		League.set("CurrentState", 1);

		return League.save();
	});
}

Parse.Cloud.define("extLeagueAutoPlay", function (request, response) {

	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "uAmkPtkyKy";

	League.fetch().then(function () {
		return LeagueAutoPlay(League);
	}).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + JSON.stringify(err));
	});
})

function LeagueAutoPlay(League) {

	var queryFixtures = new Parse.Query("Fixtures");
	queryFixtures.equalTo("League", League);
	queryFixtures.equalTo("GameDay", League.get("CurrentDay"));
	queryFixtures.notEqualTo("Status", 1);
	queryFixtures.select("objectId", "GameDate", "Player0", "Player1", "GameDay", "Status", "Score0", "Score1", "GameFile", "MatchDurationSeconds", "PlayedType");
	queryFixtures.limit(90);

	return queryFixtures.find().then(function (resultsFixtures) {

		var Players = League.get("Players");

		for (var i = 0; i < resultsFixtures.length; i++) {
			if (resultsFixtures[i].get("Status") != 1) {
				var Score0_random = Math.floor((Math.random() * 10) + 1);
				var Score1_random = (13 - Score0_random);
				var MatchTime_random = Math.floor((Math.random() * 200) + 40);

				Score0_random = 7;
				Score1_random = 5;

				resultsFixtures[i].set("Status", 1);
				resultsFixtures[i].set("PlayedType", 2);
				resultsFixtures[i].set("Score0", Score0_random);
				resultsFixtures[i].set("Score1", Score1_random);
				resultsFixtures[i].set("MatchDurationSeconds", MatchTime_random);

				for (var j = 0; j < Players.length; j++) {
					if (Players[j].Player == resultsFixtures[i].get("Player0").id) {
						Players[j].Points = Players[j].Points + Score0_random;
						Players[j].Wins = (Score0_random > Score1_random) ? Players[j].Wins + 1 : Players[j].Wins;
						Players[j].Loses = (Score0_random < Score1_random) ? Players[j].Loses + 1 : Players[j].Loses;
						Players[j].Games = Players[j].Games + 1;
						Players[j].TotalMatchDurationSeconds = Players[j].TotalMatchDurationSeconds + MatchTime_random;
					}
					if (Players[j].Player == resultsFixtures[i].get("Player1").id) {
						Players[j].Points = Players[j].Points + Score1_random;
						Players[j].Wins = (Score1_random > Score0_random) ? Players[j].Wins + 1 : Players[j].Wins;
						Players[j].Loses = (Score1_random < Score0_random) ? Players[j].Loses + 1 : Players[j].Loses;
						Players[j].Games = Players[j].Games + 1;
						Players[j].TotalMatchDurationSeconds = Players[j].TotalMatchDurationSeconds + MatchTime_random;
					}
				}

			}
		}

		League.set("Players", Players);

		return Parse.Object.saveAll(resultsFixtures).then(function () {

			return League.save();
		});
	});
}

function LeaguePromotePlayers(League) {
	Parse.Promise.as("Cut!");

	var NumToPromote = 0;

	var Players = League.get("Players");
	Players.sort(function (a, b) {
		return (a.PlayerType == b.PlayerType) ? ((a.Wins == b.Wins) ? ((a.Points == b.Points) ? (a.TotalMatchDurationSeconds - b.TotalMatchDurationSeconds) :  - (a.Points - b.Points)) :  - (a.Wins - b.Wins)) : (a.PlayerType - b.PlayerType);
	});

	var arr = [];
	for (NumToPromote = 0; (NumToPromote < Math.min(LeaguePromotePlayersNum, Players.length)) && (Players[NumToPromote].PlayerType == 1); NumToPromote++) {
		var _u = new Parse.Object("_User");
		_u.id = Players[NumToPromote].Player;
		arr.push(_u);
	}

	var queryUsers = new Parse.Query("UserData");
	queryUsers.select("Level", "Player").containedIn("Player", arr);

	return queryUsers.find({
		useMasterKey : true
	}).then(function (resultsUsers) {
		var nUsers = resultsUsers.length;

		for (var i = 0; i < nUsers; i++) {
			resultsUsers[i].set("Level", resultsUsers[i].get("Level") + 1);
			resultsUsers[i].unset("League");
			resultsUsers[i].set("LastLeague", League);
		};

		return Parse.Object.saveAll(resultsUsers, {
			useMasterKey : true
		}).then(function () {
			for (var i = 0; i < NumToPromote; i++)
				Players.shift();
			League.set("Players", Players);
			League.set("NumPlayers", League.get("NumPlayers") - nUsers);
			return League.save();
		});
	});
}

Parse.Cloud.define("extLeagueEnd", function (request, response) {
	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "uAmkPtkyKy";

	League.fetch().then(function () {
		return LeagueEnd(League);
	}).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + JSON.stringify(err));
	});
})

function LeagueEnd(League) {

	var nextBeginTime = new Date(League.get("FirstDayDateTime").getTime() + League.get("MaxDays") * League.get("DayLengthInSec") * 1000 + (LeagueTimePreseasonSeconds * 1000));

	League.set("CurrentState", 0);
	League.set("CurrentDay", 0);
	League.set("NextDayDateTime", nextBeginTime);
	League.set("FirstDayDateTime", nextBeginTime);
	League.set("DayLengthInSec", LeagueDayLengthSeconds);

	return LeagueSaveSnapshot(League).then(function () {

		return LeaguePromotePlayers(League).then(function () {

			return League.save().then(function () {
				return LeagueAfterCleanup(League);
			});
		});
	});
}

Parse.Cloud.define("extLeagueSaveSnapshot", function (request, response) {
	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "9RNw8ZFRZr";

	League.fetch().then(function () {

		LeagueSaveSnapshot(League).then(function () {
			response.success("OK!");
		}, function (err) {
			response.error("Failed : " + err);
		});
	});
})

function LeagueSaveSnapshot(League) {

	return GetLeagueSnapshot(League).then(function (str) {

		League.set("LastSnapshot", str);
		return League.save().then(function () {

			var LastLeagueResultsType = Parse.Object.extend("LastLeagueResults");
			var LastLeagueResult = new LastLeagueResultsType();

			LastLeagueResult.set("League", League);
			LastLeagueResult.set("LastSnapshot", str);
			LastLeagueResult.set("FirstDayDateTime", League.get("FirstDayDateTime"));

			return LastLeagueResult.save();
		});
	});
}

Parse.Cloud.define("extLeaguePromotePlayers", function (request, response) {
	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "VRRNtjTyI9";

	League.fetch().then(function () {
		return LeaguePromotePlayers(League);
	}).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Error: " + JSON.stringify(err));
	});
})

Parse.Cloud.define("LeagueDeletePlayer", function (request, response) {})

function LeagueAfterCleanup(League) {

	return LeagueDeleteFixtures(League).then(function () {

		return LeagueDeleteBots(League);

	});
}

Parse.Cloud.define("extLeagueDeleteBots", function (request, response) {
	var LeagueType = Parse.Object.extend("Leagues");
	var League = new LeagueType();
	League.id = "zl1XCGQY6P";

	League.fetch().then(function () {
		return LeagueDeleteBots(League);
	}).then(function () {
		response.success("OK!");
	}, function (err) {
		response.error("Failed : " + err);
	});
})

function LeagueDeleteBots(League) {

	var nUsers = 0;

	var queryUsers = new Parse.Query("UserData");
	queryUsers.select("League", "Player").equalTo("League", League).equalTo("PlayerType", 2);

	return queryUsers.find({
		useMasterKey : true
	}).then(function (resultsUsers) {
		nUsers = resultsUsers.length;
		for (var i = 0; i < nUsers; i++) {
			resultsUsers[i].unset("League");
		};
		return Parse.Object.saveAll(resultsUsers, {
			useMasterKey : true
		}).then(function () {

			var Players = League.get("Players");
			Players.sort(function (a, b) {
				return  - (a.PlayerType - b.PlayerType);
			});
			for (; Players.length > 0 && Players[0].PlayerType == 2; Players.shift());

			League.set("Players", Players);
			League.set("NumPlayers", Players.length);
			return League.save();
		});
	});

}

function GenUsers_SetName(user, user_name, user_group) {
	var query = new Parse.Query("UserData");
	query.equalTo("Player", user);
	query.limit(1);

	return query.find({
		useMasterKey : true
	}).then(function (results) {
		if (results.length == 0) { //alert("No UserData");
			return Parse.Promise.as("No UserData");
		}
		return results[0].save({
			"Name" : user_name,
			"Group" : user_group
		}, {
			useMasterKey : true
		});
	});

}

function GenUsers(params) {

	var promise = Parse.Promise.as();

	var d = new Date();
	var ii = 0;
	for (var i = 0; i < params.Users.length; i++) {

		promise = promise.then(function () {

				var user = new Parse.User();
				alert("GenUser: " + params.Users[ii].login);

				user.set("username", params.Users[ii].login + "_" + Math.floor((Math.random() * 100000000) + 1));
				user.set("password", params.Users[ii].password);
				ii++;
				return user.signUp({
					useMasterKey : true
				}).then(function () {
					return GenUsers_SetName(user, params.Users[ii - 1].name, params.Users[ii - 1].group)
				});
			});
	}

	return promise;
}

Parse.Cloud.define("test_del_users", function (request, response) {

	var query = new Parse.Query("UserData");
	query.limit(10);
	query.find({
		useMasterKey : true
	}).then(function (results) {
		// Create a trivial resolved promise as a base case.
		var promise = Parse.Promise.as();
		results.forEach(function (result) {
			// For each item, extend the promise with a function to delete it.
			promise = promise.then(function () {
					// Return a promise that will be resolved when the delete is finished.
					//result.set("Name","qwe");
					return result.destroy({
						useMasterKey : true
					});
				});
		});
		return promise;

	}).then(function () {
		// Every comment was deleted.
		response.success("Hurra!");
	}, function (error) {
		// Every comment was deleted.
		response.success("nicht Hurra! -> " + error.message);
	});

})

////////////////////////////////////////////////////////
/////////////    JOB FUNCTIONS    //////////////////////
////////////////////////////////////////////////////////


Parse.Cloud.define("JobFun_LeaguesStart", function (request, response) {

	LeaguesStart().then(function () {
		response.success("Ok!");
	},
		function (err) {
		response.error("Error: " + JSON.stringify(err));
	});

});

Parse.Cloud.define("JobFun_LeaguesNextDay", function (request, response) {

	LeaguesNextDay().then(function () {
		response.success("Ok!");
	},
		function (err) {
		response.error("Error: " + JSON.stringify(err));
	});

});

Parse.Cloud.define("JobFun_LeaguesPrepareNextDay", function (request, response) {

	LeaguesPrepareNextDay().then(function () {
		response.success("Ok!");
	},
		function (err) {
		response.error("Error: " + JSON.stringify(err));
	});

});

Parse.Cloud.define("JobFun_LeaguesAssignUsers", function (request, response) {

	LeaguesAssignUsers().then(function () {
		return LeaguesAssignUsers();
	}).then(function () {
		return LeaguesAssignUsers();
	}).then(function () {
		return LeaguesAssignUsers();
	}).then(function () {
		response.success("Ok!");
	},
		function (err) {
		response.error("Error: " + JSON.stringify(err));
	});
});
