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
exports.serverError = (response, path, error) => {
  console.log('An error occured ' + path + ': ' + error)
  return response.status(500).json({
    message: 'An error occured ' + path,
    error: error
  })
}
