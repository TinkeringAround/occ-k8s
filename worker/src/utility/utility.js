var Crawler = require('simplecrawler')
const curl = require('curl')

//----------------------------------------------------------
exports.contains = (array, search) => {
  var contains = false
  array.forEach(element => {
    search.forEach(item => {
      if (element == item) contains = true
    })
  })
  return contains
}

//----------------------------------------------------------
exports.checkURL = url => {
  return new Promise(async function(resolve) {
    curl.get('https://' + url, function(error) {
      if (error) resolve(false)
      else resolve(true)
    })
  })
}

//----------------------------------------------------------
exports.getSiteUrls = url => {
  return new Promise(async function(resolve) {
    console.log('Collecting urls for: ', url)
    const urls = []

    var crawler = new Crawler('https://' + url)
    crawler.maxConcurrency = 3
    crawler.maxDepth = 3
    crawler.addFetchCondition(parsedURL => {
      if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|ico)/i)) return false
      else return true
    })
    crawler.on('fetchcomplete', (queueItem, data, res) => {
      if (queueItem.stateData.contentType && queueItem.stateData.contentType.includes('html')) {
        console.log(queueItem.url)
        urls.push(queueItem.url)
      }
    })
    crawler.on('complete', () => {
      console.log('Collected ' + urls.length + ' sites.')
      resolve(urls.map(urlWithHttps => urlWithHttps.replace(/^https?:\/\//, '')))
    })
    crawler.start()
  })
}

//----------------------------------------------------------
exports.serverError = (response, path, error) => {
  console.log('An error occured ' + path + ': ' + error)
  return response.status(500).json({
    message: 'An error occured ' + path,
    error: error
  })
}
