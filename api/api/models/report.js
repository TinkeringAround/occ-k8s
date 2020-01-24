const mongoose = require('mongoose')

const reportSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: { type: String, require: true },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    require: true
  },
  tag: { type: String },
  status: { type: String, required: true }
})

module.exports = mongoose.model('Report', reportSchema)
