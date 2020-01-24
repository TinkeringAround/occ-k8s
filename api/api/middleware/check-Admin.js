// Models
const User = require('../models/user')

// Utility
const { contains, serverError } = require('../utility/utility')

//----------------------------------------------------------------//
module.exports = (req, res, next) => {
  try {
    User.findById(req.userData.userId)
      .then(user => {
        if (contains(user.permissions, ['admin'])) next()
        else {
          return res.status(401).json({
            message: 'No valid permissions. Please refer to an admin for this operation.'
          })
        }
      })
      .catch(error => serverError(res, 'checking user permissions', error))
  } catch (error) {
    console.log('An error occured checking user permissions: ', error)
    return res.status(401).json({
      message: 'No necessary permissions. Please refer to an admin for this operation.'
    })
  }
}
