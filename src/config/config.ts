// packages
import * as dotenv from 'dotenv'
import * as path from 'path'

// get config
dotenv.config({ path: path.join(__dirname, './.env') })
const {
	NODE_ENV,
	SERVER_PORT,
	GOOGLE_API_KEY,
	REDIS_PASSWD,
	REDIS_ENDPOINT,
	REDIS_PORT,
	CACHE_EXPIRE,
} = process.env

export {
	NODE_ENV,
	SERVER_PORT,
	GOOGLE_API_KEY,
	REDIS_PASSWD,
	REDIS_ENDPOINT,
	REDIS_PORT,
	CACHE_EXPIRE,
}
