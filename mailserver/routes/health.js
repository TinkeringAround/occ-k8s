const express = require('express')
const router = express.Router()
var moment = require('moment')

//----------------------------------------------------------------//
// /
router.get('/', async (req, res, next) => {
  return res.status(200).json({
    status: 'ACTIVE',
    owner: 'GINGCO.NET NEW MEDIA',
    timestamp:
      moment()
        .add(2, 'hour')
        .format('HH.mm') +
      ' Uhr, ' +
      moment()
        .add(2, 'hour')
        .format('DD.MM.YYYY')
  })
})

module.exports = router
