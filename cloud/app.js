
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
//var parseExpressHttpsRedirect = require('parse-express-https-redirect');
//var parseExpressCookieSession = require('parse-express-cookie-session');
var ParseServer = require('parse-server').ParseServer;
var app = express();

var api = new ParseServer({
    databaseURI: 'mongodb://localhost:27017/dev', // Connection string for your MongoDB database
    cloud: '/Users/cahlering/WebstormProjects/goobzy-parse/cloud/main.js', // Absolute path to your Cloud Code
    appId: 'myAppId',
    masterKey: 'myMasterKey', // Keep this key secret!
    fileKey: 'optionalFileKey',
    serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

//app.use(parseExpressHttpsRedirect());
//app.use(express.bodyParser());    // Middleware for reading request body
//app.use(express.cookieParser('cookie_signing-secret'));

//app.use(parseExpressCookieSession({cookie: {maxAge:360000000}}));

var moment = require('moment');
var _ = require('underscore');


// Global app configuration section
app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine



// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.post('/register', function(req, res) {

    Parse.User.signUp(req.body.username, req.body.password).then(function(user) {
        res.redirect('/upload?succ=' + user.getSessionToken());
    }, function(error) {
        res.redirect('/login?error=' + error);
    });
});

app.get('/login', function(req, res) {
  if (Parse.User.current()) {
    res.render('loggedin');
  } else {
    res.render('login');
  }
});

app.post('/login', function(req, res) {
    Parse.User.logIn(req.body.username, req.body.password).then(function(user) {
        res.redirect('/upload?succ=' + user.getSessionToken());
    },
    function(error){
      console.log(error);
      res.redirect('/login');
    });
});

app.get('/logout', function(req, res) {
    Parse.User.logOut();
    res.redirect('/login');
});

app.post('/logout', function(req, res) {
    Parse.User.logOut();
    res.redirect('/login');
});

app.get('/upload', function(req, res) {
  if (Parse.User.current()) {
    res.render('upload');
  } else {
    console.log("No current user");
    res.redirect('/login');
  }
});

app.get('/nearby', function(req, res) {
//  if (Parse.User.current()) {
  res.render('nearby');
//  } else {
//    res.redirect('/login');
//  }
});

app.get('/photoMix', function(req, res) {
//  if (Parse.User.current()) {
  res.render('photoMix');
//  } else {
//    res.redirect('/login');
//  }
});

app.get('/clusters', function(req, res) {
  res.render('clusters');
});

app.get('/sampleapp', function(req, res){
  res.render('appSample.ejs');
});

app.get('/insta', function(req, res){
  var code = req.query.code;
  var installationId = req.query.state;
  console.log("code: " + code + ", device=" + installationId);
  Parse.Cloud.httpRequest({
    method: "POST",
    url: "https://api.instagram.com/oauth/access_token",
    body: {
      client_secret: "37f67692f3e94dc6bea135fd2d93c481",
      client_id: "4ef4248c31464b19893c5fbbbe37aee4",
      grant_type: "authorization_code",
      redirect_uri: "https://gbztest.parseapp.com/insta",
      code: code
    }
  }).then(function(httpResponse) {
    var installationQuery = new Parse.Query(Parse.Installation).equalTo('installationId', installationId);
    console.log(httpResponse.text);
    installationQuery.first().then(function(result){
      result.set('instagramToken', httpResponse.data.access_token);
      return result.save();
    }).then(function(installation){
      res.statusCode = 204;
      res.render('landing.ejs');
    });
  }, function(httpResponse) {
    console.log(httpResponse.text);
    res.render('landing.ejs');
  });
});

// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

app.listen(1337, function() {
    console.log('parse-server-example running on port 1337.');
});

