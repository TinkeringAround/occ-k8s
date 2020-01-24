const express = require('express')
const router = express.Router()
require('dotenv').config()

const sendmail = require('sendmail')({
  silent: true,
  smtpPort: process.env.MAIL_SERVER_PORT,
  smtpHost: process.env.MAIL_SERVER_HOST
})

//----------------------------------------------------------------//
// /mails
router.post('/', async (req, res, next) => {
  if (
    !req.body.hasOwnProperty('receiver') ||
    !req.body.hasOwnProperty('subject') ||
    !req.body.hasOwnProperty('content')
  ) {
    return res.status(400).json({
      message: 'An error occured sending the mail.',
      error: 'No information provided!'
    })
  }

  try {
    sendmail(
      {
        from: process.env.MAIL_SENDER,
        to: req.body.receiver,
        subject: req.body.subject,
        text: req.body.content
      },
      function(error) {
        if (error) {
          console.log('An error occured sending the mail.', error)
          return res.status(500).json({
            message: 'An error occured sending the mail.',
            error: error
          })
        } else {
          return res.status(200).json({
            message: 'The email was successfully sent.',
            data: {
              from: process.env.MAIL_SENDER,
              to: req.body.receiver,
              subject: req.body.subject
            }
          })
        }
      }
    )
  } catch (error) {
    console.log('An error occured sending the mail.', error)
    return res.status(500).json({
      message: 'An error occured sending the mail.',
      error: error
    })
  }
})

module.exports = router
