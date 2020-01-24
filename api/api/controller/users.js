require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Models
const User = require('../models/user')

// Utility
const { contains, serverError } = require('../utility/utility')

//----------------------------------------------------------------//
// POST users/login
exports.login = (req, res, next) => {
  if (!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
    return res.status(400).json({
      message: 'An error occured at login.',
      error: 'No information provided.'
    })
  }

  try {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(400).json({
            message: 'An error occured at login.',
            error: 'No valid information provided.'
          })
        }

        bcrypt.compare(req.body.password, user[0].password, (error, result) => {
          if (error || !result) {
            return res.status(401).json({
              message: 'An error occured at login.',
              error: 'Unauthorized.'
            })
          }

          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                expiresIn: '1h'
              }
            )

            return res.status(200).json({
              message: 'Login has been successful.',
              data: { token: token }
            })
          }
        })
      })
      .catch(error => serverError(res, 'at login', error))
  } catch (error) {
    return serverError(res, 'at login', error)
  }
}

//----------------------------------------------------------------//
// GET users/auth
exports.checkAuthStatus = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_KEY)
    return res.status(200).json({
      message: 'Authentication Check was successful.',
      data: { tokenIsValid: true }
    })
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication Check has failed.',
      data: { tokenIsValid: false }
    })
  }
}

//----------------------------------------------------------------//
// GET users/:userID
exports.getUser = (req, res, next) => {
  if (req.params.userID != req.userData.userId) {
    return res.status(403).json({
      message: 'An error occured retriving the user.',
      error: 'Forbidden.'
    })
  }

  try {
    User.findById(req.params.userID, 'email permissions')
      .exec()
      .then(user => {
        return res.status(200).json({
          email: user.email,
          createdAt: user.createdAt,
          permissions: user.permissions
        })
      })
      .catch(error => serverError(res, 'fetching the user', error))
  } catch (error) {
    return serverError(res, 'fetching the user', error)
  }
}
// PUT users/:userID
exports.updateUser = (req, res, next) => {
  if (
    !req.body.hasOwnProperty('password') &&
    !req.body.hasOwnProperty('email') &&
    !req.body.hasOwnProperty('permissions')
  )
    return res.status(400).json({
      message: 'An error occured updating user.',
      error: 'No information provided.'
    })

  try {
    User.findById(req.userData.userId)
      .exec()
      .then(async user => {
        // 1. Admin Updates Permissions of user
        if (
          contains(user.permissions, ['admin']) &&
          req.userData.userId != req.params.userID &&
          req.body.hasOwnProperty('email') &&
          req.body.hasOwnProperty('permissions')
        ) {
          User.find({ email: req.body.email })
            .exec()
            .then(toUpdateUser => {
              if (toUpdateUser.length > 0) {
                toUpdateUser[0]
                  .updateOne({ permissions: req.body.permissions })
                  .then(() => {
                    return res.status(201).json({
                      message: 'User successfully updated.',
                      data: {}
                    })
                  })
                  .catch(error => serverError(res, 'updating the user', error))
              } else {
                return res.status(400).json({
                  message: 'An error occured updating user.',
                  error: 'No information provided.'
                })
              }
            })
          // 2. User updates his own password or email
        } else if (req.userData.userId === req.params.userID) {
          var updates = {}

          // password
          if (req.body.hasOwnProperty('password')) {
            await new Promise((resolve, reject) => {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (error, hash) => {
                  if (error) {
                    return serverError(res, 'updating the user', error)
                  } else {
                    updates = { password: hash }
                    resolve()
                  }
                })
              })
            })
          }

          // email
          if (req.body.hasOwnProperty('email')) {
            updates = { email: req.body.email, ...updates }
          }

          // Update
          user
            .updateOne(updates)
            .then(() => {
              return res.status(201).json({
                message: 'User successfully updated.',
                data: {}
              })
            })
            .catch(error => serverError(res, 'updating the user', error))
          // 3. Unknown parameter combination
        } else {
          return res.status(400).json({
            message: 'An error occured updating user.',
            error: 'Bad request.'
          })
        }
      })
      .catch(error => serverError(res, 'updating the user', error))
  } catch (error) {
    return serverError(res, 'updating the user', error)
  }
}

//----------------------------------------------------------------//
// POST users/
exports.createUser = (req, res, next) => {
  if (
    !req.body.hasOwnProperty('email') ||
    !req.body.hasOwnProperty('password') ||
    !req.body.hasOwnProperty('permissions')
  ) {
    return res.status(400).json({
      message: 'An error occured signing up a new user.',
      error: 'No information provided.'
    })
  }

  try {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: 'An error occured signing up a new user.',
            error: 'No valid information provided.'
          })
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (error, hash) => {
              if (error) {
                return serverError(res, 'creating a user', error)
              } else {
                const user = new User({
                  _id: new mongoose.Types.ObjectId(),
                  email: req.body.email,
                  password: hash,
                  permissions: req.body.permissions
                })

                user
                  .save()
                  .then(() => {
                    return res.status(201).json({
                      message: 'User has been created.',
                      data: {}
                    })
                  })
                  .catch(error => serverError(res, 'creating a user', error))
              }
            })
          })
        }
      })
      .catch(error => serverError(res, 'creating a user', 'No valid user found, ' + error))
  } catch (error) {
    return serverError(res, 'creating a user', error)
  }
}
// GET users/
exports.getUsers = (req, res, next) => {
  try {
    User.find({}, 'email permissions')
      .sort({ _id: 'asc' })
      .then(users => res.status(200).json(users))
      .catch(error => serverError(res, 'fetching the users', error))
  } catch (error) {
    return serverError(res, 'fetching the users', error)
  }
}
