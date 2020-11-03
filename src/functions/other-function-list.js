const jwtDecode = require("jwt-decode")
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
  
function removeObject (obj, type) {
  // PREPARE ARRAY ON OBJECT ADDRESS
  const address = ["address", "country_code", "country", "province_code", "province", "city_code", "city", "postal_code"]

  // PREPARE ARRAY ON OBJECT ID TYPE
  const idType = ["id_number", "expire_date", "id_document_code", "id_file_url", "selfie_document_code", "selfie_file_url", "id_verified"]

  // PREPARE ARRAY FOR CLEANING
  var array = []
  switch (type) {
    case "address":
      array = address
      break;
    case "id_type":
      array = idType
      break;
  }

  // CLEANING OBJECT
  array.forEach(key => {
    if(!obj[key]) delete obj[key]
  });
  if (Object.entries(obj).length === 0) obj = false

  return obj
}
  
function validateObject (oldData, newData) {
  const oldKey = Object.keys(oldData)
  const newKey = Object.keys(newData)

  var status = true
  oldKey.forEach(oKey => {
    newKey.forEach(nKey => {
      if (oKey === nKey){
        if (JSON.stringify(oldData[oKey]) !== JSON.stringify(newData[nKey])) {
          status = false
        }
      }
    })
  })
  return status
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

function sortByKey(array, key) {
  console.log({key})
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      if (key === "ktp" || key === "sim" || key === "passport" || key === "others") {
        x = a[key].id_number;
        y = b[key].id_number;
      }
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function decodeJwt(token) {
  const decode = jwtDecode(token)
  const result = decode
  if (result.sub) result.id = result.sub
  return result
}

async function storeOrchestrator (key, data) {
  console.log("start store Orchestrator")
  console.log("Data Producer: " + JSON.stringify(data))


  const resData = {
    message: "Success",
    response_code: "S1"
  }

  try {
    const date = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"})

    var dataOrchestrator = {}

    dataOrchestrator = {
      _key: key,
      variables: data.variables,
      request_time: date,
      finish_time: '',
      status: 'waiting'
    }

    await db.collection("orchestrator_monitor").save(dataOrchestrator)
      .catch((e) => {
        console.log(String(e))
        resData.response_code = "E0";
        resData.message = "Failed Storing Orchestrator data!";
        return false;
    });

    if (resData.message === "Success") resData.request_time = dataOrchestrator.request_time;

    console.log(JSON.stringify(resData))
    console.log("end storing orchestrator")
    return resData
  } catch (error) {
    console.log(String(error))
    const resData = {
      message: String(error),
      response_code: "E0"
    };
    return resData
  }
}

async function checkOrchestratorStatus (key, minutestimeout, request_time) {
  console.log("start check Orchestrator Status")
  console.log("Key: " + key)
  console.log("Timeout: " + minutestimeout + " minutes")
  console.log("request_time: " + request_time)

  const resData = {
    message: "Success",
    response_code: "S1"
  }

  var loop = true;

  try {
    const timeLimit = minutestimeout ? minutestimeout : 5;
    console.log('timeLimit : ' + timeLimit)
    var expiredTime = new Date(request_time);
    expiredTime = expiredTime.setMinutes(expiredTime.getMinutes() + timeLimit);
    // expiredTime = new Date(expiredTime);

    var dataOrchestrator = {}

      do {
        // code to be executed
        await Promise.all([ 
          db.collection("orchestrator_monitor").document(key)
          .catch((e) => {
            console.log(String(e))
            resData.response_code = "E0",
            resData.message = "orchestrator_monitor not available"
          }).then((responseCheck) => {
            console.log('responseCheck : ' + JSON.stringify(responseCheck))
            console.log('responseCheck Status : ' + JSON.stringify(responseCheck.status))
            if (responseCheck.status === "done") {
              loop = false
              dataOrchestrator = responseCheck
            }

            var date = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});
            date = new Date(date);
            date = date.setMinutes(date.getMinutes() + 0);
            // console.log('expired : ' + date > expiredTime)
            if (date > expiredTime) {
              loop = false
              resData.response_code = "E0",
              resData.message = "orchestrator_monitor request timeout"
            }
          }), timeout(2000)
        ]);
        // console.log(JSON.stringify(resData))
      }
      while (loop);

    if (Object.keys(dataOrchestrator).length > 0) {
      console.log('dataOrchestrator : ' + JSON.stringify(dataOrchestrator))
      await db.collection("orchestrator_monitor").remove(dataOrchestrator._key)
      .catch((e) => {
        console.log(String(e))
        console.log("Failed Delete Orchestrator data!")
        return false;
      });
      resData.data = dataOrchestrator.variables
      resData.message = dataOrchestrator.variables.message
      resData.response_code = dataOrchestrator.variables.response_code
    }

    console.log(JSON.stringify(resData))
    console.log("end Checking orchestrator")
    return resData
  } catch (error) {
    console.log(String(error))
    const resData = {
      message: String(error),
      response_code: "E0"
    };
    return resData
  }
}

async function deleteOrchestrator (key) {
  console.log("start Delete Orchestrator")
  console.log("Data to delete: " + key)


  const resData = {
    message: "Success",
    response_code: "S1"
  }

  try {

    const delete_result = await db.collection("orchestrator_monitor").remove(key)
    .catch((e) => {
      console.log(String(e))
      console.log("Failed Delete Orchestrator data!")
      resData.response_code = "E0";
      resData.message = "Failed Delete Orchestrator data!";
      return false;
    });
    
    console.log("delete_result : " + delete_result)

    console.log(JSON.stringify(resData))
    console.log("end delete orchestrator")
    return resData
  } catch (error) {
    console.log(String(error))
    const resData = {
      message: String(error),
      response_code: "E0"
    };
    return resData
  }
}

async function updateOrchestratorStatus (data) {
  console.log("start Update Orchestrator")
  console.log("Data Producer: " + data)


  const resData = {
    message: "Success",
    response_code: "S1"
  }

  try {
    const date = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"})

    const instance_key = data.instance_key;
    var update_data = data;
    
    var dataOrchestrator = {
      variables: update_data,
      finish_time: date,
      status: 'done'
    }

    // update database
    console.log('Update database : ' + instance_key)
    await db.collection("orchestrator_monitor").update(instance_key, dataOrchestrator, {
      mergeObjects: true,
      returnNew: true,
      returnOld: true,
      waitForSync: true,
    }).catch((e) => {
        console.log(String(e))
        resData.response_code = "E0";
        resData.message = "Failed Update Orchestrator data!";
        return false;
    });

    console.log(JSON.stringify(resData))
    console.log("end update orchestrator")
    return resData
  } catch (error) {
    console.log(String(error))
    const resData = {
      message: String(error),
      response_code: "E0"
    };
    return resData
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

module.exports = {
  clean,
  cleanAll,
  removeObject,
  validateObject,
  newDate,
  validateEmail,
  sortByKey,
  decodeJwt,
  storeOrchestrator,
  checkOrchestratorStatus,
  deleteOrchestrator,
  updateOrchestratorStatus,
  randomString
};