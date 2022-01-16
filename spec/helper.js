import Parse from 'parse';
Parse.initialize('test');
Parse.serverURL = 'http://localhost:30001/test';
Parse.masterKey = 'test';
import { startParseServer, stopParseServer, dropDB } from './utils/test-runner.js';
beforeAll(async () => {
  await startParseServer();
}, 100 * 60 * 2);

afterAll(async () => {
  await dropDB();
  await stopParseServer();
});
