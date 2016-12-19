/***********************************************************************
* FILENAME :
*       jobs.js
*
* DESCRIPTION :
*       Main file containing jobs used in appNbite project. 
*
* CLOUD JOBS :
*       function     dealsMigration
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
        10 May 2015
*
* CHANGES :
*
*       VERSION     DATE        WHO     DETAIL
*       0.0.1       10May15     AM      First version of the jobs script
*
************************************************************************/
 
 
	Parse.Cloud.job("dealsMigration", function(request, status) {

		var objectsToMigrate=[];
	 
		console.log("Start dealsMigration job");
		var d = new Date();
		var todaysDate = new Date(d.getTime());
		var deal = Parse.Object.extend("Deal");
		var queryDeal = new Parse.Query(deal);
		queryDeal.lessThan("expiringAt", todaysDate);
		 
		 console.log("Start dealsMigration query");
		 
		 var promise = Parse.Promise.as();
		 
		queryDeal.each(function(deal) {
			// Set and save the change
			 
			 console.log(deal);
			 
			var BackupDeal = Parse.Object.extend("BackupDeal");
			var backupDeal = new BackupDeal();
		 
			 
			  
			backupDeal.set("title", deal.get("title"));
			backupDeal.set("description", deal.get("description"));
			backupDeal.set("quantity", deal.get("quantity"));
			backupDeal.set("currentPrice", deal.get("currentPrice"));
			backupDeal.set("originalPrice", deal.get("originalPrice"));
			backupDeal.set("shortDesc", deal.get("shortDesc"));
			backupDeal.set("startingAt", deal.get("startingAt"));
			backupDeal.set("expiringAt", deal.get("expiringAt"));
			backupDeal.set("barcode", deal.get("barcode"));
			backupDeal.set("pictureURL", deal.get("pictureURL"));
			backupDeal.set("mainImageIndex", deal.get("mainImageIndex"));
			backupDeal.set("status", deal.get("status"));
			backupDeal.set("belongsTo", deal.relation("belongsTo"));
			backupDeal.set("runningAt", deal.relation("runningAt"));
			
			console.log("Saving deal");
			objectsToMigrate.push(backupDeal);
			//backupDeal.save();
			 console.log("Deal saved");
			 
			 promise = promise.then(function() {
				return backupDeal.save();
			 }).then(function() {
				return deal.destroy();
			 });
			 
			 
			 return promise;
			 
		}).then(
         
        function() {
            // Set the function success response
            status.success("Migration completed successfully.");
        }, function(error) {
            // Set the function's error response
            status.error("Deals cannot be saved. " + error.message);
        }
         
         
        ); 
	});