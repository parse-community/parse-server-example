const Promise = require('bluebird');
const http = require('http');
const { MongoClient } = require('mongodb');
const { ParseServer } = require('parse-server');
const { config, app } = require('../../index.js');
const Config = require('../../node_modules/parse-server/lib/Config');

const mongoDBRunnerStart = require('mongodb-runner/mocha/before').bind({
  timeout() {},
  slow() {},
});
const mongoDBRunnerStop = require('mongodb-runner/mocha/after');

const startDB = () =>
  new Promise((done, reject) => {
    done.fail = reject;
    mongoDBRunnerStart(done);
  });

const stopDB = () =>
  new Promise((done, reject) => {
    done.fail = reject;
    mongoDBRunnerStop(done);
  });

const connectDB = databaseURI =>
  new Promise((resolve, reject) => {
    MongoClient.connect(databaseURI, (err, db) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });

let parseServerState = {};

const dropDB = async () => {
  await Parse.User.logOut();
  const app = Config.get('test');
  return await app.database.deleteEverything(true);
};

/**
 * Starts the ParseServer instance
 * @param {Object} parseServerOptions Used for creating the `ParseServer`
 * @return {Promise} Runner state
 */
async function startParseServer() {
  const mongodbPort = process.env.MONGODB_PORT || 27017;
  let parseServerOptions = Object.assign(config, {
    databaseName: 'parse-test',
    databaseURI: `mongodb://localhost:${mongodbPort}/parse-test`,
    masterKey: 'test',
    javascriptKey: 'test',
    appId: 'test',
    port: 30001,
    mountPath: '/test',
    serverURL: `http://localhost:30001/test`,
    logLevel: 'error',
    silent: true,
  });
  const {
    databaseURI,
    masterKey,
    javascriptKey,
    appId,
    port,
    serverURL,
    mountPath,
  } = parseServerOptions;
  await startDB();
  const mongoConnection = await connectDB(databaseURI);
  parseServerOptions = Object.assign(
    {
      masterKey,
      javascriptKey,
      appId,
      serverURL,
      databaseURI,
      silent: process.env.VERBOSE !== '1',
    },
    parseServerOptions
  );
  const parseServer = new ParseServer(parseServerOptions);
  app.use(mountPath, parseServer);

  const httpServer = http.createServer(app);

  Promise.promisifyAll(httpServer);
  Promise.promisifyAll(mongoConnection);
  await httpServer.listenAsync(port);

  Object.assign(parseServerState, {
    parseServer,
    httpServer,
    mongoConnection,
    expressApp: app,
    parseServerOptions,
  });
  return parseServerOptions;
}

/**
 * Stops the ParseServer instance
 * @return {Promise}
 */
function stopParseServer() {
  const { httpServer } = parseServerState;
  return httpServer
    .closeAsync()
    .then(stopDB)
    .then(() => (parseServerState = {}));
}

module.exports = {
  dropDB,
  startParseServer,
  stopParseServer,
  parseServerState,
};
