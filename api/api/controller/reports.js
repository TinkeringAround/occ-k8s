require('dotenv').config()
const mongoose = require('mongoose')

// Services
const { createReport, cancelReport } = require('../services/worker')

// Models
const Report = require('../models/report')
const User = require('../models/user')
const Image = require('../models/image')

// Utility
const { serverError } = require('../utility/utility')

//----------------------------------------------------------------//
// GET /reports
exports.getReports = (req, res, next) => {
  try {
    // Filter Options
    var conditions = req.query.hasOwnProperty('url') ? { url: req.query.url } : {}
    conditions = req.query.hasOwnProperty('tag')
      ? { ...conditions, tag: req.query.tag }
      : conditions
    const limit = req.query.hasOwnProperty('limit') ? parseInt(req.query.limit) : 20
    const page = req.query.hasOwnProperty('page') ? parseInt(req.query.page) : 1
    const sort = req.query.hasOwnProperty('sort') ? req.query.sort : 'desc'

    Report.find(conditions, 'url status tag')
      .populate('createdBy')
      .sort({ _id: sort })
      .then(reports => {
        if (reports.length >= 1) {
          var resultReports = Array.from(reports)

          if (reports.length > limit * (page - 1) && reports.length < limit * page)
            resultReports = resultReports.slice(limit * (page - 1), resultReports.length)
          else if (reports.length > limit * (page - 1) && reports.length > limit * page)
            resultReports = resultReports.slice(limit * (page - 1), limit * page)
          else
            return res.status(400).json({
              message: 'No reports found. Bad Pagination.',
              data: {
                count: 0,
                reports: []
              }
            })

          return res.status(200).json({
            message: 'Reports successfully fetched.',
            data: {
              count: reports.length,
              reports: resultReports.map(report => {
                return {
                  _id: report._id,
                  url: report.url,
                  createdAt: new Date(report._id.getTimestamp().toUTCString()),
                  status: report.status,
                  tag: report.tag,
                  createdBy: report.createdBy.email
                }
              })
            }
          })
        } else
          return res.status(400).json({
            message: 'No reports found for provided URL.',
            data: {
              count: 0,
              reports: []
            }
          })
      })
      .catch(error => serverError(res, 'retriving the reports', error))
  } catch (error) {
    return serverError(res, 'retriving the reports', error)
  }
}
// POST /reports
exports.createReport = async function(req, res, next) {
  if (!req.body.hasOwnProperty('url') || !req.body.hasOwnProperty('suites')) {
    return res.status(400).json({
      message: 'An error occured creating the report.',
      error: 'No information provided!'
    })
  }

  try {
    // Check if user is valid and retrieve it for its email
    const users = await User.findById(req.userData.userId).exec()
    if (users) {
      const report = new Report({
        _id: new mongoose.Types.ObjectId(),
        url: req.body.url,
        createdBy: req.userData.userId,
        status: 'PENDING',
        tag: '',
        createdAt: new Date().toUTCString()
      })

      report
        .save()
        .then(async () => {
          createReport(
            report._id,
            req.userData.email,
            report.url,
            req.body.hasOwnProperty('suites') ? req.body.suites : []
          )
            .then(() => {
              return res.status(201).json({
                message: 'Report has been successfully created.',
                data: {
                  reportID: report._id,
                  url: report.url,
                  status: report.status,
                  createdAt: report.createdAt
                }
              })
            })
            .catch(async () => {
              await report.remove()
              return serverError(res, 'creating the report', 'OCC-Worker Job creation has failed.')
            })
        })
        .catch(error => serverError(res, 'saving the report', error))
    } else {
      return serverError(res, 'saving the report', 'User ID not found.')
    }
  } catch (error) {
    return serverError(res, 'saving the report', error)
  }
}

//----------------------------------------------------------------//
// GET /reports/:reportID
exports.getReport = (req, res, next) => {
  try {
    Report.findById(req.params.reportID, 'url createdAt createdBy status tag')
      .populate('createdBy')
      .then(async report => {
        var reports = []

        const images = await Image.find({ report: req.params.reportID }, 'suite').sort('suite')
        if (images.length > 0) {
          images.forEach(image => {
            var report = reports.find(rp => rp.name === image.suite)
            if (report) report.images = [...report.images, image._id]
            else reports.push({ name: image.suite, images: [image._id] })
          })
        }

        return res.status(200).json({
          message: 'Report successfully retrieved.',
          data: {
            report: {
              url: report.url,
              createdAt: new Date(report._id.getTimestamp()).toUTCString(),
              createdBy: report.createdBy.email,
              status: report.status,
              tag: report.tag,
              reports: reports
            }
          }
        })
      })
      .catch(() => serverError(res, 'retriving the report', 'No report with provided ID found.'))
  } catch (error) {
    return serverError(res, 'retriving the report', error)
  }
}
// PUT /reports/:reportID
exports.updateReport = (req, res, next) => {
  try {
    var update = {}

    if (req.body.hasOwnProperty('tag')) update = { tag: req.body.tag, ...update }
    if (req.body.hasOwnProperty('status')) update = { status: req.body.status, ...update }
    if (req.body.hasOwnProperty('reports')) update = { reports: req.body.reports, ...update }

    Report.findByIdAndUpdate(req.params.reportID, update, { useFindAndModify: false })
      .then(() => {
        return res.status(201).json({
          message: 'Report successfully updated.',
          data: update
        })
      })
      .catch(error => serverError(res, 'updating the report', error))
  } catch (error) {
    return serverError(res, 'updating the report', error)
  }
}
// DELETE /reports/:reportID
exports.deleteReport = async (req, res, next) => {
  try {
    Report.findById(req.params.reportID)
      .exec()
      .then(async report => {
        // Delete Job via OCC-Worker API
        cancelReport(req.params.reportID)

        // Delete all Report Images
        const images = await Image.find({ report: req.params.reportID })
        await Promise.all(
          images.map(async image => {
            return await image.remove()
          })
        )

        // Delete Report itself
        report
          .remove()
          .then(() => {
            return res.status(202).json({
              message: 'Report has been succesfully deleted.',
              data: { reportID: req.params.reportID }
            })
          })
          .catch(error => serverError(res, 'deleting the report', error))
      })
      .catch(error => serverError(res, 'deleting the report', error))
  } catch (error) {
    return serverError(res, 'deleting the report', error)
  }
}
