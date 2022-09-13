// redis database
import { client } from '../db/redisDB'

// get config
import * as config from '../config/config'
const { CACHE_EXPIRE } = config

// get cache
const getCache = async (key: string): Promise<string | null> => {
	// get cached data
	const cachedData = await client.get(key)

	// return result
	return cachedData
}

// set cache
const setCache = async (key: string, data: object | string): Promise<void> => {
	// set cache data
	await client.SETEX(key, parseInt(CACHE_EXPIRE as string), JSON.stringify(data))
}

export { getCache, setCache }
