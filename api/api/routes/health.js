const express = require('express')
const router = express.Router()
const { getMongoState } = require('../utility/database')

//----------------------------------------------------------------//
const MAX_RETRIES = 5
var retries = 0

//----------------------------------------------------------------//
// /
router.get('/', async (req, res, next) => {
  const mongoStatus = getMongoState()
  console.log(`MongoDB-Status: ${mongoStatus}`)

  const dbStatus = mongoStatus === 'ACTIVE'
  var statusCode = 200
  if (!dbStatus) retries += 1
  if (dbStatus && retries > 0) retries = 0
  if (retries >= MAX_RETRIES) statusCode = 500

  return res.status(statusCode).json({
    status: dbStatus ? 'ACTIVE' : 'ERROR',
    owner: 'GINGCO.NET NEW MEDIA',
    timestamp: new Date().toUTCString()
  })
})

module.exports = router
