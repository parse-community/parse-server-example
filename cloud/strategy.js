/**
 * Created by cahlering on 5/30/14.
 */
exports.nearLocation = function(request, response) {
    var lat = request.params.latitude;
    var long = request.params.longitude;

    var strategyResponse = new Array();
    strategyResponse.push({});
    strategyResponse.push({});

    response.success(strategyResponse);
};

exports.StrategyResponse = function() {
  this.individualResponses = [];
};

exports.StrategyResponse.prototype.addResponse = function(responsePromise) {
  this.individualResponses.push(responsePromise);
};