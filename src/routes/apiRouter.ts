// packages
import express, { Router } from 'express'

// middlewares
import {
	checkPlaceIdChace,
	checkPlaceInfoChace,
	checkPlaceDataChace,
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
router.get('/placeid', checkPlaceIdChace, placeIdController)

/**
 * get place detail info by placeid
 */
router.get('/placeinfo', checkPlaceInfoChace, placeInfoController)

/**
 * get place data from google map url
 */
router.get('/placedata', checkPlaceDataChace, placeDataController)

export default router
