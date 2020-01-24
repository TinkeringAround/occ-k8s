const express = require('express')
const router = express.Router()
var multer = require('multer')
var upload = multer()

// Middleware
const checkAuth = require('../middleware/check-Auth')
const checkMongo = require('../middleware/check-Mongo')

// Controller
const ImageController = require('../controller/image')

//----------------------------------------------------------------//
// /images/:imageID
router.get('/:imageID', checkMongo, ImageController.getImage)
router.delete('/:imageID', checkMongo, checkAuth, ImageController.deleteImage)

// /images
router.post('/', checkMongo, upload.single('image'), ImageController.createImage)

module.exports = router
