var azureParseServer = require('parse-server-azure-app');
var http = require('http');

// Add any custom parse server settings here
var config = {
  cloud: __dirname + '/cloud/main.js',
  logsFolder: __dirname + '/logs/',
  /*
  False by default to protect against malicious client attacks.
  Enable for development and testing if desired
   */
  // allowClientClassCreation: false,
  // enableAnonymousUsers:     false,

  /*
  Useful settings for developing locally.  These are populated via
  app settings (environment variables) when hosted in the Azure Web
  App deployed by the Parse Server on Managed Azure Services template.
   */
  // appId:              'my app id',
  // masterKey::         'my master key',
  // databaseURI:        'database connection string',
  // storage: {  
  //   name:             'storage account name',
  //   container:        'container to use for files',
  //   accessKey:        'storage account access key',
  //   // allow public access to blob storage files
  //   directAccess:     true 
  // },
  // push: {
  //   ConnectionString: 'notification hub connection string',
  //   HubName:          'notification hub name'
  // }
}

var app = azureParseServer(config);
var httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 1337);