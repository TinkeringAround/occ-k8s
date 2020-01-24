const mongoose = require('mongoose')
require('dotenv').config()

// URLs
const mongoURL = process.env.MONGO_URL

//----------------------------------------------------------------//
exports.connectToMongo = () => {
  return mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoReconnect: true,
    useUnifiedTopology: true
  })
}

exports.getMongoState = () => {
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
