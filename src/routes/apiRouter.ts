// packages
import express, { Router } from 'express'
import { graphqlHTTP } from 'express-graphql'

// graphql
import placeSchema from '../graphql/schema/placeSchema'
import placeResolver from '../graphql/resolver/placeResolver'

// middlewares
import {
	checkPlaceIdCache,
	checkPlaceInfoCache,
	checkPlaceDataCache,
} from '../middleware/apiCacheMiddleware'

// controllers
import {
	placeDataController,
	placeIdController,
	placeInfoController,
} from '../controller/apiController'

// get express router
const router: Router = express.Router()

// routes
/**
 * get place id from google map url
 */
router.get('/placeid', checkPlaceIdCache, placeIdController)

/**
 * get place detail info by placeid
 */
router.get('/placeinfo', checkPlaceInfoCache, placeInfoController)

/**
 * get place data from google map url
 */
router.get('/placedata', checkPlaceDataCache, placeDataController)

/**
 * get place data from google map url with graphql query
 */
router.use(
	'/graphql',
	graphqlHTTP({
		schema: placeSchema,
		rootValue: placeResolver,
		customFormatErrorFn: (err) => {
			const error = JSON.parse(err.message)
			return {
				...error,
			}
		},
		graphiql: true,
	})
)

export default router
