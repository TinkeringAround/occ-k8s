// Services
const { isAvailable } = require('../services/worker')

//----------------------------------------------------------------//
module.exports = async (req, res, next) => {
  try {
    const workerIsAvailable = await isAvailable()
    if (workerIsAvailable) next()
    else {
      return res.status(500).json({
        message: 'No worker active to process job.'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'No worker active to process job.'
    })
  }
}
