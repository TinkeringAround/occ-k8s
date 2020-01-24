// Services
const { createImage } = require('../services/api')

//----------------------------------------------------------
const createInputReport = (
  browser,
  reportID,
  url,
  name,
  suiteUrl,
  input,
  click,
  selector,
  chain = false
) => {
  return new Promise(async resolve => {
    console.log('Creating ' + name + ' report for: ', url)
    try {
      const page = await browser.newPage()
      await page.setViewport({
        width: 1366,
        height: 768
      })
      if (chain) await page.waitFor(5000)
      await page.goto(suiteUrl, { waitUntil: 'networkidle0', timeout: 0 })
      await page.type(input, url, { delay: 100 })
      await page.click(click)
      await page.waitFor(selector, { timeout: 300000 }) // 5 minutes
      await page.waitFor(1000)
      await page.screenshot({ path: name + '.jpeg', type: 'jpeg', quality: 70, fullPage: true })
      await page.close()

      resolve(await createImage(reportID, url, name, name + '.jpeg'))
    } catch (error) {
      resolve('An error occured creating image input report for url ' + url + ': ', error)
    }
  })
}

module.exports = createInputReport
