# pushbots-nodejs

### Installation
```bash
npm install pushbots
```

### Usage

```javascript

var pushbots = require('pushbots');
var Pushbots = new pushbots.api({
	id:'548ef5901d0ab1f3228b456a',
	secret:'646f1ac2fd86ea14ae5a95db7fef724c'
});
Pushbots.setMessage("Hi from new nodeJS API!");//sending to (android and ios) platforms by default add optional paramater "0" for iOS, "1" for Android and "2" for Chrome.
Pushbots.customFields({"article_id":"1234"});
Pushbots.customNotificationTitle("CUSTOM TITLE");
//to send by tags
Pushbots.sendByTags(["myTag"]);

//to push to all
Pushbots.push(function(response){
	console.log(response);
});

//to push to one device 
var token = "APA91bEeYRWNVo2oc6DdTpSABGkqLm5QrTTbHVJbTGc6Bpjjlau";
Pushbots.pushOne(token, function(response){
    console.log(response);
});
