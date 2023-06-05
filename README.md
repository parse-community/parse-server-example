![parse-repository-header](https://user-images.githubusercontent.com/5673677/169108275-8efa0dae-4997-4ddc-9c12-88a9c4c42e31.png)

---

[![Build Status](https://github.com/parse-community/parse-server-example/workflows/ci/badge.svg?branch=master)](https://github.com/parse-community/parse-server-example/actions?query=workflow%3Aci+branch%3Amaster)
[![Snyk Badge](https://snyk.io/test/github/parse-community/parse-server-example/badge.svg)](https://snyk.io/test/github/parse-community/parse-server-example)
[![auto-release](https://img.shields.io/badge/%F0%9F%9A%80-auto--release-9e34eb.svg)](https://github.com/parse-community/parse-server-example/releases)

[![Join The Conversation](https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg)](https://community.parseplatform.org/c/parse-server)
[![Backers on Open Collective](https://opencollective.com/parse-server/backers/badge.svg)][open-collective-link]
[![Sponsors on Open Collective](https://opencollective.com/parse-server/sponsors/badge.svg)][open-collective-link]
[![License][license-svg]][license-link]
[![Forum](https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg)](https://community.parseplatform.org/c/parse-server)
[![Twitter](https://img.shields.io/twitter/follow/ParsePlatform.svg?label=Follow&style=social)](https://twitter.com/intent/follow?screen_name=ParsePlatform)

---

This is an example project using the [Parse Server](https://github.com/ParsePlatform/parse-server) module on Express.


The [Parse Server guide](https://docs.parseplatform.org/parse-server/guide/) is a good place to get started. An [API reference](https://parseplatform.org/parse-server/api/) and [Cloud Code guide](https://docs.parseplatform.org/cloudcode/guide/) are also available. If you're interested in developing for Parse Server, the [Development guide](https://docs.parseplatform.org/parse-server/guide/#development-guide) will help you get set up. All documentations for Parse Platform's server and its client SDKs are available at [parseplatform.org](https://parseplatform.org). 

---

- [Local Development](#local-development)
  - [Helpful Scripts](#helpful-scripts)
- [Remote Deployment](#remote-deployment)
  - [Heroku](#heroku)
  - [AWS Elastic Beanstalk](#aws-elastic-beanstalk)
  - [Microsoft Azure App Service](#microsoft-azure-app-service)
  - [Google App Engine](#google-app-engine)
  - [Scalingo](#scalingo)
  - [OpenShift Online (Next Gen)](#openshift-online-next-gen)
- [Using Parse Server](#using-parse-server)
  - [Health Check](#health-check)
  - [APIs and SDKs](#apis-and-sdks)
    - [REST API](#rest-api)
    - [JavaScript](#javascript)
    - [Android](#android)
    - [iOS / tvOS / iPadOS / macOS (Swift)](#ios--tvos--ipados--macos-swift)

# Local Development

1. Make sure you have a compatible Node.js version installed. Run `node --version` to see your local Node.js version. Open the `package.json` file too see which version of Node.js this example repository requires at `{ engines": { "node": "<NODE_VERSION>" } }`. Note that there may be other Parse Server version available that support older or newer Node.js versions, see the [Parse Server compatibility table](https://github.com/parse-community/parse-server#compatibility).
2. Clone this repository and change directory to it.
3. Run `npm install`.
4. Install a MongoDB database locally from https://docs.mongodb.org/master/tutorial/install-mongodb-on-os-x.
5. Run `mongo` to connect to your database, just to make sure it's working. Once you see a mongo prompt, exit with `Control-D`.
6. Launch Parse Server with `npm start`.
7. By default the API route will use `/parse` as a base. You can change this by setting the environment variable `PARSE_MOUNT`, for example in the CLI run run `export PARSE_MOUNT=/app` to set the path to `app`.
8. Your Parse Server is not running and is connected to your local database named `dev` in which the data is stored that you manage via Parse Server.

## Helpful Scripts
These scripts can help you to develop your app for Parse Server:

* `npm run watch` will start your Parse Server and restart if you make any changes.
* `npm run lint` will check the linting of your cloud code, tests and `index.js`, as defined in `.eslintrc.json`.
* `npm run lint-fix` will attempt fix the linting of your cloud code, tests and `index.js`.
* `npm run prettier` will help improve the formatting and layout of your cloud code, tests and `index.js`, as defined in `.prettierrc`.
* `npm run test` will run any tests that are written in `/spec`.
* `npm run coverage` will run tests and check coverage. Output is available in the `/coverage` folder.

# Remote Deployment

## Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Alternatively, to deploy manually:

* Clone the repo and change directory to it
* Log in with the [Heroku Toolbelt](https://toolbelt.heroku.com/) and create an app: `heroku create`
* Use the [mLab addon](https://elements.heroku.com/addons/mongolab): `heroku addons:create mongolab:sandbox --app YourAppName`
* By default it will use a path of /parse for the API routes.  To change this, or use older client SDKs, run `heroku config:set PARSE_MOUNT=/1`
* Deploy it with: `git push heroku master`

## AWS Elastic Beanstalk

<a title="Deploy to AWS" href="https://console.aws.amazon.com/elasticbeanstalk/home?region=us-west-2#/newApplication?applicationName=ParseServer&solutionStackName=Node.js&tierName=WebServer&sourceBundleUrl=https://s3.amazonaws.com/elasticbeanstalk-samples-us-east-1/eb-parse-server-sample/parse-server-example.zip" target="_blank"><img src="https://d0.awsstatic.com/product-marketing/Elastic%20Beanstalk/deploy-to-aws.png" height="40"></a>

Alternatively, deploy your local changes manually:

* Clone the repo and change directory to it
* Log in with the [AWS Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html), select a region, and create an app: `eb init`
* Create an environment and pass in MongoDB URI, App ID, and Master Key: `eb create --envvars DATABASE_URI=<replace with URI>,APP_ID=<replace with Parse app ID>,MASTER_KEY=<replace with Parse master key>`

## Microsoft Azure App Service

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.ParseServer)

Detailed information is available here:
* [Parse Server with Azure Managed Services](https://azure.microsoft.com/en-us/marketplace/partners/microsoft/parseserver/)
* [Parse Server Azure Blog Post](https://azure.microsoft.com/en-us/blog/announcing-the-publication-of-parse-server-with-azure-managed-services/)

## Google App Engine

1. Clone the repo and change directory to it 
1. Create a project in the [Google Cloud Platform Console](https://console.cloud.google.com/).
1. [Enable billing](https://console.cloud.google.com/project/_/settings) for your project.
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/).
1. Setup a MongoDB server.  You have a few options:
  1. Create a Google Compute Engine virtual machine with [MongoDB pre-installed](https://cloud.google.com/launcher/?q=mongodb).
  1. Use [mLab](https://mlab.com/google/) to create a free MongoDB deployment on Google Cloud Platform (only US-central).
1. Modify `app.yaml` to update your environment variables.
1. Delete `Dockerfile`
1. Deploy it with `gcloud preview app deploy`

A detailed tutorial is available here:
[Running Parse server on Google App Engine](https://cloud.google.com/nodejs/resources/frameworks/parse-server)

## Scalingo

[![Deploy to Scalingo](https://cdn.scalingo.com/deploy/button.svg)](https://my.scalingo.com/deploy)

Alternatively, to deploy manually:

* Clone the repo and change directory to it
* Log in with the [Scalingo CLI](https://cli.scalingo.com/) and create an app: `scalingo create my-parse`
* Use the [Scalingo MongoDB addon](https://scalingo.com/addons/scalingo-mongodb): `scalingo addons-add scalingo-mongodb free`
* Setup MongoDB connection string: `scalingo env-set DATABASE_URI='$SCALINGO_MONGO_URL'`
* By default it will use a path of /parse for the API routes. To change this, or use older client SDKs, run `scalingo env-set PARSE_MOUNT=/1`
* Deploy it with: `git push scalingo master`

## OpenShift Online (Next Gen)

1. Register for a free [OpenShift Online (Next Gen) account](https://www.openshift.com/devpreview/register.html)
1. Create a project in the [OpenShift Online Console](https://console.preview.openshift.com/console/).
1. Install the [OpenShift CLI](https://docs.openshift.com/online/getting_started/beyond_the_basics.html#btb-installing-the-openshift-cli).
1. Add the Parse Server template to your project: `oc create -f https://raw.githubusercontent.com/ParsePlatform/parse-server-example/master/openshift.json`
1. Deploy Parse Server from the web console
  1. Open your project in the [OpenShift Online Console](https://console.preview.openshift.com/console/):
  1. Click **Add to Project** from the top navigation
  1. Scroll down and select **NodeJS > Parse Server**
  1. (Optionally) Update the Parse Server settings (parameters)
  1. Click **Create**

A detailed tutorial is available here:
[Running Parse Server on OpenShift Online (Next Gen)](https://blog.openshift.com/parse-server/)

# Using Parse Server

## Health Check

You can use the `/health` endpoint to verify that Parse Server is up and running. For example, for local deployment, enter this URL in your browser:

> [http://localhost:1337/parse/health](http://localhost:1337/parse/health)

If you deployed Parse Server remotely, change the URL accordingly.

## APIs and SDKs

Use the REST API, GraphQL API or any of the Parse SDKs to see Parse Server in action. Parse Server comes with a variety of SDKs to cover most common ecosystems and languages, such as JavaScript, Swift, ObjectiveC and Android just to name a few.

The following shows example requests when interacting with a local deployment of Parse Server. If you deployed Parse Server remotely, change the URL accordingly.

### REST API

Save object:
```sh
curl -X POST \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"score":1337}' \
  http://localhost:1337/parse/classes/GameScore
```

Call Cloud Code function:
```sh
curl -X POST \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d "{}" \
  http://localhost:1337/parse/functions/hello
```

### JavaScript

```js
// Initialize SDK
Parse.initialize("YOUR_APP_ID", "unused");
Parse.serverURL = 'http://localhost:1337/parse';

// Save object
const obj = new Parse.Object('GameScore');
obj.set('score',1337);
await obj.save();

// Query object
const query = new Parse.Query('GameScore');
const objAgain = await query.get(obj.id);
```

### Android
```java
// Initialize SDK in the application class
Parse.initialize(new Parse.Configuration.Builder(getApplicationContext())
  .applicationId("YOUR_APP_ID")
  .server("http://localhost:1337/parse/")   // '/' important after 'parse'
  .build());

// Save object
ParseObject obj = new ParseObject("TestObject");
obj.put("foo", "bar");
obj.saveInBackground();
```

### iOS / tvOS / iPadOS / macOS (Swift)
```swift
// Initialize SDK in AppDelegate
Parse.initializeWithConfiguration(ParseClientConfiguration(block: {
  (configuration: ParseMutableClientConfiguration) -> Void in
    configuration.server = "http://localhost:1337/parse/" // '/' important after 'parse'
    configuration.applicationId = "YOUR_APP_ID"
}))
```
You can change the server URL in all of the open-source SDKs, but we're releasing new builds which provide initialization time configuration of this property.

[license-svg]: https://img.shields.io/badge/license-BSD-lightgrey.svg
[license-link]: LICENSE
[open-collective-link]: https://opencollective.com/parse-server
