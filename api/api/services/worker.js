require('dotenv').config()
const axios = require('axios')

//----------------------------------------------------------------//
const worker = axios.create({
  baseURL: process.env.OCC_WORKER_URL,
  timeout: 5000
})

//----------------------------------------------------------------//
exports.isAvailable = () => {
  return new Promise(resolve => {
    worker
      .get('')
      .then(() => {
        console.log('OCC-Worker is available.')
        resolve(true)
      })
      .catch(() => {
        console.log('OCC-Worker is inactive.')
        resolve(false)
      })
  })
}

exports.createReport = (reportID, email, url, suites) => {
  return new Promise((resolve, reject) => {
    worker
      .post('/reports', {
        reportID: reportID,
        user: email,
        url: url,
        suites: suites
      })
      .then(() => {
        console.log('OCC-Worker Job creation was successful for report with ID: ', reportID)
        resolve()
      })
      .catch(error => {
        console.log(
          'OCC-Worker Job creation has failed for report with ID: ' + reportID + ', ',
          error
        )
        reject()
      })
  })
}

exports.cancelReport = reportID => {
  return new Promise(resolve => {
    worker
      .delete('/reports/' + reportID)
      .then(() => {
        console.log('OCC-Worker: Successfully cancelled or ignored the DELETE, ', reportID)
        resolve()
      })
      .catch(error => {
        console.log(
          'OCC-Worker: An error occured trying to delete report with ID: ' + reportID + ': ',
          error
        )
        resolve()
      })
  })
}
