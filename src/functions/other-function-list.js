const {db, aql} = require ('../config/db')

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
      delete obj[propName];
    }
    if (
      typeof obj[propName] === "object" &&
      Object.prototype.toString.call(obj[propName]) !== "[object Date]"
    ) {
      if (Object.keys(obj[propName]).length === 0) {
        delete obj[propName];
      } else {
        clean(obj[propName]);
      }
    }
    if (Object.prototype.toString.call(obj[propName]) === "[object Date]") {
      if (obj[propName].getTime() === new Date(0).getTime()) {
        delete obj[propName];
      }
    }
  }

  return obj;
}

function cleanAll(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
      delete obj[propName];
    }
    if (
      typeof obj[propName] === "object" &&
      Object.prototype.toString.call(obj[propName]) !== "[object Date]"
    ) {
      if (Object.keys(obj[propName]).length === 0) {
        delete obj[propName];
      } else {
        cleanAll(obj[propName]);
        if (Object.keys(obj[propName]).length === 0 ) {
          console.log("null")
          delete obj[propName]
          }
      }
    }
    if (Object.prototype.toString.call(obj[propName]) === "[object Date]") {
      if (obj[propName].getTime() === new Date(0).getTime()) {
        delete obj[propName];
      }
    }
  }

  return obj;
}

function newDate(data) {
  var date = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"})
  if (data){
    date = new Date(data).toLocaleString("id-ID", {timeZone: "Asia/Jakarta"})
  }

  return date
}

function validateEmail(email) {
  const emailToValidate = email;
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegexp.test(emailToValidate)
}

module.exports = {
  clean,
  cleanAll,
  newDate,
  validateEmail
};