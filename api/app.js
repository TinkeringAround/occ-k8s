const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Database
const { connectToMongo } = require('./api/utility/database')

// Routes
const healthRoutes = require('./api/routes/health')
const suitesRoutes = require('./api/routes/suites')
const userRoutes = require('./api/routes/users')
const reportRoutes = require('./api/routes/reports')
const imageRoutes = require('./api/routes/images')

//----------------------------------------------------------------//
// Database Setup
async function setupApp() {
  try {
    var app = null
    var setupError = null

    // Database Connection
    mongoose.Promise = global.Promise
    await connectToMongo()
    console.log('Connecting to mongo was successful.')

    // Setup Express App
    app = express()

    // Settings
    app.set('trust proxy', 1)

    // Middleware
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // TODO: reduce for production
    })
    app.use('/', apiLimiter)
    app.use(morgan('dev'))
    app.use(helmet())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    // CORS
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      )
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
      }
      next()
    })

    // Routes
    app.use('/api/v1/', healthRoutes)
    app.use('/api/v1/suites', suitesRoutes)
    app.use('/api/v1/images', imageRoutes)
    app.use('/api/v1/users', userRoutes)
    app.use('/api/v1/reports', reportRoutes)

    // Error Handling
    app.use((req, res, next) => {
      const error = new Error('Path not found.')
      error.status = 404
      next(error)
    })

    app.use((error, req, res, next) => {
      res.status(error.status || 500)
      res.json({
        error: error.message
      })
    })

    return {
      app: app,
      error: setupError
    }
  } catch (error) {
    setupError = error
    console.log('An error occured connecting to mongo database.', error)
    return {
      app: app,
      error: setupError
    }
  }
}

//----------------------------------------------------------------//
module.exports = setupApp
