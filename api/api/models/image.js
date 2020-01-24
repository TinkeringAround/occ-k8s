const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  report: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Report',
    require: true
  },
  data: { type: Buffer, required: true },
  suite: { type: String, require: true },
  url: { type: String, require: true }
})

module.exports = mongoose.model('Image', imageSchema)
