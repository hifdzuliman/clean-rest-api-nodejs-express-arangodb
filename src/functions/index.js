const {db, aql} = require ('../config/db')
const makeFunctionList = require ('./function-list')
const makeFunctionsEndpointHandler = require ('./endpoint')

const functionList = makeFunctionList( db, aql )
const functionsEndpointHandler = makeFunctionsEndpointHandler({ functionList })

module.exports = functionsEndpointHandler
