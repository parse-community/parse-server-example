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
  - [Docker Deployment](#docker-deployment)
  - [Helpful Scripts](#helpful-scripts)
- [Remote Deployment](#remote-deployment)
  - [Required configuration](#required-configuration)
  - [Heroku](#heroku)
  - [AWS Elastic Beanstalk](#aws-elastic-beanstalk)
  - [Microsoft Azure App Service](#microsoft-azure-app-service)
  - [Google App Engine](#google-app-engine)
  - [Scalingo](#scalingo)
  - [OpenShift](#openshift)
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

## Docker Deployment

You can also run Parse Server using Docker:

1. Create a `.env` file with your configuration variables. For example:
   ```env
   APP_ID=myAppId
   MASTER_KEY=myMasterKey
   DATABASE_URI=mongodb://localhost:27017/parse
   PORT=1337
   PARSE_MOUNT=/parse
   ```

2. Run Docker with the following command, mounting volumes as needed:
   ```bash
   docker build -t parse-server .
   docker run -p 1337:1337 --env-file .env \
     -v $(pwd)/logs:/usr/src/parse/logs \
     -v $(pwd)/cloud:/usr/src/parse/cloud \
     parse-server
   ```

This allows you to:
- Use an environment file for configuration
- Mount the logs directory to persist logs outside the container
- Mount the cloud directory to access your Cloud Code files from the container

You can customize the mounted volumes based on your needs, such as mounting config files or other directories that require persistence or runtime modifications.

## Helpful Scripts
These scripts can help you to develop your app for Parse Server:

* `npm run watch` will start your Parse Server and restart if you make any changes.
* `npm run lint` will check the linting of your cloud code, tests and `index.ts`, as defined in `.eslintrc.json`.
* `npm run lint-fix` will attempt fix the linting of your cloud code, tests and `index.ts`.
* `npm run prettier` will help improve the formatting and layout of your cloud code, tests and `index.ts`, as defined in `.prettierrc`.
* `npm test` will run all tests
* `npm run coverage` will run tests and check coverage. Output is available in the `/coverage` folder.

## Configuration

Configuration is located in `config.ts`.


# Remote Deployment

Create a hosted MongoDB database before deploying this example to a remote provider. Remote deployments should not use the local `mongodb://localhost:27017/dev` fallback.

## Required configuration

Set these values before starting the remote app:

| Variable | Description |
| --- | --- |
| `DATABASE_URI` | MongoDB connection string for your hosted database. |
| `APP_ID` | Parse application ID. |
| `MASTER_KEY` | Parse master key. Keep this secret. |
| `SERVER_URL` | Public URL for your deployed Parse API, including `PARSE_MOUNT`, for example `https://example.com/parse`. |
| `PARSE_MOUNT` | Parse API route. Defaults to `/parse`. |

## Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/parse-community/parse-server-example)

The Heroku button reads `app.json` and prompts for the required configuration. The old mLab add-on is no longer provisioned by this project, so provide a MongoDB connection string from MongoDB Atlas or another hosted MongoDB provider.

Alternatively, to deploy manually:

* Clone the repo and change directory to it
* Log in with the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and create an app: `heroku create`
* Configure the required variables: `heroku config:set DATABASE_URI="<mongodb-uri>" APP_ID="<app-id>" MASTER_KEY="<master-key>" SERVER_URL="https://<your-app>.herokuapp.com/parse"`
* To change the API route, run `heroku config:set PARSE_MOUNT=/1` and update `SERVER_URL` to match.
* Deploy it with: `git push heroku HEAD:main`

## AWS Elastic Beanstalk

The previous Elastic Beanstalk button used a static sample bundle that did not track this repository. Deploy your local checkout with the EB CLI instead:

* Clone the repo and change directory to it
* Log in with the [AWS Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html), select a region, and create an app: `eb init`
* Create an environment and pass in MongoDB URI, App ID, and Master Key: `eb create --envvars DATABASE_URI=<mongodb-uri>,APP_ID=<app-id>,MASTER_KEY=<master-key>,PARSE_MOUNT=/parse`
* After Elastic Beanstalk prints the environment URL, set `SERVER_URL`: `eb setenv SERVER_URL=https://<environment-url>/parse`

## Microsoft Azure App Service

The old Azure Marketplace Parse Server template is no longer maintained by this repository. Deploy as a Node.js app on [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs) and set the required configuration as App Service application settings.

For GitHub-based deployments, see [Deploy to Azure App Service by using GitHub Actions](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions). Build the TypeScript output before deployment or enable App Service build automation.

## Google App Engine

1. Clone the repo and change directory to it 
1. Create a project in the [Google Cloud Platform Console](https://console.cloud.google.com/).
1. [Enable billing](https://console.cloud.google.com/project/_/settings) for your project.
1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
1. Create a hosted MongoDB database and copy its connection string.
1. Modify `app.yaml` to set the required configuration.
1. Deploy it with `gcloud app deploy`.

For `app.yaml` settings, see [Configure your app with app.yaml](https://cloud.google.com/appengine/docs/flexible/nodejs/configuring-your-app-with-app-yaml).

## Scalingo

[![Deploy to Scalingo](https://cdn.scalingo.com/deploy/button.svg)](https://dashboard.scalingo.com/create/app?source=https://github.com/parse-community/parse-server-example#master)

Alternatively, to deploy manually:

* Clone the repo and change directory to it
* Log in with the [Scalingo CLI](https://cli.scalingo.com/) and create an app: `scalingo create my-parse`
* Use the [Scalingo for MongoDB add-on](https://doc.scalingo.com/databases/mongodb/start): `scalingo --app my-parse addons-plans mongodb`, then `scalingo --app my-parse addons-add mongodb <plan>`
* Configure the required variables: `scalingo --app my-parse env-set DATABASE_URI='$SCALINGO_MONGO_URL' APP_ID="<app-id>" MASTER_KEY="<master-key>" SERVER_URL="https://<your-app>.osc-fr1.scalingo.io/parse"`
* By default it will use a path of /parse for the API routes. To change this, or use older client SDKs, run `scalingo --app my-parse env-set PARSE_MOUNT=/1`
* Deploy it with: `git push scalingo HEAD:master`

## OpenShift

1. Create an OpenShift project.
1. Install the OpenShift CLI (`oc`).
1. Create the application from this repository: `oc new-app https://github.com/parse-community/parse-server-example.git --name=parse-server-example`
1. Set the required configuration: `oc set env deployment/parse-server-example DATABASE_URI=<mongodb-uri> APP_ID=<app-id> MASTER_KEY=<master-key> PARSE_MOUNT=/parse`
1. Expose the service: `oc expose service/parse-server-example`
1. After the route is created, set `SERVER_URL`: `oc set env deployment/parse-server-example SERVER_URL=https://<route-host>/parse`

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
