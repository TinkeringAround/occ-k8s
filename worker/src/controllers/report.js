// Suites
const createDefaultReport = require('../suites/default')
const createInputReport = require('../suites/input')
const createLighthouseReport = require('../suites/lighthouse')

// Controller
const { getBrowser, recreateBrowser } = require('./puppeteer')

// Utility
const { checkURL, contains, getSiteUrls } = require('../utility/utility')

// Services
const { sendMail } = require('../services/mail')
const { updateStatus } = require('../services/api')

//----------------------------------------------------------
exports.createReport = async (job, done) => {
  const data = job.data
  console.log('')
  console.log('//------------------------------------------------------------------//')
  console.log('New Job received: ', data)

  try {
    const { url, suites, reportID, user } = data

    // Check if url is valid
    const urlIsValid = await checkURL(url)
    console.log('URL Validation Result: ', urlIsValid ? 'VALID' : 'INVALID')
    if (urlIsValid) {
      try {
        await updateStatus(reportID, 'IN PROGRESS')
        var browser = getBrowser()

        // #region Create Reports
        if (suites.length > 0) {
          const urls = contains(suites, ['w-three', 'achecker', 'w-three-css'])
            ? await getSiteUrls(url)
            : []

          // SSLLABS
          if (contains(suites, ['ssllabs'])) {
            console.log(
              await createDefaultReport(
                browser,
                reportID,
                url,
                'https://www.ssllabs.com/ssltest/analyze.html?d=' + url + '&hideResults=on',
                '#rating',
                'ssllabs'
              )
            )
          }

          // Security Headers
          if (contains(suites, ['securityheaders'])) {
            console.log(
              await createDefaultReport(
                browser,
                reportID,
                url,
                'https://securityheaders.com/?q=' + url + '&hide=on&followRedirects=on',
                '.reportBody',
                'securityheaders'
              )
            )
          }

          // Seobility
          if (contains(suites, ['seobility'])) {
            console.log(
              await createDefaultReport(
                browser,
                reportID,
                url,
                'https://freetools.seobility.net/de/seocheck/' + url,
                '#quickform',
                'seobility'
              )
            )
          }

          // Varvy-SEO
          if (contains(suites, ['varvy-seo'])) {
            console.log(
              await createInputReport(
                browser,
                reportID,
                url,
                'varvy',
                'https://varvy.com',
                'input[name=url]',
                'input[type=submit]',
                () => !document.querySelector('.timer-loader')
              )
            )
          }

          // Favicon-Checker
          if (contains(suites, ['favicon-checker'])) {
            console.log(
              await createDefaultReport(
                browser,
                reportID,
                url,
                'https://realfavicongenerator.net/favicon_checker?protocol=https&site=' +
                  url +
                  '#.XWju45MzZhE',
                '.alert',
                'favicon'
              )
            )
          }

          // GTMetrix
          if (contains(suites, ['gtmetrix'])) {
            console.log(
              await createInputReport(
                browser,
                reportID,
                url,
                'gtmetrix',
                'https://gtmetrix.com',
                'input[name=url]',
                'button[type=submit]',
                '.page-report'
              )
            )
          }

          // Webhint
          if (contains(suites, ['webhint'])) {
            console.log(
              await createInputReport(
                browser,
                reportID,
                url,
                'webhint',
                'https://webhint.io/scanner/',
                'input[name=url]',
                'button[class=button--red]',
                () =>
                  document.getElementById('scan-percentage') &&
                  document.getElementById('scan-percentage').textContent == '100%'
              )
            )
          }

          // Hardenize
          if (contains(suites, ['hardenize'])) {
            console.log(
              await createInputReport(
                browser,
                reportID,
                url,
                'hardenize',
                'https://www.hardenize.com',
                'input[name=host]',
                '#run',
                '.report'
              )
            )
          }

          // Lighthouse
          if (contains(suites, ['lighthouse'])) {
            console.log(await createLighthouseReport(browser, reportID, url, 'lighthouse'))
          }

          // AChecker
          if (contains(suites, ['achecker'])) {
            if (urls != null && urls.length > 0) {
              for (const sub of urls) {
                console.log(
                  await createInputReport(
                    browser,
                    reportID,
                    'https://' + sub,
                    'achecker',
                    'https://achecker.ca/checker/index.php',
                    'input[name=uri]',
                    '.validation_button',
                    '#AC_errors',
                    true
                  )
                )
              }
            }
          }

          // HTML Validation
          if (contains(suites, ['w-three'])) {
            if (urls != null && urls.length > 0) {
              for (const sub of urls) {
                console.log(
                  await createDefaultReport(
                    browser,
                    reportID,
                    url,
                    'https://validator.w3.org/nu/?doc=https%3A%2F%2F' + sub,
                    '#results',
                    'w3',
                    true
                  )
                )
              }
            }
          }

          // TODO: REWORK
          // CSS Validation
          /* if (utility.contains(data.suites, ['w-three-css'])) {
            var w3css = []
            if (urls != null && urls.length > 0) {
              for (const url of urls) {
                const imageID = await createInputReport(
                  browser,
                  url,
                  'w3css',
                  'https://jigsaw.w3.org/css-validator/',
                  'input[name=uri]',
                  'a[class=submit]',
                  '#results_container',
                  true
                )
                w3css.push(imageID)
              }
            }
            reports.push({ name: 'w-three-css', images: w3css })
          } */
        }
        // #endregion

        // Finishing Report
        console.log('Updating the report...')
        updateStatus(reportID, 'FINISHED').finally(() => {
          sendMail(user, url, reportID, true).finally(() => {
            console.log('Finishing Job.')
            done()
          })
        })
      } catch (error) {
        console.log('An error occured creating the report.', error)
        await recreateBrowser()
        updateStatus(reportID, 'FAILED').finally(() => done())
      }
    } else {
      console.log('No valid URL provided. Cancelling Job.')
      updateStatus(reportID, 'FAILED').finally(() => done())
    }
  } catch (error) {
    console.log('An unkown error occured...', error)
    throw new Error('Restarting the server...')
  }
}
