const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()

// Middleware
const checkAuth = require('../middleware/check-Auth')
const checkMongo = require('../middleware/check-Mongo')
const checkAdmin = require('../middleware/check-Admin')
const updateUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // start blocking after 5 requests
  message: 'Too many accounts updated from this IP, please try again after an hour'
})

// Controller
const UserController = require('../controller/users')

//----------------------------------------------------------------//
// /users/login
router.post('/login', checkMongo, UserController.login)

// /users/auth
router.get('/auth', UserController.checkAuthStatus)

// /users/:userID
router.get('/:userID', checkMongo, checkAuth, UserController.getUser)
router.put('/:userID', updateUserLimiter, checkMongo, checkAuth, UserController.updateUser)

// /users
router.post('/', checkMongo, checkAuth, checkAdmin, UserController.createUser)
router.get('/', checkMongo, checkAuth, checkAdmin, UserController.getUsers)

module.exports = router
