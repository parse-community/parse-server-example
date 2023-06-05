import dns from 'dns';
import { startParseServer, stopParseServer, dropDB } from './utils/test-runner.js';

// Ensure localhost resolves to ipv4 address first on node v17+ for connection to MongoDB;
// see https://www.mongodb.com/community/forums/t/econnrefused-27017/131911
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

beforeAll(async () => {
  await startParseServer();
}, 100 * 60 * 20);

afterAll(async () => {
  await dropDB();
  await stopParseServer();
});
