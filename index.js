// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from 'express';
import { ParseServer } from 'parse-server';
import { createServer } from 'http';
import { config } from './src/config.js';
import { renderFile } from 'ejs';
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

export const app = express();
app.set('view engine', 'ejs');
app.engine('html', renderFile);
app.set('views', `./src/views`);

// Serve static assets from the /public folder
app.use('/public', express.static('./src/public'));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.render('test.html', { appId: config.appId, serverUrl: config.serverURL });
});

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = createServer(app);
  httpServer.listen(port, function () {
    console.log(`parse-server-example running on port ${port}.`);
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}
