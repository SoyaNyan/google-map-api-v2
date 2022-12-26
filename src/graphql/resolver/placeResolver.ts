// logger
import logger from '../../../winston/winston.js'

// utilities
import { getPlaceData, FormattedPlaceDataType } from '../../utils/placeUtils'
import { getCache, setCache } from '../../utils/cacheUtils'

// place data resolver
const placeResolver = {
	placedata: async ({ url, cache = true }: { url: string; cache: boolean }) => {
		// decode url
		const decodedUrl = decodeURI(url as string)

		// check url
		const urlPrefix = 'https://www.google.com/maps/place/'
		if (!decodedUrl.includes(urlPrefix)) {
			throw new Error(
				JSON.stringify({
					code: 400,
					message: 'Bad request.',
				})
			)
		}

		// log url
		const logUrl = `${urlPrefix}${decodedUrl.replace(urlPrefix, '').split('/')[0]}/`

		// logger
		logger.info(`[GraphQL Request] placedata request > url::${logUrl}`)

		// check cache option
		if (cache) {
			// get cached data
			const cachedData = await getCache(`placedata::${logUrl}`)

			// check cache
			if (cachedData) {
				// logger
				logger.info(`[Redis] placedata cache hit > url::${logUrl}`)

				// return cached data
				return JSON.parse(cachedData)
			}
		}

		// get place data
		const data = await getPlaceData(decodedUrl)

		// check result
		if (!data) {
			// logger
			logger.error(`[GraphQL Request] Failed to fetch place data.`)

			throw new Error(
				JSON.stringify({
					code: 200,
					message: 'No match data.',
				})
			)
		}

		// set cache
		await setCache(`placedata::${logUrl}`, data as FormattedPlaceDataType)

		// logger
		logger.info(`[Redis] placedata cache created > url::${logUrl}`)

		// return data
		return data
	},
}

export default placeResolver
