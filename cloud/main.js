
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.job('deleteOldParkings', function(request, status) {

    // All access
    Parse.Cloud.useMasterKey();

    var today = new Date();
	var minutes = 5;
    var time = (minutes * 60 * 1000);
    var expirationDate = new Date(today.getTime() - (time));

    var query = new Parse.Query('ParkingSpaces');
        query.lessThan('createdAt', expirationDate);

        query.find().then(function (spots) {
			var arrayLength = spots.length;
			for (var i = 0; i < arrayLength; i++) {
				if ( spots[i].get('taken') == false ){
					spots[i].set('taken', true);
				}
			}
			status.success("done");
        }, function (error) {});
		
});