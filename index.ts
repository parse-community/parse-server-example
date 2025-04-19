// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from 'express';
import { ParseServer } from 'parse-server';
import path from 'path';
import http from 'http';
import { config } from './config.js';

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
const server = new ParseServer(config);

server.start().then(() => {
  app.use(mountPath, server.app);

  // Parse Server plays nicely with the rest of your web routes
  app.get('/', function (req, res) {
    res
      .status(200)
      .send('I dream of being a website.  Please star the parse-server repo on GitHub!');
  });

  // There will be a test page available on the /test path of your server url
  // Remove this before launching your app
  app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/test.html'));
  });

  const port = process.env.PORT || 1337;
  const httpServer = http.createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  console.log(`Visit http://localhost:${port}/test to check the Parse Server`);
  return ParseServer.createLiveQueryServer(httpServer);
});
