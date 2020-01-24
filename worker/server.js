const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()

// Routes
const healthRoutes = require('./src/routes/health')
const reportRoutes = require('./src/routes/reports')

// Controller
const { setupPuppeteer } = require('./src/controllers/puppeteer')
const { createReport } = require('./src/controllers/report')

// Utility
const { connectToRedis, getRedisState, getQueue } = require('./src/utility/database')

//----------------------------------------------------------
const PORT = process.env.PORT
var workerStatus = 'WAITING'

//----------------------------------------------------------
;(async () => {
  try {
    // Setup Databases
    await connectToRedis()
    const redisStatus = await getRedisState()
    if (redisStatus != 'ACTIVE')
      throw new Error('An error occured during database setup. Please restart the server.')

    // Setup Puppeteer
    const ptStatus = await setupPuppeteer()
    if (!ptStatus)
      throw new Error('An error occured during puppeteer setup. Please restart the server.')

    // Setup Worker Job Handling
    var queue = getQueue()
    queue.process('report', createReport)
    queue.on('active', () => (workerStatus = 'WORKING'))
    queue.on('completed', () => (workerStatus = 'WAITING'))

    // Setup Express App
    var app = express()
    app.use(morgan('dev'))
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    // Setup Routes
    app.use(
      '/api/v1',
      (req, res, next) => {
        req.workerStatus = workerStatus
        next()
      },
      healthRoutes
    )
    app.use('/api/v1/reports', reportRoutes)

    // Setup Server
    const server = http.createServer(app)
    server.listen(PORT)

    console.log('Connecting to databases was successful.')
    console.log('Server is listening on PORT ', PORT)
  } catch (error) {
    console.log(error)
  }
})()
