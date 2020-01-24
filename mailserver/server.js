const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()

// Routes
const healthRoutes = require('./routes/health')
const mailRoutes = require('./routes/mail')

//----------------------------------------------------------
const PORT = process.env.PORT

//----------------------------------------------------------
;(async () => {
  try {
    // Setup Express App
    var app = express()
    app.use(morgan('dev'))
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    // Setup Routes
    app.use('/api/v1', healthRoutes)
    app.use('/api/v1/mails', mailRoutes)

    // Setup Server
    const server = http.createServer(app)
    server.listen(PORT)

    console.log('Server is listening on PORT ', PORT)
  } catch (error) {
    console.log(error)
  }
})()
