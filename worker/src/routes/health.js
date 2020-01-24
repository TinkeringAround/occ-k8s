const express = require('express')
var router = express.Router()

// Utility
const { getRedisState } = require('../utility/database')

//----------------------------------------------------------
const MAX_RETRIES = 5
var retries = 0

//----------------------------------------------------------
router.get('/', async (req, res, next) => {
  const redisState = await getRedisState()

  var statusCode = 200
  if (redisState !== 'ACTIVE') retries += 1
  if (redisState == 'ACTIVE' && retries > 0) retries = 0
  if (retries >= MAX_RETRIES) statusCode = 500

  return res.status(statusCode).json({
    status: redisState === 'ACTIVE' ? req.workerStatus : 'ERROR',
    owner: 'GINGCO.NET NEW MEDIA',
    timestamp: new Date().toUTCString()
  })
})

module.exports = router
