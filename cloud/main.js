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
Parse.Cloud.define("sumSales", async (request) => {
  const query = new Parse.Query("sale");
  query.limit(10000);
  query.equalTo("saleUser", request.params.saleUser);
  const results = await query.find();
  let sum = 0;
  for (let i = 0; i < results.length; ++i) {
    sum += results[i].get("saleamount");
  }
  return sum; // results.length;
});
Parse.Cloud.define("tempsumTransactions", function(request, response) {
   var queryObject = Parse.Object.extend("test");
   var query = new Parse.Query("sale");
   query.limit(10000);
   query.equalTo("saleUser", request.params.saleUser);
   query.count({
         success: function(number) {
           // There are number instances of MyClass.
           console.log("count number retrieved");
           response.success(number);
         },
         error: function(error) {
         // error is an instance of Parse.Error.
             console.log("error on count number");
             response.error("error");
     }
   });
});
Parse.Cloud.define("sumTransactions", async (request) => {
  const query = new Parse.Query("sale");
  query.limit(10000);
  query.equalTo("saleUser", request.params.saleUser);
  const results = await query.find();
  return results.length;
});
Parse.Cloud.define("sumBalances", async (request) => {
  const query = new Parse.Query("balance");
  query.limit(10000);
  query.startsWith("tokenid", request.params.tokenPrefix);
  const results = await query.find();
  let sum = 0;
  for (let i = 0; i < results.length; ++i) {
    sum += results[i].get("amount");
  }
  return sum;
});
Parse.Cloud.define("sumBalances2", async (request) => {
  const query = new Parse.Query("balance");
  query.limit(10000);
  query.startsWith("oe", request.params.tokenPrefix);
  const results = await query.find();
  let sum = 0;
  for (let i = 0; i < results.length; ++i) {
    sum += results[i].get("amount");
  }
  return sum;
});
