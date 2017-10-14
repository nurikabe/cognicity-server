/**
  * CogniCity Data Server Module
  * @module server
  * Core server module
  **/
// Import
import Promise from 'bluebird';

// Express middleware and http
import express from 'express';
import http from 'http';

// Import express middlewares
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import responseTime from 'response-time';
import morgan from 'morgan'; // Express logging

/**
 * Initialize the server
 * @function init
 * @param {Object} config - configuration
 * @param {Object} initializeDb - database initialization
 * @param {Object} routes - routes
 * @param {Object} logger - logger
 * @return {Object} - Express server application
 **/
const init = (config, initializeDb, routes, logger) =>
  new Promise((resolve, reject) => {
  // Create the server
  let app = express();
  app.server = http.createServer(app);

  // Winston stream function for express so we can capture logs
  const winstonStream = {
    write: function(message) {
      logger.info(message.slice(0, -1));
    },
  };

  // Setup express logger
  app.use(morgan('combined', {stream: winstonStream}));

  // Compress responses if required but only if caching is disabled
  if (config.COMPRESS && !config.CACHE) {
    app.use(compression());
  }

  // Provide CORS support (not required if behind API gateway)
  if (config.CORS) {
    app.use(cors({exposedHeaders: config.CORS_HEADERS}));
  }

  // Provide response time header in response
  if (config.RESPONSE_TIME) {
    app.use(responseTime());
  }

  // Parse body messages into json
  app.use(bodyParser.json({limit: config.BODY_LIMIT}));

  // Try and connect to the db
  initializeDb(config, logger)
    .then((db) => {
      // Log debug message
      logger.debug('Successfully connected to DB');

      // Mount the routes
      app.use('/', routes({config, db, logger}));

      // App is ready to go, resolve the promise
      resolve(app);
    })
    .catch((err) => {
      /* istanbul ignore next */
      logger.error('DB Connection error: ' + err);
      /* istanbul ignore next */
      logger.error('Fatal error: Application shutting down');
      /* istanbul ignore next */
      // We cannot continue without a DB, reject
      reject(err);
    });
});

// Export the init function for use externally
module.exports = {init};
