const {
  mandatoryError
 } = require ('../helpers/errors')
const makeHttpError = require ('../helpers/http-error')
let responseCode

const path = "api"

module.exports = function makeContactsEndpointHandler ({ functionList }) {
  return async function handle (httpRequest) {
    console.log("httpRequest: " + JSON.stringify(httpRequest))
    switch (httpRequest.method) {
      case 'POST':
        switch (httpRequest.path) {

          case path +`/save`:
            return save(httpRequest)

          default:
            return makeHttpError({
              statusCode: 405,
              errorMessage: `${httpRequest.path} path not allowed.`
            })
        }

      case 'GET':
        switch (httpRequest.path) {
          case path +`/getcustomer/${httpRequest.pathParams.id}`:
            return getcustomer(httpRequest)

          default:
            return makeHttpError({
              statusCode: 405,
              errorMessage: `${httpRequest.path} path not allowed.`
            })
        }

      case 'PUT':
        switch (httpRequest.path) {
          case path +`/updatecustomer/${httpRequest.pathParams.id}`:
            return updatecustomer(httpRequest)

          default:
            return makeHttpError({
              statusCode: 405,
              errorMessage: `${httpRequest.path} path not allowed.`
            })
        }

      case 'DELETE':
        switch (httpRequest.path) {
          case path + `/deletecustomer/${httpRequest.pathParams.id}`:
            return deletecustomer(httpRequest)

          default:
            return makeHttpError({
              statusCode: 405,
              errorMessage: `${httpRequest.path} path not allowed.`
            })
        }

      default:
        return makeHttpError({
          statusCode: 405,
          errorMessage: `${httpRequest.method} method not allowed.`
        })
    }
  }

  async function save (httpRequest) {
    try {
      console.log("Start endpoint user save")

      const data = httpRequest.body
      
      const result = await functionList.save(data)

      if (result.message !== "Success") {
        responseCode = result.responseCode
        throw new mandatoryError(result.message)
      }

      const resData = {
        message: result.message,
        response_code: result.responseCode,
        data: result.user
      }
      const res = {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: 200,
        data: JSON.stringify(resData)
      }
      return res
    } catch (e) {
      return makeHttpError({
        errorMessage: e.message,
        statusCode: 400,
        response_code: responseCode
      })
    }
  }
}
