Parse.Cloud.define("retrieveAllObjects", function(request, status) {
    var result     = [];
    var chunk_size = 1000;
    var processCallback = function(res) {
        result = result.concat(res);
        if (res.length === chunk_size) {
            process(res[res.length-1].id);
        } else {
            status.success(result);
        }
    };
    var process = function(skip) {
        var query = new Parse.Query(request.params.object_type);
        if (skip) {
            query.greaterThan("objectId", skip);
        }
        if (request.params.update_at) {
            query.greaterThan("updatedAt", request.params.update_at);
        }
        if (request.params.only_objectId) {
            query.select("objectId");
        }
        query.limit(chunk_size);
        query.ascending("objectId");
        query.find().then(function (res) {
            processCallback(res);
        }, function (error) {
            status.error("query unsuccessful, length of result " + result.length + ", error:" + error.code + " " + error.message);
        });
    };
    process(false);
});
Parse.Cloud.define("sumSales", function(request, response) {
  //Query class appointments
  var query = new Parse.Query("sale");
    query.limit(10000);
  //Query column trainer in appointments pass trainerid object
  query.equalTo("saleUser", request.params.saleUser);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        //Get the sum of the field rate for the trainer
        sum += results[i].get("saleamount");
      }
      response.success({value1 : sum, value2 : results.length});
      //response.success(results.length);  
    },
    error: function() {
      response.error("Calculating ratings failed");
    }
  });
});
Parse.Cloud.define("sumBalances", function(request, response) {
  //Query token balances
  var query = new Parse.Query("sale");
    query.limit(10000);
  //Query balances with tokenid for the organization_event prefix
  query.startsWith("tokenid", request.params.tokenPrefix);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        //Get the sum of the token balances
        sum += results[i].get("saleamount");
      }
      response.success(sum);
    },
    error: function() {
      response.error("Calculating ratings failed");
    }
  });
});
