const express = require('express')
const router = express.Router()

// Middleware
const checkAuth = require('../middleware/check-Auth')
const checkMongo = require('../middleware/check-Mongo')
const checkWorker = require('../middleware/check-Worker')

// Controller
const ReportController = require('../controller/reports')

//----------------------------------------------------------------//
// /reports
router.get('/', checkAuth, checkMongo, ReportController.getReports)
router.post('/', checkAuth, checkMongo, checkWorker, ReportController.createReport)

// /reports/:reportID
router.get('/:reportID', checkMongo, ReportController.getReport)
router.delete('/:reportID', checkAuth, checkMongo, ReportController.deleteReport)
router.put('/:reportID', checkMongo, ReportController.updateReport) // TODO: Check-Auth?

module.exports = router
