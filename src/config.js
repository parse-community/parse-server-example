import { getSecrets } from './utils/secrets.js';
const { MASTER_KEY, DATABASE_URI } = await getSecrets('MASTER_KEY', 'DATABASE_URI');
export const config = {
  databaseURI: DATABASE_URI,
  cloud: () => import('./cloud/main.js'),
  appId: 'myAppId',
  masterKey: MASTER_KEY,
  serverURL: 'http://localhost:1337/parse',
};
