import http from 'http';
import { ParseServer } from 'parse-server';
import { config, app } from '../../index.js';
import Config from '../../node_modules/parse-server/lib/Config.js';

export let parseServerState = {};
export const dropDB = async () => {
  await Parse.User.logOut();
  const app = Config.get('test');
  return await app.database.deleteEverything(true);
};

/**
 * Starts the ParseServer instance
 * @param {Object} parseServerOptions Used for creating the `ParseServer`
 * @return {Promise} Runner state
 */
export async function startParseServer() {
  delete config.databaseAdapter;
  const parseServerOptions = Object.assign(config, {
    databaseURI: 'mongodb://localhost:27017/parse-test',
    masterKey: 'test',
    javascriptKey: 'test',
    appId: 'test',
    port: 30001,
    mountPath: '/test',
    serverURL: `http://localhost:30001/test`,
    logLevel: 'error',
    silent: true,
  });
  const parseServer = new ParseServer(parseServerOptions);
  app.use(parseServerOptions.mountPath, parseServer);
  const httpServer = http.createServer(app);
  await new Promise(resolve => httpServer.listen(parseServerOptions.port, resolve));
  Object.assign(parseServerState, {
    parseServer,
    httpServer,
    expressApp: app,
    parseServerOptions,
  });
  await new Promise(resolve => setTimeout(resolve, 500));
  return parseServerOptions;
}

/**
 * Stops the ParseServer instance
 * @return {Promise}
 */
export async function stopParseServer() {
  const { httpServer } = parseServerState;
  await new Promise(resolve => httpServer.close(resolve));
  parseServerState = {};
}
