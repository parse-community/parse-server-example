import { getSecrets } from './utils/secrets.js';
export const getConfig = async () => {
  const { MASTER_KEY, DATABASE_URI } = await getSecrets('MASTER_KEY', 'DATABASE_URI');
  return {
    databaseURI: DATABASE_URI,
    cloud: () => import('./cloud/main.js'),
    appId: 'myAppId',
    masterKey: MASTER_KEY,
    serverURL: 'http://localhost:1337/parse',
  };
};
