require('dotenv').config()
const fs = require('fs')
const axios = require('axios')
var FormData = require('form-data')

//----------------------------------------------------------
const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 5000
})

//----------------------------------------------------------
exports.updateStatus = (reportID, status) => {
  return new Promise(resolve => {
    api
      .put('/reports/' + reportID, {
        status: status
      })
      .then(() => {
        console.log('Report status successfully updated.')
        resolve()
      })
      .catch(() => {
        console.log('Report status could not be updated.')
        resolve()
      })
  })
}

exports.createImage = (reportID, url, suite, file) => {
  return new Promise(resolve => {
    const formData = new FormData()
    formData.append('image', fs.createReadStream(file))

    api
      .post('/images?reportID=' + reportID + '&url=' + url + '&suite=' + suite, formData, {
        headers: formData.getHeaders()
      })
      .then(() => {
        fs.unlinkSync(file)
        resolve('Image report for ' + url + ' was successfully created.')
      })
      .catch(error => {
        fs.unlinkSync(file)
        resolve('An error occured creating image report for url ' + url + ': ', error)
      })
  })
}
