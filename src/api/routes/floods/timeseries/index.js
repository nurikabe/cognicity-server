/**
 * CogniCity Server /floods timeseries endpoint
 * @module src/api/floods/timeseries/index
 **/
import {Router} from 'express';

// Import our data model
import timeseries from './model';

// Import any required utility functions
import {cacheResponse} from '../../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import validate from 'celebrate';
import Moment from 'moment';

/**
 * Endpoint specification for floods timeseries data
 * @alias module:src/api/floods/timeseries/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for route
 */
export default ({config, db, logger}) => {
  let api = Router(); // eslint-disable-line new-cap

  // Just get the states without the geographic boundaries
  api.get('/', cacheResponse('1 minute'),
    validate({
      query: {
        start: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').required(),
        end: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ')
          .min(Joi.ref('start')).required(),
      },
    }),
    (req, res, next) => {
      timeseries(config, db, logger).count(req.query.start, req.query.end)
        .then((data) => res.status(200).json({statusCode: 200, result: data}))
        .catch((err) => {
          /* istanbul ignore next */
          logger.error(err);
          /* istanbul ignore next */
          next(err);
        });
    }
  );
  return api;
};
