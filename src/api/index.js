import { Router } from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Get the current version
import { version } from '../../package.json';

// Caching
import apicache from 'apicache';
let cache = apicache.middleware;
const onlyStatus200 = (req) => req.statusCode === 200;
const cacheSuccesses = cache('5 minutes', onlyStatus200);

// Import our routes
import floods from './routes/floods';
import infrastructure from './routes/infrastructure';
import reports from './routes/reports';

export default ({ config, db, logger }) => {
	let api = Router();

	// Cache successful responses for 5 mins
	api.use(cacheSuccesses);

	// Setup any API level general validation rules
	api.use(validate({
		query: {
			city: Joi.any().valid(config.REGION_CODES),
			format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
			geoFormat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
		}
	}));

	// Return the API version
	// TODO: Perhaps expose some API metadata?
	api.get('/', (req, res) => {
		res.status(200).json({ version });
	});

	// Mount the various endpoints
	api.use('/floods', floods({ config, db, logger }));
	api.use('/infrastructure', infrastructure({ config, db, logger }));
	api.use('/reports', reports({ config, db, logger }));

	// Handle validation errors (wording of messages can be overridden using err.isJoi)
	api.use(validate.errors());

	// Handle not found errors
	api.use((req, res, next) => {
		res.status(404).json({ message: 'URL not found', url: req.url });
	});

	// Handle errors gracefully returning nicely formatted json
	api.use(errorHandler());

	return api;
}
