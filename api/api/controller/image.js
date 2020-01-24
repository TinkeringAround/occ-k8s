const mongoose = require('mongoose')

// Models
const Image = require('../models/image')
const Report = require('../models/report')

// Utility
const { serverError } = require('../utility/utility')

//----------------------------------------------------------------//
// GET /images/:imageID
exports.getImage = async (req, res, next) => {
  try {
    // Template = Projektname-Tool-ISODate-Time.Suffix Bsp: IPMA-Staging-ssllabs-2019-09-27-14-41.png

    Image.findById(req.params.imageID)
      .populate('report', 'tag')
      .then(image => {
        const createdAt = new Date(image._id.getTimestamp())
        const fileName =
          (image.report.tag === '' ? '' : image.report.tag + '-') +
          image.suite +
          '-' +
          createdAt.toLocaleTimeString() +
          '.jpeg'

        res.setHeader('Content-Type', 'image/jpeg')
        res.setHeader('Content-Length', image.data.length)
        res.setHeader('Content-disposition', 'attachment; filename="' + fileName + '"')
        res.setHeader('url', image.url)
        res.setHeader('suite', image.suite)

        res.end(image.data)
      })
      .catch(error => serverError(res, 'fetching the image', error))
  } catch (error) {
    return serverError(res, 'fetching the image', error)
  }
}
// DELETE /images/:imageID
exports.deleteImage = async (req, res, next) => {
  try {
    Image.findByIdAndDelete(req.params.imageID)
      .exec()
      .then(image => {
        if (image) {
          return res.status(202).json({
            message: 'Image has been succesfully deleted.',
            data: { imageID: req.params.imageID }
          })
        } else return serverError(res, 'deleting the image', 'No image with provided ID found.')
      })
      .catch(error => serverError(res, 'deleting the image', error))
  } catch (error) {
    return serverError(res, 'deleting the image', error)
  }
}

// POST /images
exports.createImage = async (req, res, next) => {
  if (
    !req.query.hasOwnProperty('reportID') ||
    !req.query.hasOwnProperty('suite') ||
    !req.query.hasOwnProperty('url')
  ) {
    return res.status(400).json({
      message: 'An error occured creating the image.',
      error: 'No information provided!'
    })
  }

  try {
    Report.findById(req.query.reportID)
      .then(report => {
        if (report) {
          const image = new Image({
            _id: new mongoose.Types.ObjectId(),
            suite: req.query.suite,
            report: req.query.reportID,
            data: req.file.buffer,
            url: req.query.url
          })

          image
            .save()
            .then(() => {
              return res.status(201).json({
                message: 'Image has been successfully created.',
                data: { id: image._id }
              })
            })
            .catch(error => serverError(res, 'creating the image', error))
        } else
          return res.status(400).json({
            message: 'An error occured creating the image.',
            error: 'No report with provided report ID found.'
          })
      })
      .catch(error => serverError(res, 'creating the image', error))
  } catch (error) {
    return serverError(res, 'creating the image', error)
  }
}
