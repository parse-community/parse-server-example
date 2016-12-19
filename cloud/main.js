/***********************************************************************
* FILENAME :
*       main.js
*
* DESCRIPTION :
*       Main file containing jobs used in appNbite project. 
*
* APPNBITE APIs:
*
*		cloud function			getDeals
*
*       cloud function			checkIfDealIsInWallet
*	
*       cloud function			addDealToWallet
*
*       cloud function			removeDealFromWallet
*
*       cloud function			getDealById  
*     
*       cloud function			acquireDeal
*
*       cloud  function		getMyWallet
*
*       function					prepareDealForOutput
*       
*       function					formatError
*
*       function					sortByKey
*
*       function					getObjectByValue
*
* NOTES :
*       These functions are a part of the appNbite suite;
*
*       Copyright appNbite 2015.  All rights reserved.
* 
* AUTHOR :
*       Americo Mazzotta        
*
* START DATE :
        24 May 2015
*
* CHANGES :
*
*       VERSION		DATE			WHO		DETAIL
*       0.0.1				24May15		AM			First version of the API script
*       1.0.0				05Jul15		AM			Major release. Implemented new algorithm for deals seach introducing new parse.com funcionalities
*       1.1.0				16aug15		AM			Major release. Added checkIfDealIsInWallet and changed the logic to add / remove deal from wallet
*       1.2.0				29set15		AM			Major release. Added gallery and isFavourite
*       1.3.0				23Nov15		AM			Major release. Implemented Scanning Functions
*
************************************************************************/
 
	// Global variables
	var REQUEST_TYPE_SEE = 1;
	var REQUEST_TYPE_ADD = 2;
	 
	var CODE_SUCCESS = 200;
	var CODE_OBJECT_NOT_FOUND = 300;
	var CODE_OBJECT_EXISTS = 350;
	var CODE_FAILURE = 400;
	 
	var MESSAGGE_SUCCESS = "Success";
	var MESSAGGE_OBJECT_NOT_FOUND = "Object not found";
	var MESSAGGE_OBJECT_EXISTS = "Object already exists";
	
	/***********************************************************************
    * FUNCTIONS :   hello
    * DESCRIPTION : REST API public function  to validate if Parse cloud code is working
    * INPUT :
    *           {}
    * OUTPUTS : string
    ************************************************************************/ 
	
	Parse.Cloud.define('hello', function(req, res) {
	  res.success('Parse server up and running on Heroku platform');
	});
 
  /***********************************************************************
    * FUNCTIONS :   getDeals
    * DESCRIPTION : REST API public function  
    * INPUT :
    *           {
    *           "range": 2, // Distance in miles
    *           "position": {"latitude": 51.50733, "longitude":-0.12307}, // Lat-Lon object
    *           "categories": [1], // Array of categories (array of int)
    *           "orderBy": 1 // Ordering the results 0 = by distance / else by expiring time
    *           }
    * OUTPUTS : array of formatted deals
    ************************************************************************/  
     
    Parse.Cloud.define("getDeals", function(request, response) {
 
		console.log("function getDeals");
	
		// Retrieve input parameters
		var userPosition = new Parse.GeoPoint(request.params.position.latitude, request.params.position.longitude);
		var inputCategories = request.params.categories;
		var range = request.params.range;
		var orderBy = request.params.orderBy;
		var deviceId =  request.params.deviceId;
		
		console.log(request);
		
		// Retrieve current date and time
		var d = new Date();
		
		

        var todaysDatePlus12 = new Date(d.getTime());
		var todaysDate = new Date(d.getTime());
		
		todaysDatePlus12.setHours(todaysDate.getHours()+12);
		
		// Define variable for storing output deals
        var formattedDealsForOutput = [];
		
		// Define Deal query
        var deal = Parse.Object.extend("Deal");
        var queryDeal = new Parse.Query(deal);
          
		// Set variables to store relations
		var catRelation;
		var storeRelation;
		// Variable used to store categories the deals belogs to
		var resultCategories;
		// Variable used to check if deal is in Wallet
		var isFavourite;
		
		// Filter per and order by start date
		queryDeal.lessThanOrEqualTo("startingAt", todaysDatePlus12);
		// Filter per and order by expiry date
		queryDeal.greaterThanOrEqualTo("expiringAt", todaysDate);
		
		// Filter per quantity
		queryDeal.greaterThan("quantity", 0);
		
		// Filter per input categories array
		var category = Parse.Object.extend("Category"); 
		var queryCategories = new Parse.Query(category);
		
		if(inputCategories.length==0){
			console.log('An empty category array has been passed as a parameter');
        }  else {
			queryCategories.containedIn("code", inputCategories);
			queryDeal.matchesQuery("belongsTo", queryCategories);
		}
		
		// Add a proximity based constraint for finding objects with key point values near the point given and within the maximum distance given
		var store = Parse.Object.extend("Store"); 
		var queryStore = new Parse.Query(store);
		queryStore.withinMiles("position", userPosition, range);
		queryDeal.matchesQuery("runningAt", queryStore);
		
		 // Define promise
		var promise = Parse.Promise.as();

        queryDeal.each(
            function(foundDeal){
               
                promise = promise.then(function() {
						// Finding all retaltions in deal
                        catRelation = foundDeal.relation("belongsTo");
						storeRelation = foundDeal.relation("runningAt");
						var wallet = Parse.Object.extend("Wallet");
						var queryWallet = new Parse.Query(wallet);
						queryWallet.equalTo("dealId", foundDeal.id);
						queryWallet.equalTo("deviceId", deviceId);
						return queryWallet.find();
						//return checkIfDealIsInWallet(foundDeal.id, deviceId);
					}).then( function(isInWallet){
						isFavourite = isInWallet.length > 0;
                        return catRelation.query().find();
                    }).then( function(resCat){
							resultCategories = resCat;
							return storeRelation.query().find();
                    }).then(function(resStores){
							var storePosition = resStores[0].get('position');
							var placeDistance = userPosition.milesTo(storePosition);
							var dealForOutput = prepareDealForOutput(foundDeal, resStores[0],resultCategories, placeDistance, isFavourite);
							formattedDealsForOutput.push(dealForOutput);
							return resStores;
                    });
					
					return promise;
               
            }
         
        ).then(
         
			function(success) {
				// Order results according to defined orderBy parameter
				if(orderBy==1){
				//Ordering response array by 'distance'
				response.success(sortByKey(formattedDealsForOutput, 'distance'));
				} else {
					//Returning response ordered by 'currentPrice'
					response.success(sortByKey(formattedDealsForOutput, 'expiringAt'));
				}
			}, function(error) {
				// Set the function's error response
				response.error(error);
			}
         
        );  

    });
 
 
     /***********************************************************************
    * FUNCTIONS : checkIfDealIsInWallet
    * DESCRIPTION : Functions used to verify if a deal exists in the wallet
    * INPUT :
	*			{
	*			"dealId": "asrye43242", 
	*			"deviceId": "123hkh3kj21hk3",
	*			}
    * OUTPUTS : boolean true / false
    ************************************************************************/ 
	Parse.Cloud.define("checkIfDealIsInWallet", function(request, response) {

		console.log("function checkIfDealIsInWallet");
	 
		var dealExists;
		
		var dealId = request.params.dealId;
		var deviceId = request.params.deviceId;
		 
		var wallet = Parse.Object.extend("Wallet");
		var queryWallet = new Parse.Query(wallet);
		queryWallet.equalTo("dealId", dealId);
		queryWallet.equalTo("deviceId", deviceId);
	 
		queryWallet.find({
			success: function(foundDeal){
			
				if(foundDeal.length > 0)
				{
					dealExists = true;
					 
				} else {
					dealExists = false;
				}
			}
			 
		}).then(function() {
			// Set the function success response
			var result = {
				result: dealExists
			};
				
			response.success(result);
			
		}, function(error) {
			// Set the function's error response
			response.error(CODE_FAILURE);
		}); 
		 
	});
 
    /***********************************************************************
    * FUNCTIONS : addDealToWallet
    * DESCRIPTION : Functions used to add a deal to the wallet
    * INPUT :
	*			{
	*			"dealId": "asrye43242", 
	*			"deviceId": "123hkh3kj21hk3",
	*			}
    * OUTPUTS : array of formatted deals
    ************************************************************************/ 
	Parse.Cloud.define("addDealToWallet", function(request, response) {

		console.log("function addDealToWallet");
	 
		var resultCode;
		
		var dealId = range = request.params.dealId;
		var deviceId = range = request.params.deviceId;
		 
		var wallet = Parse.Object.extend("Wallet");
		var queryWallet = new Parse.Query(wallet);
		queryWallet.equalTo("dealId", dealId);
		queryWallet.equalTo("deviceId", deviceId);
	 
		queryWallet.find({
			success: function(foundDeal){
				if(foundDeal.length == 0)
				{
					console.log("Adding new deal to wallet");
					var NewWallet = Parse.Object.extend("Wallet");
					var newWallet = new NewWallet();
				 
					newWallet.set("dealId", dealId);
					newWallet.set("deviceId", deviceId);
					
					resultCode = CODE_SUCCESS;
					 
					return newWallet.save();
				}
			}
			 
		}).then(function() {
			// Set the function success response
				response.success(formatError(resultCode));
			
		}, function(error) {
			// Set the function's error response
			response.error(CODE_FAILURE);
		}); 
		 
	});
 
    /***********************************************************************
    * FUNCTIONS : removeDealFromWallet
    * DESCRIPTION : Functions used to remove a saved deal from the wallet
    * INPUT :
	*			{
	*			"dealId": "asrye43242", 
	*			"deviceId": "123hkh3kj21hk3",
	*			}
    * OUTPUTS : array of formatted deals
    ************************************************************************/ 
	Parse.Cloud.define("removeDealFromWallet", function(request, response) {

		console.log("function removeDealFromWallet");
	 
		var resultCode;
		 
		var dealId = range = request.params.dealId;
		var deviceId = range = request.params.deviceId;
		 
		var wallet = Parse.Object.extend("Wallet");
		var queryWallet = new Parse.Query(wallet);
		queryWallet.equalTo("dealId", dealId);
		queryWallet.equalTo("deviceId", deviceId);
		 
		queryWallet.find({
			success: function(foundDeal){
				if(foundDeal.length > 0)
				{
					var object = foundDeal[0];
					console.log("function removeDeal");
					console.log(object);
					object.destroy({});
					resultCode = CODE_SUCCESS; 
				} else {
					resultCode = CODE_OBJECT_NOT_FOUND;
				}
				return true;
			}
				 
		}).then(function() {
			// Set the function success response
			response.success(formatError(resultCode));
		}, function(error) {
			// Set the function's error response
			response.error(CODE_FAILURE);
		}); 
		 
	});
 
	/***********************************************************************
    * FUNCTIONS : getDealById
    * DESCRIPTION : Functions used get a deal from a barcode
    * INPUT :
	*			{
	*			"dealId": "112344"
	*			}
    * OUTPUTS : deal object or error message
    ************************************************************************/ 
	Parse.Cloud.define("getDealById", function(request, response) {

		console.log("function getDealById");
	 
		var resultCode;
		var dealId = request.params.dealId; 
		var foundObject = [];
		 
		var deal = Parse.Object.extend("Deal");
		var queryDeal = new Parse.Query(deal);
		queryDeal.equalTo("objectId", dealId);
	 
		queryDeal.find({
			success: function(foundDeal){
				if(foundDeal.length > 0)
				{
				
					var object = foundDeal[0];
					var listOfPictures = object.get('pictureURL');
					var pictureArray = listOfPictures.split(";");
					
					var deal = {
						objectId: object.id,
						title: object.get('title'),
						description: object.get('description'),
						currentPrice: object.get('currentPrice'),
						originalPrice: object.get('originalPrice'),
						shortDesc: object.get('shortDesc'),
						quantity: object.get('quantity'),
						startingAt: object.get('startingAt'),
						expiringAt: object.get('expiringAt'),
						barcode: object.get('barcode'),
						isPercentage: object.get('isPercentage'),
						percentage: object.get('percentage'),
						media: {
							pictures: pictureArray,
							mainImageIndex: object.get('mainImageIndex')
						}
					};
					
					foundObject.push(deal);
				} 
				return true;
			}
			 
		}).then(function() {
			// Set the function success response
			response.success(foundObject);
		}, function(error) {
			// Set the function's error response
			response.error(CODE_FAILURE);
		});   
	});
 
 
    /***********************************************************************
    * FUNCTIONS : acquireDeal
    * DESCRIPTION : Functions used scan a deal barcode and reduce the quantity
    * INPUT :
	*			{
	*			"dealId": "112344",
	*			"deviceId": "XXXX-XXXX-XXX-XXXXX"
	*			"quantity": 1
	*			}
    * OUTPUTS : array of code (Success or Failure)
    ************************************************************************/ 
	Parse.Cloud.define("acquireDeal", function(request, response) {

		console.log("function acquireDeal");
	 
		var resultCode = false;
		var dealId = request.params.dealId;
		var deviceId = request.params.deviceId;
		var quantity = request.params.quantity;
		 
		var deal = Parse.Object.extend("Deal");
		var queryDeal = new Parse.Query(deal);
		queryDeal.equalTo("objectId", dealId);
		
		
		var scanLog = Parse.Object.extend("ScanLog");
		var queryScanLog = new Parse.Query(scanLog);
		queryScanLog.equalTo("deviceId", deviceId);
		queryScanLog.equalTo("dealId", dealId);
		
		var isScanned = false;
		var error;
		var scanTime;
		
		queryScanLog.find().then(function(scans) {
				//console.log("queryScanLog " + scans);
				//var scannedDeal = scans[0];
				//console.log("scannedDeal " + scannedDeal);
				//console.log("queryScanLog " + scannedDeal.createdAt);
			  if(scans.length > 0) {
				isScanned = true;
				scanTime = scans[0].createdAt;
				console.log("scanTime " + scanTime);
			  } else {
				isScanned = false;
			  }
			  return isScanned;
			}).then(function(afterScan) {
				if(afterScan) {
					return afterScan;
				} else {
					return queryDeal.find();
				}
			}).then(function(dealFound) {
			
			
				if(typeof(dealFound)=="boolean") {
					/*
					error = {
						code: 500,
						message: "deal already scanned"
					}; */
					var dt = new Date(scanTime);
					response.error("Deal already scanned on " + dt.getDay() + "-" + dt.getMonth() + "-" + dt.getFullYear() + " at " +dt.getHours() + ":" + dt.getMinutes());
				} else if(dealFound.length > 0) {
				
					var object = dealFound[0];
					 
					var dealQuantity = object.get("quantity");
					
					if(quantity > dealQuantity){
						/*
						error = {
							code: 501,
							message: "required quantity excessive"
						};*/
						response.error("Required quantity excessive");
					} else if(dealQuantity > 0 ) {
					
						var newQuantity = dealQuantity - quantity;
						object.set("quantity", newQuantity);
						object.save();  
						resultCode = true;
						
						
						console.log("Adding new device id to ScanLog");
						var NewScanLog = Parse.Object.extend("ScanLog");
						var newScanLog = new NewScanLog();
					 
						newScanLog.set("dealId", dealId);
						newScanLog.set("deviceId", deviceId);						 
						newScanLog.save();
						
						var returnValue = {
							objectId: dealId,
							quantity: newQuantity
						};
						
						response.success(returnValue);
					} 
					 
				} else {
					/*
					error = {
							code: 502,
							message: "deal not found"
						}; */
					response.error("Deal not found");
				}
			
		}, function(error) {
			// Set the function's error response
			response.error(CODE_FAILURE);
		});
	});
 
    /***********************************************************************
    * FUNCTIONS : getMyWallet
    * DESCRIPTION : Functions used to retrieve all deals saved in wallet
    * INPUT :
	*			{
	*			"position": {"latitude": 51.513, "longitude":0.08799999999999999}, 
	*			"deviceId" : "123hkh3kj21hk2"
	*			}
    * OUTPUTS : array of formatted deals
    ************************************************************************/ 
	Parse.Cloud.define("getMyWallet", function(request, response) {
 
		console.log("function getMyWallet");
		
		var userPosition = new Parse.GeoPoint(request.params.position.latitude, request.params.position.longitude);
		var deviceId = request.params.deviceId;
		
        var formattedDealsForOutput = [];
        
				
        var deal = Parse.Object.extend("Deal");
        var queryDeal = new Parse.Query(deal);
        var wallet = Parse.Object.extend("Wallet");
        var innerQuery = new Parse.Query(wallet);
		innerQuery.equalTo("deviceId", deviceId);
		 
		var promise = Parse.Promise.as();
		 
		var catRelation;
		var storeRelation;
		var resultCategories;
		  
        queryDeal.matchesKeyInQuery("objectId", "dealId", innerQuery); 
		//queryDeal.equalTo("deviceId", deviceId);
        queryDeal.each(
            function(foundDeal){
               
                promise = promise.then(function() {
						// Return a promise that will be resolved when the delete is finished.
                        catRelation = foundDeal.relation("belongsTo");
						storeRelation = foundDeal.relation("runningAt");
						
                        return catRelation.query().find();
                    }).then( function(resCat){
							resultCategories = resCat;
							return storeRelation.query().find();
                    }).then(function(resStores){
                            
							var storePosition = resStores[0].get('position');
							var placeDistance = userPosition.milesTo(storePosition);
							
							var dealForOutput = prepareDealForOutput(foundDeal, resStores[0],resultCategories, placeDistance, true);
							formattedDealsForOutput.push(dealForOutput);
							
							return resStores;
                    });
					
					return promise;
               
            }
         
        ).then(
         
        function() {
            // Set the function success response
            response.success(formattedDealsForOutput);
        }, function(error) {
            // Set the function's error response
            response.error(CODE_FAILURE);
        }
         
         
        );  
	});

    /***********************************************************************
    * FUNCTIONS : prepareDealForOutput
    * DESCRIPTION : Functions used to generate a Deal object formatted for output. 
    * INPUT :
    *       object      array
    *       store       array
    *       categories  array
    *       distance    double
    * OUTPUTS :
    *       deal        array
    ************************************************************************/   
	function prepareDealForOutput(object, store, categories, distance, isFavourite) {
		// Create a new Deal object formatted for output
		
		
		var listOfPictures = object.get('pictureURL');
		var pictureArray = listOfPictures.split(";");
		 
		var deal = {
			objectId: object.id,
			title: object.get('title'),
			description: object.get('description'),
			currentPrice: object.get('currentPrice'),
			originalPrice: object.get('originalPrice'),
			shortDesc: object.get('shortDesc'),
			quantity: object.get('quantity'),
			startingAt: object.get('startingAt'),
			expiringAt: object.get('expiringAt'),
			barcode: object.get('barcode'),
			isPercentage: object.get('isPercentage'),
			percentage: object.get('percentage'),
			distance: distance,
			store: {
				objectId: store.id,
				code: store.get('code'),
				name: store.get('name'),
				position: store.get('position'),
				addressLine1: store.get('addressLine1'),
				addressLine2: store.get('addressLine2'),
				postcode: store.get('postcode'),
				city: store.get('city'),
				county: store.get('county'),
				country: store.get('country'),
				logoURL: store.get('logoURL')
			}, 
			categories: categories,
			media: {
				pictures: pictureArray,
				mainImageIndex: object.get('mainImageIndex')
			},
			isFavourite: isFavourite
		};
		return deal;
	}

	/***********************************************************************
    * FUNCTIONS : formatError
    * DESCRIPTION : Functions used to generate custom error messages. 
    * INPUT :
    *       errorCode      integer
    * OUTPUTS :
    *       error        dictionary
    ************************************************************************/   
	function formatError(errorCode) {

		var errorMessage;
		switch(errorCode) {
			case 200:
				errorMessage = MESSAGGE_SUCCESS;
				break;
			case 300:
				errorMessage = MESSAGGE_OBJECT_NOT_FOUND;
				break;
			case 350:
				errorMessage = MESSAGGE_OBJECT_EXISTS;
				break;
			default:
				errorMessage = "";
		}
		

		var error = {
			code: errorCode,
			message: errorMessage
		};
		
		return error;
	}

    /***********************************************************************
    * FUNCTIONS : sortByKey / getObjectByValue
    * DESCRIPTION : Utility functions used for sorting array and finding elements 
    * INPUT :
    *       array       array
    *       key         string
    *       value       string
    * OUTPUTS :
    *       deal        array
    ************************************************************************/  
    function sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }
     
    function getObjectByValue(arr, value) {
        for (var i=0, iLen=arr.length; i<iLen; i++) {
            if (arr[i].objectId == value) return arr[i];
        }
    }