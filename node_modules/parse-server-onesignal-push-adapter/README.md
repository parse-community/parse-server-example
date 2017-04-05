# parse-server-onesignal-push-adapter

[![Build Status](https://travis-ci.org/parse-server-modules/parse-server-onesignal-push-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-onesignal-push-adapter)
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-onesignal-push-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-onesignal-push-adapter?branch=master)



OneSignal push adapter for parse-server


## Installation

```
npm install --save parse-server-onesignal-push-adapter
```

## Usage

```
var OneSignalPushAdapter = require('parse-server-onesignal-push-adapter');
var oneSignalPushAdapter = new OneSignalPushAdapter({
  oneSignalAppId:"your-one-signal-app-id",
  oneSignalApiKey:"your-one-signal-api-key"
});

var api = new ParseServer({
  push: {
    adapter: oneSignalPushAdapter
  },
  ...otherOptions
});
```