const otherFunction = require("./other-function-list")

module.exports = function makeContactList ( database, aql ) {
  const db = database
  return Object.freeze({
    save
  })

  async function save (data) {
    console.log("start user save function")
    console.log("data: " + JSON.stringify(data))

    // PREPARE VARIABLE
    const resData = {
      message: "Success",
      responseCode: "S1"
    }

    try {
      const date = otherFunction.newDate()

      // ADD AUDIT TRAIL DATA
      data.creator = data.inputter,
      data.creator_name = data.inputter_name,
      data.created_date = dateformat(date, "m/d/yyyy"), 
      data.created_timestamp = date,
      data.last_inputter = data.inputter,
      data.last_inputter_name = data.inputter_name,
      data.last_updated_date = dateformat(date, "m/d/yyyy"), 
      data.last_updated_timestamp = date
      data.current_number = 1

      // DELETE INPUTTER AND INPUTTER NAME
      delete data.inputter
      delete data.inputter_name

      // CLEAN DATA
      const cleanData = otherFunction.clean(data)
      console.log("cleanSaveData: " + JSON.stringify(cleanData));

      const cusID = await db.collection("user").save(cleanData, {
        mergeObjects: true,
        returnNew: true,
        waitForSync: true,
      })
        .then((res) => {
          console.log("then response")
          return res
        })

      console.log(cusID._key);

      resData.user = cleanData
      
      console.log(resData);
      console.log("end update users function");
      return resData;
    } catch (error) {
      console.log(String(error));
      const resData = {
        message: String(error),
        responseCode: "E0",
      };
      return resData;
    }
  }
}
