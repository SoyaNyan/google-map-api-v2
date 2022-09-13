// packages
import * as redis from 'redis'

// logger
import logger from '../../winston/winston.js'

// get config
import * as config from '../config/config'
const { REDIS_ENDPOINT, REDIS_PORT, REDIS_PASSWD } = config

// init redis client
const clientOptions: redis.RedisClientOptions = {
	socket: {
		host: REDIS_ENDPOINT,
		port: parseInt(REDIS_PORT as string),
	},
	password: REDIS_PASSWD,
}
const client = redis.createClient(clientOptions)

// on error
client.on('error', (err) => {
	logger.error(`[Redis] ${err}`)
})

// on ready
client.on('ready', () => {
	logger.info(`[Redis] Redis cache server is running!`)
})

// connect database
client.connect()

export { client }
