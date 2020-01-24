const lighthouse = require('lighthouse')
const { URL } = require('url')
// Services
const { createImage } = require('../services/api')

//----------------------------------------------------------
const createLighthouseReport = (browser, reportID, url, name) => {
  return new Promise(async resolve => {
    console.log('Creating Lighthouse report for: ', url)
    try {
      const page = await browser.newPage()
      await page.setViewport({
        width: 1366,
        height: 768
      })
      await page.waitFor(1000)
      const report = await lighthouse('https://' + url, {
        port: new URL(browser.wsEndpoint()).port,
        output: 'html'
      })
      await page.waitFor(5000)
      await page.setContent(report.report)
      await page.screenshot({ path: name + '.jpeg', type: 'jpeg', quality: 70, fullPage: true })
      await page.close()

      resolve(await createImage(reportID, url, name, name + '.jpeg'))
    } catch (error) {
      resolve('An error occured creating lighthouse report for url ' + url + ': ', error)
    }
  })
}

module.exports = createLighthouseReport
