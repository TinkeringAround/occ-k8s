const mongoose = require('mongoose')
require('dotenv').config()

// URLs
const mongoURL = process.env.MONGO_URL
mongoose.Promise = global.Promise

//----------------------------------------------------------------//
const connectToMongo = () => {
  return mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoReconnect: true,
    useUnifiedTopology: true
  })
}

const getMongoState = () => {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'DISCONNECTED'
    case 1:
      return 'ACTIVE'
    case 2:
      return 'CONNECTING'
    case 3:
      return 'DISCONNECTING'
    default:
      return 'UNKNOWN'
  }
}

//----------------------------------------------------------------//
module.exports = {
  connectToMongo,
  getMongoState
}
