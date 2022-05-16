'use strict'

const { RewriteFrames } = require('@sentry/integrations');
const Sentry = require('@sentry/node');

const express = require('express');
const app = express();
const helmet = require('helmet');
const safeCompare = require('safe-compare');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Game = require('./library/game/index');
const Database = require('./library/database/index');

Sentry.init({
  dsn: 'https://2cb9c4fc490248c2ade5e701ec189e63@o1229006.ingest.sentry.io/6374962',
  tracesSampleRate: 1.0,
  integrations: [
    new RewriteFrames({
      root: global.__dirname,
    }),
  ],
  release: `anomalous-space-bot@v${process.env.npm_package_version}`,
  environment: "production",
});

/* Configure our rest client */
const client = {
  apiSettings: process.env.NODE_ENV === 'prod' ? require('./settings/prod.json') : require('./settings/dev.json'),
  appid: process.env.APPID || 1,
  game: {},
  database: {}
}

app.use(helmet());
app.use(morgan('common'));
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Routing */

// Public endpoints
app.use('/', require('./routes/public/index')(client));

// Auth Middleware
app.use('/', (req, res, next) => {
  if (safeCompare(req.header('secretKey'), client.apiSettings.api.secretKey)) next()
  else return res.status(403).json({ status: 'Unauthorized' })
})

// Private endpoints
app.use('/stats', require('./routes/private/stats')(client));
app.use('/guild', require('./routes/private/guild')(client));
app.use('/user', require('./routes/private/user')(client));
app.use('/warp', require('./routes/private/warp')(client));
app.use('/jump', require('./routes/private/jump')(client));
app.use('/scan', require('./routes/private/scan')(client));
app.use('/map', require('./routes/private/map')(client));
app.use('/mining', require('./routes/private/mining')(client));

/* Listen on http */
app.listen(client.apiSettings.api.port, () => {
  console.log(`API ${client.appid} listening on port ${client.apiSettings.api.port}!`);

  console.log('Attempting to connect to database');

  const db = new Database(client).connect()
    .then(() => {
        client.game = new Game(client);
        client.game.init();

        console.log('Connected database.');
    })
    .catch(() => {
        console.log('Failed to connect to database. Shutting down.');
        process.exit(1);
    })
})