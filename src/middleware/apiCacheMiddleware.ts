// packages
import { Request, Response, NextFunction } from 'express'

// logger
import logger from '../../winston/winston.js'

// utilities
import { getCache } from '../utils/cacheUtils'

/**
 * check placeid cache
 */
const checkPlaceIdChace = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	// get queries
	const { url } = req.query

	// check url exists
	if (typeof url !== 'string') {
		res.status(400).send('400 Bad request.')
	}

	// decode url
	const decodedUrl = decodeURI(url as string)

	// check url format
	const urlPrefix = 'https://www.google.com/maps/place/'
	if (!decodedUrl.includes(urlPrefix)) {
		res.status(400).send('400 Bad request.')
	}

	// log url
	const logUrl = `${urlPrefix}${decodedUrl.replace(urlPrefix, '').split('/')[0]}/`

	// get cached data
	const cachedData = await getCache(`placeid::${logUrl}`)

	// check cache
	if (!cachedData) {
		// no cache hit
		next()
	} else {
		// logger
		logger.info(`[Redis] placeid cache hit > url::${logUrl}`)

		// cache hit
		res.status(200).json({
			success: true,
			result: {
				placeId: JSON.parse(cachedData),
			},
		})
	}
}

/**
 * check placeinfo cache
 */
const checkPlaceInfoChace = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	// get queries
	const { place_id } = req.query

	// check placeId
	if (!place_id) {
		res.status(400).send('400 Bad request.')
	}

	// get cached data
	const cachedData = await getCache(`placeinfo::${place_id}`)

	// check cache
	if (!cachedData) {
		// no cache hit
		next()
	} else {
		// logger
		logger.info(`[Redis] placeinfo cache hit > place_id::${place_id}`)

		// cache hit
		res.status(200).json({
			success: true,
			result: {
				placeData: JSON.parse(cachedData),
			},
		})
	}
}

/**
 * check placedata cache
 */
const checkPlaceDataChace = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	// get queries
	const { url } = req.query

	// decode url
	const decodedUrl = decodeURI(url as string)

	// check url
	const urlPrefix = 'https://www.google.com/maps/place/'
	if (!decodedUrl.includes(urlPrefix)) {
		res.status(400).send('400 Bad request.')
	}

	// log url
	const logUrl = `${urlPrefix}${decodedUrl.replace(urlPrefix, '').split('/')[0]}/`

	// get cached data
	const cachedData = await getCache(`placedata::${logUrl}`)

	// check cache
	if (!cachedData) {
		// no cache hit
		next()
	} else {
		// logger
		logger.info(`[Redis] placedata cache hit > url::${logUrl}`)

		// cache hit
		res.status(200).json({
			success: true,
			result: {
				placeData: JSON.parse(cachedData),
			},
		})
	}
}

export { checkPlaceIdChace, checkPlaceInfoChace, checkPlaceDataChace }
