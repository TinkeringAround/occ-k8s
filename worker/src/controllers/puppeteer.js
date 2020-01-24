const puppeteer = require('puppeteer')
require('dotenv').config()

//----------------------------------------------------------
var browser = null
var config =
  process.env.NODE_ENV === 'dev'
    ? { args: ['--no-sandbox', '--disable-dev-shm-usage'] }
    : {
        executablePath: 'google-chrome-unstable',
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      }
config = { ...config, headless: true, defaultViewport: null }

//----------------------------------------------------------
const getBrowser = () => browser
const createBrowser = async () => {
  if (browser) await browser.disconnect()
  browser = await puppeteer.launch(config)
}

//----------------------------------------------------------
const setupPuppeteer = async () => {
  try {
    await createBrowser()
    return true
  } catch (error) {
    console.log('An error occured during puppeteer setup.', error)
    return false
  }
}

//----------------------------------------------------------
module.exports = {
  getBrowser,
  createBrowser,
  setupPuppeteer
}
