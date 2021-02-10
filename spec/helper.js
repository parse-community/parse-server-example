const Parse = require('parse/node');
Parse.initialize('test');
Parse.serverURL = 'http://localhost:30001/test';
Parse.masterKey = 'test';
const { startParseServer, stopParseServer, dropDB } = require('./utils/test-runner.js');
beforeAll(async () => {
  await startParseServer();
}, 100 * 60 * 2);

afterAll(async () => {
  await dropDB();
  await stopParseServer();
});
