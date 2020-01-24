// Services
const { createImage } = require('../services/api')

//----------------------------------------------------------
const createDefaultReport = (browser, reportID, url, testURL, selector, name, chain = false) => {
  return new Promise(async resolve => {
    console.log('Creating ' + name + ' image report for: ', url)
    try {
      const page = await browser.newPage()
      await page.setViewport({
        width: 1366,
        height: 768
      })
      if (chain) await page.waitFor(5000)
      await page.goto(testURL, { waitUntil: 'networkidle0', timeout: 0 })
      await page.waitForSelector(selector, { timeout: 300000 }) // timeout: 5 Minutes
      await page.waitFor(1000)
      await page.screenshot({ path: name + '.jpeg', type: 'jpeg', quality: 70, fullPage: true })
      await page.close()

      resolve(await createImage(reportID, url, name, name + '.jpeg'))
    } catch (error) {
      resolve('An error occured creating image report for url ' + url + ': ', error)
    }
  })
}

module.exports = createDefaultReport
