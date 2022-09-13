// packages
import express, { Request, Response } from 'express'
import { readFileSync } from 'fs'

// swagger
import swaggerUi from 'swagger-ui-express'
// import swaggerOutput from './swagger/swagger-output.json' assert { type: 'json' }
const swaggerOutput = JSON.parse(readFileSync('swagger/swagger-output.json').toString())

// logger
import logger from '../winston/winston.js'

// routes
import apiRouter from './routes/apiRouter.js'

// get config
import * as config from './config/config'
const { SERVER_PORT } = config

// init express
const app = express()

// express setting
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// swagger router
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput))

// api router
app.use('/api', apiRouter)

// any other end-points
app.use(/^\/(.*)/, function (req: Request, res: Response) {
	res.status(404).send('404 Not found.')
})

app.use(function (req: Request, res: Response) {
	res.status(500).send('500 Internal server error.')
})

// start server
app.listen(SERVER_PORT, () => {
	logger.info(`[Express] Server is running on port:${SERVER_PORT}!`)
})
