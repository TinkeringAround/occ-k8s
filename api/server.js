const http = require('http')
const setupApp = require('./app')
require('dotenv').config()

//----------------------------------------------------------------//
const PORT = process.env.PORT

//----------------------------------------------------------------//
;(async () => {
  try {
    const app = await setupApp()
    const server = http.createServer(app.app)
    server.listen(PORT)

    if (app.error) console.log('An error occured during setup. Please restart.')
    else console.log('Server setup successful. Server is listening on PORT ' + PORT)
  } catch (error) {
    console.log('An error occured during setup. Please restart.', error)
  }
})()
