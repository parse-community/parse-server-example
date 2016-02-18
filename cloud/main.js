/*
 * Cloud code for a Grassland Curing NEMP project for TRAINING DB on Local ParseServer
 */

var _ = require('underscore');
var SUPERUSER = "superuser";
var SUPERPASSWORD = "Passw0rd";
var NULL_VAL_INT = -1;
var NULL_VAL_DBL = -1.0;

var APP_ID = "wOwmLnQXfeATtJitXVPo96PEisJzzGbAQNI5LUun";
var MASTER_KEY = "GwJZOgsNquiSXIWkt0r6b79AuFRQQCzKwWxHaEBA";
	
var MG_DOMAIN = 'sandbox72753f1629ce4624804952fa8953d193.mailgun.org';
var MG_KEY = 'key-ef9829f1ee460b7753bd7e8589aa7964';
var CFA_NEMP_EMAIL = 'grasslandcuring-nemp@cfa.vic.gov.au';
var CFA_GL_TEAM_EMAIL = 'grassland-team@cfa.vic.gov.au';
var CFA_GL_EMAIL = 'grassland@cfa.vic.gov.au';
var _IS_DAYLIGHT_SAVING = true;		// boolean indicates if it is now in Daylight Saving time
var JOB_START_TIME = '09:55 PM';	// GMT in Daylight Saving, "10:45 PM" not in Daylight Saving
var JOB_END_TIME = '10:55 PM';		// GMT in Daylight Saving, "11:15 PM" not in Daylight Saving

Parse.Cloud.define('hello', function(req, res) {
  console.log("hello function was called.");
  res.success('Hi from Local ParseServer.');
});

Parse.Cloud.define("getDateInAEST", function(request, response) {
	var currentDateInAEST = getTodayString(_IS_DAYLIGHT_SAVING);
	response.success("Current Date in AEST: '" + currentDateInAEST + "'");
});

/*
 *
 */
/**
	 * Returns the last day of the a year and a month
	 * e.g. getLastDayOfMonth(2009, 9) returns 30;
	 */
	function getLastDayOfMonth(Year, Month) {
		var newD = new Date( (new Date(Year, Month,1))-1 );
	    return newD.getDate();
	}

	/**
	 * Returns a description of the current date in AEST
	 * Parameters:
	 * - isDLS: boolean; indicates if it is currently Daylight Saving Time.
	 */
	function getTodayString(isDLS) {
		var today = new Date();	// ALWAYS IN UTC TIME
		// NOTE: this is to initialize a JS date object in the timezone of the computer/server the function is called.
		// So this is UTC time. There are 10 (11) hrs difference between UTC time and Australian Eastern Standard Time (Daylight Saving Time).
		
		var dd = today.getDate();
		var mm = today.getMonth() + 1;	//January is 0!
		var yyyy = today.getFullYear();
		var hr = today.getHours();	// from 0 - 23!
		
		var lastDayOfTheMonth = getLastDayOfMonth(yyyy, mm);
		
		// is DayLight Saving enabled
		if (isDLS) {
			if (hr>=13)	// "13" hr in UTC is equivalent to "00" hr in AEST the next day!
				dd = dd + 1;
		} else {
			if (hr>=14)	// "14" hr in UTC is equivalent to "00" hr in AEST the next day!
				dd = dd + 1;
		}
		
		// fix the cross-month issue
		if (dd > lastDayOfTheMonth) {
			dd = 1;	// first day of next month
			mm = mm + 1;	// next month
		}
		
		// fix the cross-year issue
		if (mm > 12) {
			mm = 1;
			yyyy = yyyy + 1;
		}
		
		if(dd<10)
			dd = '0' + dd

		if(mm<10)
			mm = '0' + mm

		var strToday = dd + '/' + mm + '/' + yyyy;
		
		return strToday;
	}