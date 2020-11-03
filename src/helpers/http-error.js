module.exports = function makeHttpError ({ statusCode, errorMessage, responseCode }) {
  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode,
    data: JSON.stringify({
      success: false,
      message: errorMessage,
      response_code: responseCode
    })
  }
}
