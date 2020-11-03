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
          case path +'/register':
            return register(httpRequest)
    
          case path +`/getcustomerlist`:
            return getcustomerlist(httpRequest)

          case path +`/savecustomer`:
            return customersave(httpRequest)

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
            return deletecustomermigration(httpRequest)

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

  async function register (httpRequest) {
    try {
      const validateData = await functionList.normalizeRegisterData(httpRequest.body)
      if (validateData.message !== "Success") {
        responseCode = validateData.responseCode
        throw new mandatoryError(validateData.message)
      }
      const result = await kafka.createCustomer(validateData.data)
      console.log("end endpoint register ")
      console.log(result)
      if (result.message !== "Success") {
        responseCode = result.responseCode
        throw new mandatoryError(result.message)
      }

      const resData = {
        message: result.message,
        response_code: result.responseCode,
        customer_id: result.id,
        email: result.customer.email,
        token: result.token
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

  async function getcustomerlist (httpRequest) {
    try {
      const data = httpRequest.body
      console.log(data)
      const result = await functionList.getCustomerList(data)
      
      if (result.message !== "Success") {
        responseCode = result.responsCode
        throw new mandatoryError(result.message)
      }
      console.log("endpoint data")
      const resData = {
        message: result.message,
        response_code: result.responseCode,
        data: result.data,
        count_data: result.count_data
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

  async function getcustomer (httpRequest) {
    try {
      console.log("start endpoint get customer")
      const id = httpRequest.pathParams.id
      if (!id) {
        responseCode = "E1"
        throw new mandatoryError("id is mandatory.")
      }

      const result = await functionList.getCustomer(id)
      
      if (result.message !== "Success") {
        responseCode = result.responseCode
        throw new mandatoryError(result.message)
      }
      
      const resData = {
        message: result.message,
        response_code: result.responseCode,
        data: result.customer
      }
      console.log(resData.response_code)
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

  async function updatecustomer (httpRequest) {
    try {
      console.log("Start endpoint update user")
      var data = await functionList.clean(httpRequest.body)
      if (!data.inputter_name || !data.inputter) {
        responseCode = "E0"
        throw new mandatoryError("inputter or inputter_name is mandatory.")
      }

      const id = httpRequest.pathParams.id
      
      const result = await functionList.updateCustomer(id, data)

      if (result.message !== "Success") {
        responseCode = result.responseCode
        throw new mandatoryError(result.message)
      }

      if (result.dataChange === false) result.message = "Success - No changes identified"
      console.log({result})

      const resData = {
        message: result.message,
        response_code: result.responseCode
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

  async function customersave (httpRequest) {
    try {
      console.log("Start endpoint customer save")
      if (!httpRequest.body.inputter_name || !httpRequest.body.inputter) {
        responseCode = "E0"
        throw new mandatoryError("inputter or inputter_name is mandatory.")
      }
      const normalizeData = await functionList.normalizeCustomerSaveData(httpRequest.body)
      if (normalizeData.message !== "Success") {
        responseCode = "E0"
        throw new mandatoryError(normalizeData.message)
      }
      
      const result = await functionList.customerSave(normalizeData.data)

      if (result.message !== "Success") {
        responseCode = result.responseCode
        throw new mandatoryError(result.message)
      }

      const resData = {
        message: result.message,
        response_code: result.responseCode,
        customer_id: result.customer_id,
        data: result.customer
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
