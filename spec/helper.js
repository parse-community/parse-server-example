import { startParseServer, stopParseServer, dropDB } from './utils/test-runner.js';
beforeAll(async () => {
  await startParseServer();
}, 100 * 60 * 20);

afterAll(async () => {
  await dropDB();
  await stopParseServer();
});
