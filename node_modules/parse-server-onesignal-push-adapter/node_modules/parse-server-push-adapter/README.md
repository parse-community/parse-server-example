# parse-server-push-adapter

[![Build
Status](https://travis-ci.org/parse-server-modules/parse-server-push-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-push-adapter)
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-push-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-push-adapter?branch=master)
[![NPM Version](https://img.shields.io/npm/v/parse-server-push-adapter.svg?style=flat-square)](https://www.npmjs.com/package/parse-server-push-adapter)

Official Push adapter for parse-server

See [parse-server push configuration](https://github.com/ParsePlatform/parse-server/wiki/Push)

## Silent Notifications

If you have migrated from parse.com and you are seeing situations where silent (newsstand-like presentless) notifications are failing to deliver please ensure that your payload is setting the content-available attribute to Int(1) and not "1" This value will be explicitly checked.

### see more logs

You can enable verbose logging with environment variables:

```
VERBOSE=1

or 

VERBOSE_PARSE_SERVER_PUSH_ADAPTER=1
```

This will produce a more verbose output for all the push sending attempts
