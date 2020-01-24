const { getMongoState } = require('../utility/database')

//----------------------------------------------------------------//
module.exports = async (req, res, next) => {
  try {
    var dbReady = getMongoState()
    if (dbReady === 'ACTIVE') next()
    else {
      return res.status(500).json({
        message: 'No connection to Mongo DB.'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'No connection to Mongo DB.'
    })
  }
}
