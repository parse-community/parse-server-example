var moment = require('moment');
var ig = require('./instagram-v1-1.0.js');
ig.initialize('4ef4248c31464b19893c5fbbbe37aee4');
//https://api.instagram.com/oauth/authorize/?client_id=4ef4248c31464b19893c5fbbbe37aee4&redirect_uri=https://gbztest.parseapp.com/insta&response_type=code&state=<installationId>

var ImageClass = Parse.Object.extend("ImageMedia");

Parse.Cloud.define("instaFetch", function(request, response) {

  var installHandle;
  var installationQuery = new Parse.Query(Parse.Installation).equalTo('installationId', request.params.installationId);
  installationQuery.first().then(function(install) {
    installHandle = install;
    return ig.getSelfFeed({access_token: install.get("instagramToken")});
  }).then(function (httpResponse) {
      var instImg = httpResponse.data;

      var img = new ImageClass();
      if (instImg.data[0].location != null) {
        instImg.data[0].location.latitude;
        instImg.data[0].location.longitude;
      } else {
        img.set("longitude", 0);
        img.set("latitude", 0);
      }
      var t = new Number(instImg.data[0].created_time);
      img.set("dateImageAddedTs", t.valueOf());
      img.set("dateImageTakenTs", t.valueOf() * 1000);
      img.set("filePath", instImg.data[0].images.standard_resolution.url);
      img.set("deviceId", installHandle.get("deviceId"));
      img.set("source", "Instagram");
      img.set("height", instImg.data[0].images.standard_resolution.height);
      img.set("width", instImg.data[0].images.standard_resolution.width);
      return img.save();
    }).then(function() {

      response.success();

  },
  function (error) {
    if (error.data.meta.error_type === "OAuthAccessTokenException") {
      //what to do
      console.log("nertz - not authed");
    }
    response.error(error);
  });
});

var graph = require('fbgraph');

graph.setVersion("2.6");

Parse.Cloud.define("fbFetch", function(request, response) {
    var sinceTs = moment().subtract(7, "weeks").unix();
    graph.get("me/photos?fields=id,name,likes.limit(0).summary(true),comments.limit(0).summary(true)&since="+sinceTs+"&access_token=" + "EAACEdEose0cBAAJ0rEnD09qJBQ951cFyundpDpCRrjExNsEOm9qNYwKF63Q94ZAz8Bhi5WSZAWfGZCAgQe5tLtPIW0wZBV2QDLZBmfxHTCrFakJYiQnZCy4oVGsiFaYZB4z2xHqiwxaUZBSUcZBkkZCXZAuYtVZAIj7bjc14XwICI3AZCdQZDZD", function(err, res) {
        console.log(res);
        response.success(res);
    });
});
//https://www.facebook.com/dialog/oauth?client_id=156579137691223&redirect_uri=https://gbztest.parseapp.com/fb&response_type=code&state=<installationId>
