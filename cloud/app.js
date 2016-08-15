
// These two lines are required to initialize Express in Cloud Code.
 express = require('express');
 app = express();

// Global app configuration section
app.set('views', './cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
// app.get('/hello', function(req, res) {
//   res.render('hello', { message: 'Congrats, you just set up your app!' });
// });

// // Example reading from the request query string of an HTTP get request.
app.get('/test', function(req, res) {
  // GET http://example.parseapp.com/test?message=hello
  res.send("test is displayed");
  //res.send(req.query.message);
});

// // Example reading from the request body of an HTTP post request.


app.post('/twilio', function(req, res)
{
   // POST http://example.parseapp.com/test (with request body "message=hello")
   var messageBody = req.params.Body;
   var messageFrom = req.params.From;

   Parse.Cloud.useMasterKey();

	var userAgent       = 'Indigo SMS Service 0.0.0 (beta)'

    var messageBody     = request.params.Body;
    var messageFrom     = request.params.From;

    var dateObject      = new Date();
    var timeStamp       = dateObject.getUTCDate();

	var rycardo = {
					baseURL: "http://tdot.coubur.com",
					port: '8176',
					username: 'indigo',
					password: '1nd190Server',
					from: 'twilioFrom',
					time: 'twilioTimeStamp',
					message: 'twilioMessage'
					};

	var account = {
					name: '16172165525',
					info: rycardo
					}

	var accounts = [account];

	var messageAccount = null;

	for ( a = 0; a < accounts.count; a++ )
	{
		var thisAccount = accounts[a];
		if ( thisAccount["name"] == messageFrom )
		{
			messageAccount = thisAccount["info"];
			break;
		}
	}

	if ( messageAccount == null )
	{
		response.error("not authorised");
	}

	var baseURL		= messageAccount["baseURL"];
	var port		= messageAccount["port"];
	var username	= messageAccount["username"];
	var password	= messageAccount["password"];
	var fromVar		= messageAccount["from"];
	var timeVar		= messageAccount["time"];
	var messageVar	= messageAccount["message"];


	var extURL 	= username + ":" + password + "@" + baseURL + ":" + port + "/variables/";

	var fromURL = extURL + fromVar;
	var timestampURL = extURL + timeVar;
	var bodyURL = extURL + messageVar;

	Parse.Cloud.httpRequest(
	{
		method: 'POST',
		url: fromURL,
		followRedirects: true,
		headers:
		{
			'UserAgent': userAgent
		},
		params:
		{
			_method : 'put',
			value : messageFrom
		}
	}).then(function(httpResponse)
	{
		// Success
		response.success(httpResponse.text);

	}, function(httpResponse)
	{
		// error
		response.error(httpResponse.status);
	});

   //res.send(req.body.message);
 });

// Attach the Express app to Cloud Code.
app.listen();
