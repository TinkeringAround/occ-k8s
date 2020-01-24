const express = require('express')
var router = express.Router()

// Middleware
const checkRedis = require('../middleware/check-Redis')

// Utility
const { getQueue } = require('../utility/database')
const { serverError } = require('../utility/utility')

//----------------------------------------------------------
// POST /reports
router.post('/', checkRedis, async (req, res, next) => {
  if (
    !req.body.hasOwnProperty('reportID') ||
    !req.body.hasOwnProperty('user') ||
    !req.body.hasOwnProperty('url') ||
    !req.body.hasOwnProperty('suites')
  ) {
    return res.status(400).json({
      message: 'An error occured creating the job.',
      error: 'No information provided!'
    })
  }

  try {
    const queue = getQueue()
    const job = await queue.add('report', {
      reportID: req.body.reportID,
      user: req.body.user,
      url: req.body.url,
      suites: req.body.suites
    })

    if (job) {
      return res.status(201).json({
        message: 'Report has been created.',
        data: {}
      })
    } else {
      return serverError(res, 'creating the job', 'No redis connection.')
    }
  } catch (error) {
    return serverError(res, 'creating the job', error)
  }
})

// DELETE /reports/reportID
router.delete('/:reportID', checkRedis, async (req, res, next) => {
  try {
    const queue = getQueue()
    const jobs = await queue.getJobs()
    jobs.forEach(async job => {
      if (job.data.reportID == req.params.reportID) {
        const state = await job.getState()
        if (state != 'active') job.remove()
      }
    })

    return res.status(202).json({
      message: 'Job has been succesfully cancelled.',
      data: { reportID: req.params.reportID }
    })
  } catch (error) {
    return serverError(res, 'deleting the job', error)
  }
})

module.exports = router
