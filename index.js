// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from 'express';
import { ParseServer } from 'parse-server';
import { createServer } from 'http';
import { config } from './src/config.js';
import { renderFile } from 'ejs';

export const app = express();
app.set('view engine', 'ejs');
app.engine('html', renderFile);
app.set('views', `./src/views`);

// Serve static assets from the /public folder
app.use('/public', express.static('./src/public'));

// Parse Server plays nicely with the rest of your web routes
app.get('/', (req, res) => {
  res.render('test.html', { appId: config.appId, serverUrl: config.serverURL });
});

if (!process.env.TESTING) {
  const api = new ParseServer(config);
  app.use('/parse', api);

  const httpServer = createServer(app);
  const port = 1337;
  httpServer.listen(port, () => {
    console.log(`parse-server-example running on port ${port}.`);
  });
  ParseServer.createLiveQueryServer(httpServer);
}
