var _ = require('underscore');

/**
 Every REST client call (get, put, post, delete[, create, update]) shares this common signature.
 This function returns an object which groks this signature from an arguments array:

 get({
		Some:'parameter'
	}, function(err, data, response) {
		console.log(err); //The error object from "request" module
		console.log(data); //The JSON-parsed response from Twilio
		console.log(response); //The node http.ClientResponse object from "request"
	});

 - or -

 get({
		Some:'parameter'
	});

 - or -

 get(function(err, data) {

	});
 */
function process(args) {
    var params = (typeof args[0] !== 'function') ? args[0] : {},
        twilioParams = {},
        callback = (typeof args[0] === 'function') ? args[0] : args[1];

    //"Twilify" any request parameters
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            //assume first letter in variable name needs uppercasing, otherwise assume fine
            var twilioKey = key.charAt(0).toUpperCase() + key.slice(1);
            twilioParams[twilioKey] = params[key];
        }
    }

    return {
        twilioParams:twilioParams,
        callback:callback
    };
};

//Generate a Twilio HTTP client call
var generate = function (client, method, url) {
    return function () {
        var args = process(arguments),
            requestArgs = {
                url:url,
                method:method
            };

        //Send parameters, if supplied
        if (args.twilioParams && method === 'GET') {
            requestArgs.qs = args.twilioParams;
        } else if (args.twilioParams) {
            requestArgs.form = args.twilioParams;
        }

        //make request
        return client.request(requestArgs, args.callback);
    };
};

//generate several rest functions on a given object
generate.restFunctions = function (object, client, methods, resource) {
    for (var i = 0, l = methods.length; i < l; i++) {
        var method = methods[i];

        //can be either a string indicating an HTTP method to generate,
        //or an object mapping a function name to an HTTP verb
        if (typeof method === 'string') {
            if (method === 'GET') {
                object.get = object.list = generate(client, method, resource);
            } else if (method === 'POST') {
                object.post = generate(client, method, resource);
            } else if (method === 'PUT') {
                object.put = generate(client, method, resource);
            } else if (method === 'DELETE') {
                object.delete = generate(client, method, resource);
            }
        }
        else {
            //Create an alias for the given method name to a REST function
            for (var key in method) {
            	// fixed issue for null Properties.
                if(method.hasOwnProperty(key))
                    object[key] = object[method[key].toLowerCase()];
            }
        }
    }
};

module.exports = generate;
