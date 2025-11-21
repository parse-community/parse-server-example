import { schemaDefinitions } from './cloud/schema.js';

var databaseURI = 'mongodb+srv://odensutibun_db_user:<db_password>@gymproject.d2bedmi.mongodb.net/?appName=GymProject';

export const config = {
  databaseURI: databaseURI,
  cloud: () => import('./cloud/main.js'),
  appId: process.env.APP_ID || 'App-gym',
  masterKey: process.env.MASTER_KEY || 'master_root', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
  schema: {
    definitions: schemaDefinitions,
    lockSchemas: true,
    strict: true,
    recreateModifiedFields: false,
    deleteExtraFields: false,
  },
};
