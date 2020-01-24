const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Database
const Utility = require('./utility/database')

// Models
const User = require('./models/user')

//----------------------------------------------------------------//
;(async () => {
  try {
    await Utility.connectToMongo()
    const mongoStatus = Utility.getMongoState()
    console.log('Connection Status:', mongoStatus)

    if (mongoStatus === 'ACTIVE') {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(process.env.ROOT_PASSWORD, salt, (error, hash) => {
          if (error) {
            console.log('An error occured creating the root user.', error)
          } else {
            const root = new User({
              _id: new mongoose.Types.ObjectId(),
              email: process.env.ROOT_USER,
              password: hash,
              permissions: ['admin'],
              createdAt: '0'
            })

            root
              .save()
              .then(() => console.log('Root User successfully created.'))
              .catch(error => console.log('An error occured creating the root user.', error))
          }
        })
      })
    }
  } catch (error) {
    console.log('An error occured during setup. Please restart.', error)
  }
})()
