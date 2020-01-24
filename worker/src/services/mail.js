require('dotenv').config()
const mailserver = require('axios').create({
  baseURL: process.env.MAILSERVER_URL,
  timeout: 5000
})

//----------------------------------------------------------
exports.sendMail = async (user, url, reportID, success) =>
  new Promise(resolve => {
    mailserver
      .post('/mails', {
        receiver: user,
        subject: `Dein Oneclick-Check für ${url} war ${success ? '' : 'nicht '} erfolgreich.`,
        content: template(url, reportID)
      })
      .then(response => {
        console.log('OCC-Mailserver: Email was successfully sent, ', response.data)
        resolve()
      })
      .catch(() => {
        console.log('OCC-Mailserver: Email could not be sent.')
        resolve()
      })
  })

//----------------------------------------------------------
const template = (url, reportID) =>
  `Die Ergebnisse für ${url} können nun unter https://occ.k8s.gingco.net/reports/${reportID} eingesehen werden.`
