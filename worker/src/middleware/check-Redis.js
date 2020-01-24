// Utility
const { getRedisState } = require('../utility/database')
const { serverError } = require('../utility/utility')

//----------------------------------------------------------------//
module.exports = async (req, res, next) => {
  try {
    const dbStatus = await getRedisState()
    if (dbStatus === 'ACTIVE') next()
    else {
      return serverError(res, 'creating the job', 'Missing database connection to redis.')
    }
  } catch (error) {
    return serverError(res, 'creating the job', 'Missing database connection to redis.')
  }
}
