var express = require("express");
var app = express();

var language = "en";
var languages = ["en"];//, "es", "ja", "kr", "pt-BR"];

var strings = require("./cloud/strings.js");

app.set('views', './cloud/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

app.get('/', function(req, res) {
  var lang = req.query.language;
  if(lang !== undefined && languages.indexOf(lang) != -1) {
    language = lang;
  }

  res.render("index.ejs", extend(strings[language], {'language': language}));
});


app.post('/', function(req, res) {

  var form = req.body;

  var phoneNumber = form.phoneNumber;

  var lang = form.language;
  if(lang !== undefined && languages.indexOf(lang) != -1) {
    language = lang;
  }

  if(phoneNumber) {
    phoneNumber = phoneNumber.replace(/\D/g, '');
    // check that length of number is 10 for US, 11 for Japan or Korea, 10 or 11 for Brazil
    if(language == "en" && phoneNumber.length != 10
      || ((language == "ja" || language == "kr") && phoneNumber.length != 11)
      || (language == "pt-BR" && phoneNumber.length != 10 && phoneNumber.length != 11)) {
      res.render("index.ejs", extend(strings[language], {warning: strings[language]['warningPhone'], 'language': language}));
    }
    Parse.Cloud.run("sendCode", {phoneNumber: phoneNumber, language: language}).then(function(response){
      if(!response){
        res.render("verify.ejs", extend(strings[language], {phoneNumber: phoneNumber, 'language': language}));
      } else {
        res.render("index.ejs", extend(strings[language], {warning: strings[language]['warningTwilio'], 'language': language}));
      }
    }, function(error){
      res.render("index.ejs", extend(strings[language], {warning: strings[language]['warningGeneral'], 'language': language}));
    });
  } else {
    res.render("index.ejs", extend(strings[language], {warning: strings[language]['warningNoNumber'], 'language': language}))
  }
});

app.get('/verify', function(req, res){
  res.redirect("/");
})

app.post('/verify', function(req, res){
  var form = req.body;
  var code = form.code;
  var phoneNumber = form.phoneNumber;

  var lang = form.language;
  if(lang !== undefined && languages.indexOf(lang) != -1) {
    language = lang;
  }

  if(code) {
    code = code.replace(/\D/g, '');
    if(code.length != 4) {
      res.render("verify.ejs", extend(strings[language], {warning: strings[language]['warningCodeLength'], 'language': language}));
    }
    Parse.Cloud.run("logIn", {codeEntry: code, phoneNumber: phoneNumber}).then(function(response){
      var sessionToken = response;
      Parse.User.become(sessionToken).then(function (user) {
        res.redirect('/dashboard/' + sessionToken)
      }, function (error) {
        res.redirect('/');
      });

    }, function(error) {
      res.render("verify.ejs", extend(strings[language], {phoneNumber: phoneNumber, warning: strings[language]['warningGeneral'], 'language': language}));
    });
  } else {
    res.render("verify.ejs", extend(strings[language], {phoneNumber: phoneNumber, warning:strings[language]['warningCodeInvalid'], 'language': language}));
  }
});

app.get('/dashboard/:sessionToken', function(req, res) {
  var sessionToken = req.params.sessionToken;

  Parse.User.become(sessionToken).then(function (user) {
    console.log("logged in as user");

    language = user.get("language");

    res.render("dashboard.ejs", extend(strings[language], {
      sessionToken: sessionToken,
      phoneNumber: user.get("username"),
      name: user.get("name"),
      setting1: user.get("setting1"),
      setting2: user.get("setting2"),
      setting3: user.get("setting3"),
      language: user.get("language"),
    }));
  }, function (error) {
    console.log("Could not log in as user.");
    res.redirect("/");
  });
});

app.post('/dashboard', function(req, res) {
  var form = req.body;

  var sessionToken = form.sessionToken;

  var name = form.name;

  var setting1 = form.setting1;
  var setting2 = form.setting2;
  var setting3 = form.setting3;

  var lang = form.language;
  if(lang !== undefined && languages.indexOf(lang) != -1) {
    language = lang;
  }

  Parse.User.become(sessionToken).then(function (user) {
    user.set("name", name);
    user.set("setting1", (setting1 !== undefined && setting1 == "on")?true:false);
    user.set("setting2", (setting2 !== undefined && setting2 == "on")?true:false);
    user.set("setting3", (setting3 !== undefined && setting3 == "on")?true:false);
    user.set("language", language);
    user.save().then(function(user) {

      language = user.get("language");

      res.render("dashboard.ejs", extend(strings[language], {
        sessionToken: sessionToken,
        phoneNumber: user.get("username"),
        name: user.get("name"),
        setting1: user.get("setting1"),
        setting2: user.get("setting2"),
        setting3: user.get("setting3"),
        language: user.get("language"),
      }));
    }, function(error) {
      console.log(error);
      res.redirect("/");
     });
  }, function (error) {
    console.log(error);
    res.redirect("/");
  });

});

app.listen();
