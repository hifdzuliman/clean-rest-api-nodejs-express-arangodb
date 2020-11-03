const otherFunction = require("./other-function-list")

module.exports = function makeContactList ( database, aql ) {
  const db = database
  return Object.freeze({
  })

  async function createCustomerDatabase (data) {
    console.log("start create customer database")
    console.log("data customer: " + JSON.stringify(data))

    var message = "Success"
    var responseCode = "S1"

    try {
      const date = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      });

      var dataCustomer = {
        _key: data.id,
        name: data.name,
        place_of_birth: data.place_of_birth,
        birth_date: data.birth_date,
        gender: data.gender,
        marital_status: data.marital_status,
        occupation: data.occupation,
        religion: data.religion,
        email: data.email,
        nationality: data.nationality,
        address: data.address,
        pin_flag: data.pin_flag,
        status: data.status,
        creator: data.inputter,
        creator_name: data.inputter_name,
        created_timestamp: date,
        created_date: dateformat(date, "m/d/yyyy"), 
        last_inputter: data.inputter,
        last_inputter_name: data.inputter_name,
        last_updated_timestamp: date,
        last_updated_date: dateformat(date, "m/d/yyyy"), 
        current_number: 1,
        app_config: data.app_config,
        resident_address: data.resident_address,
        home_address: data.home_address,
        office_address: data.office_address,
        ktp: data.ktp,
        passport: data.passport,
        sim: data.sim,
        user_role: {
          role_code: data.user_role.role_descriptions,
          role_descriptions: data.user_role.role_descriptions,
        },
        user_branch: {
          branch_code: data.user_branch.branch_descriptions,
          branch_descriptions: data.user_branch.branch_descriptions,
        },
      };

      const cleanDataCustomer = otherFunction.clean(dataCustomer);
      await db
        .collection("customers")
        .save(cleanDataCustomer, {
          mergeObjects: true,
          returnNew: true,
          waitForSync: true,
        })
        .then((res) => {
          const audiTrailData = {
            oldData: null,
            newData: res.new,
          };
          createAuditTrail(audiTrailData, "customer_trails");
          return res
        })
        .catch((e) => {
          responseCode = "E0";
          message = "Failed save customer to database.";
          return false;
        });

      const resData = {
        message,
        responseCode,
      };
      if (message === "Success") {
        console.log("");
        resData.data = dataCustomer;
        resData.id = data.id;
      }

      console.log("end create customer database");
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

  async function getCustomerMobile (id) {
    console.log("start get user Mobile")
    console.log("id: " + JSON.stringify(id))
    var message = "Success"
    var responseCode = "S1"

    try {
      var resData = {
        customer: {},
      };

      const data = await db
        .collection("customers")
        .document(id)
        .catch((e) => {
          console.log("catch get user mobile error");
          message = e.response.body.errorMessage;
          responseCode = "E1";
          return false;
        });

      const bankAccountRef = await db
        .collection("transfer_recipients")
        .byExample({customer_id: id})
        
      var bankAccounts = []
      bankAccountRef._result.forEach(element => {
        bankAccounts.push({
          bank_account_id: element._key,
          customer_id: element.customer_id,
          bank_code: element.bank_code,
          bank_name: element.bank_name,
          account_number: element.account_number,
          currency_code: element.currency_code,
          creator: element.creator,
          created_timestamp: element.created_timestamp
        })
      })
      
      if (message === "Success") {
        resData.customer = {
          customer_id: data._key,
          name: data.name,
          marital_status: data.marital_status,
          occupation: data.occupation,
          religion: data.religion,
          place_of_birth: data.place_of_birth,
          birth_date: data.birth_date,
          gender: data.gender,
          phone_number: data.phone_number,
          nationality: data.nationality,
          address: data.address,
          email: data.email,
          is_reported: data.is_reported,
          pin_flag: data.pin_flag,
          status: data.status,
          app_config: data.app_config,
          resident_address: data.resident_address,
          home_address: data.home_address,
          office_address: data.office_address,
          bank_accounts: bankAccounts
        };
        console.log("user_data: " + JSON.stringify(data));
        // ADD KTP DATA IS EXISTS
        if (data.ktp) {
          resData.customer.ktp = {}
          resData.customer.ktp.id_number = data.ktp.id_number;
          resData.customer.ktp.expire_date = data.ktp.expire_date;
          resData.customer.ktp.id_verified = data.ktp.id_verified;
          resData.customer.ktp.id_document_code = data.ktp.id_document_code;
          resData.customer.ktp.selfie_document_code = data.ktp.selfie_document_code;
        }
        // ADD PASSPORT DATA IS EXISTS
        if (data.passport) {
          resData.customer.passport = {}
          resData.customer.passport.id_number = data.passport.id_number;
          resData.customer.passport.expire_date = data.passport.expire_date;
          resData.customer.passport.id_verified = data.passport.id_verified;
          resData.customer.passport.id_document_code = data.passport.id_document_code;
          resData.customer.passport.selfie_document_code = data.passport.selfie_document_code;
        }
        // ADD SIM DATA IS EXISTS
        if (data.sim) {
          resData.customer.sim = {}
          resData.customer.sim.id_number = data.sim.id_number;
          resData.customer.sim.expire_date = data.sim.expire_date;
          resData.customer.sim.id_verified = data.sim.id_verified;
          resData.customer.sim.id_document_code = data.sim.id_document_code;
          resData.customer.sim.selfie_document_code = data.sim.selfie_document_code;
        }
      }

      resData.message = message;
      resData.responseCode = responseCode;
      console.log("userData: " + JSON.stringify(resData));
      console.log("end customer get mobile");
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

  async function getCustomer (id) {
    console.log("start get user Database")
    console.log("id: " + JSON.stringify(id))

    // Set a `realm` property to override the realm for only a single operation.
    // For example, creating a user in another realm:
    var message = "Success"
    var responseCode = "S1"

    try {
      var resData = {
        customer: {},
      };

      if (id) {
        const data = await db
          .collection("customers")
          .document(id)
          .catch((e) => {
            console.log("catch get user error");
            message = e.response.body.errorMessage;
            responseCode = "E1";
            return false;
          });

        if (message === "Success") {
          resData.customer = {
            customer_id: data._key,
            name: data.name,
            marital_status: data.marital_status,
            occupation: data.occupation,
            religion: data.religion,
            place_of_birth: data.place_of_birth,
            birth_date: data.birth_date,
            gender: data.gender,
            phone_number: data.phone_number,
            nationality: data.nationality,
            address: data.address,
            email: data.email,
            is_reported: data.is_reported,
            pin_flag: data.pin_flag,
            customer_type: data.customer_type,
            status: data.status,
            creator: data.creator,
            creator_name: data.creator_name,
            created_timestamp: data.created_timestamp,
            last_inputter: data.last_inputter,
            last_inputter_name: data.last_inputter_name,
            last_updated_timestamp: data.last_updated_timestamp,
            current_number: data.current_number,
            app_config: data.app_config,
            resident_address: data.resident_address,
            home_address: data.home_address,
            user_role: {
              role_code: data.user_role.role_descriptions,
              role_descriptions: data.user_role.role_descriptions,
            },
            user_branch: {
              branch_code: data.user_branch.branch_descriptions,
              branch_descriptions: data.user_branch.branch_descriptions,
            },
          };
          console.log("user_data: " + JSON.stringify(data));
          if (data.ktp) resData.customer.ktp = data.ktp;
          if (data.passport) resData.customer.ktp = data.passport;
          if (data.sim) resData.customer.ktp = data.sim;
          if (data.others) resData.customer.others = data.others;
        }
      }

      resData.message = message;
      resData.responseCode = responseCode;
      console.log("userData: " + JSON.stringify(resData));
      console.log("end customer get");
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

  async function getCustomerList (data) {
    console.log("start customer list")
    const message = "Success"
    const responseCode = "S1"

    try {
      console.log(data);
      var name = data.name;
      var ktp = data.ktp;
      var sim = data.sim;
      var passport = data.passport;
      var others = data.others;
      var phone_number = data.phone_number;
      var docs = "";
      const limit = data.limit ? data.limit : 100
      const skip = data.skip ? data.skip : 0

      const count = await db.query(aql`
        FOR doc IN customers
        COLLECT WITH COUNT INTO length
        RETURN length
      `)

      if (name) {
        console.log("name: " + name);
        strLength = name.length
        strSort = "name"
        name = name + "%"
        docs = await db.query(aql`
          FOR u IN customers
          FILTER u.name LIKE ${name}
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u 
        `);
      } else if (ktp) {
        console.log("ktp: " + ktp);
        strLength = ktp.length
        strSort = "ktp"
        docs = await db.query(aql`
          FOR u IN customers
          FILTER u.ktp.id_number == ${ktp}
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u
        `);
      } else if (sim) {
        console.log("sim: " + sim);
        strLength = sim.length
        strSort = "sim"
        docs = await db.query(aql`
          FOR u IN customers
          FILTER u.sim.id_number == ${sim}
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u
        `);
      } else if (passport) {
        console.log("passport: " + passport);
        strLength = passport.length
        strSort = "passport"
        docs = await db.query(aql`
          FOR u IN customers
          FILTER u.passport.id_number == ${passport}
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u
        `);
      } else if (phone_number) {
        console.log("phone_number: " + phone_number);
        strLength = phone_number.length
        strSort = "phone_number"
        docs = await db.query(aql`
          FOR u IN customers
          FILTER u.phone_number == ${phone_number}
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u
        `);
      } else if (others) {
        console.log("others: " + others);
        strLength = others.length
        strSort = "others"
        docs = await db.query(aql`
          FOR u IN customers
          FILTER u.others.id_number == ${others}
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u
        `);
      } else {
        console.log("parameter doesn't exists");
        docs = await await db.query(aql`
          FOR u IN customers
          SORT u.name ASC
          LIMIT ${skip}, ${limit}
          RETURN u
        `);
      }

      console.log({skip, limit})
      var listData = [];
      if (docs._result.length > 0) {
        docs._result.forEach((data) => {
          var cusData = otherFunction.cleanAll({
            customer_id: data._key,
            name: data.name,
            marital_status: data.marital_status,
            occupation: data.occupation,
            religion: data.religion,
            place_of_birth: data.place_of_birth,
            birth_date: data.birth_date,
            gender: data.gender,
            phone_number: data.phone_number,
            nationality: data.nationality,
            address: data.address,
            email: data.email,
            is_reported: data.is_reported,
            pin_flag: data.pin_flag,
            customer_type: data.customer_type,
            status: data.status,
            creator: data.creator,
            creator_name: data.creator_name,
            created_timestamp: data.created_timestamp,
            last_inputter: data.last_inputter,
            last_inputter_name: data.last_inputter_name,
            last_updated_timestamp: data.last_updated_timestamp,
            current_number: data.current_number,
            app_config: data.app_config,
            ktp: data.ktp,
            sim: data.sim,
            passport: data.passport,
            others: data.others,
            resident_address: data.resident_address,
            home_address: data.home_address,
            user_role: data.user_role,
            user_branch: data.user_branch,
          });

        listData.push(cusData)
        });
      }

      var resData = {
        message,
        responseCode,
        data: listData,
        count_data: [... count._result]
      };

      console.log("end customer list");
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

  async function updateCustomer (id, data) {
    console.log("start update customer function")
    console.log("data: " + JSON.stringify(data))
    var message = "Success"
    var responseCode = "S1"
    var dataChange = false

    try {
      const checkData = await db
        .collection("customers")
        .document(id)
        .catch((response) => {
          message = response.message;
          responseCode = "E1";
          return { message, responseCode };
        });

      if (message !== "Success") return { message, responseCode };
      console.log(checkData);
      const newData = {
        last_updated_timestamp: new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
        last_inputter: data.inputter,
        last_inputter_name: data.inputter_name,
      };
      if (data.status && checkData.status !== data.status) {
        if (data.status === "ACTIVE") {
          console.log("data.status : " + data.status);
          console.log("checkData.status : " + checkData.status);
          const activeUser = await activateUser(id);
          if (activeUser.message !== "Success") {
            message = activeUser.message;
            responseCode = activeUser.responseCode;
          }
          newData.status = data.status;
        } else if (data.status === "INACTIVE") {
          console.log("data.status : " + data.status);
          console.log("checkData.status : " + checkData.status);
          const deactiveUser = await deactivateUser(id);
          if (deactiveUser.message !== "Success") {
            message = deactiveUser.message;
            responseCode = deactiveUser.responseCode;
          }
          newData.status = data.status;
        }
      }

      if (data.name) {
        newData.name = data.name;
      }

      if (data.marital_status) {
        newData.marital_status = data.marital_status;
      }

      if (data.occupation) {
        newData.occupation = data.occupation;
      }

      if (data.email) {
        newData.email = data.email;
      }

      if (data.religion) {
        newData.religion = data.religion;
      }

      if (data.place_of_birth) {
        newData.place_of_birth = data.place_of_birth;
      }

      if (data.birth_date) {
        newData.birth_date = data.birth_date;
      }

      if (data.gender) {
        newData.gender = data.gender;
      }

      if (data.phone_number) {
        newData.phone_number = data.phone_number;
      }

      if (data.nationality) {
        newData.nationality = data.nationality;
      }

      if (data.address) {
        newData.address = data.address;
      }

      if (data.is_reported) {
        newData.is_reported = data.is_reported;
      }

      if (data.pin_flag) {
        newData.pin_flag = data.pin_flag;
      }

      if (data.user_role) {
        newData.user_role = data.user_role;
      }

      if (data.user_branch) {
        newData.user_branch = data.user_branch;
      }

      if (data.app_config) {
        newData.app_config = data.app_config;
      }

      if (data.id_type) {
        newData.id_type = data.id_type;
      }

      if (data.resident_address) {
        newData.resident_address = data.resident_address;
      }

      if (data.home_address) {
        newData.home_address = data.home_address;
      }

      newData.current_number = Number(checkData.current_number) + 1;

      if (
        data.user_branch !== checkData.user_branch ||
        data.user_role !== checkData.user_role ||
        data.name !== checkData.name ||
        data.start_time !== checkData.start_time ||
        data.end_time !== checkData.end_time ||
        data.user_trx_identifier_code !== checkData.user_trx_identifier_code ||
        data.email !== checkData.email ||
        data.status !== checkData.status
      ) {
        if (message === "Success") {
          console.log(data.user_branch);

          const cleanNewData = otherFunction.clean(newData);
          await db
            .collection("customers")
            .update(id, cleanNewData, {
              mergeObjects: true,
              returnNew: true,
              returnOld: true,
              waitForSync: true,
            })
            .then((res) => {
              const audiTrailData = {
                oldData: res.old,
                newData: res.new,
              };
              createAuditTrail(audiTrailData, "customer_trails");
              return res
            })
            .catch((response) => {
              message = response.message;
              responseCode = "E0";
              return { message, responseCode };
            });
            dataChange = true
        }
      }
      const resData = {
        message,
        responseCode,
        dataChange
      };
      console.log(resData);
      console.log("end update customers function");
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

  async function customerSave (data) {
    console.log("start customer save function")
    console.log("data: " + JSON.stringify(data))

    // PREPARE VARIABLE
    const resData = {
      message: "Success",
      responseCode: "S1"
    }

    try {
      var checkData = "";
      var id_type = ""
      var id_number = ""
      const date = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      });

      // CHECK KTP ID NUMBER EXISTS
      if (data.ktp && data.ktp.id_number) {
        id_type = "ktp"
        id_number = data.ktp.id_number
        checkData = await db.query(aql`
          FOR u IN customers
            FILTER u.${id_type}.id_number == ${id_number}
          RETURN u
        `)
        // CHECK CUSTOMER WITH ID TYPE EXISTS
        if (checkData._result.length !== 0 && checkData._result[0] && checkData._result[0]._key !== data.customer_id) {
          resData.message = `${id_type.toUpperCase()} ID type with the number ${id_number} already exists.`
          resData.responseCode = "E0"
          return resData
        }
      }
      // CHECK SIM ID NUMBER EXISTS
      if (data.sim && data.sim.id_number) {
        id_type = "sim"
        id_number = data.sim.id_number
        checkData = await db.query(aql`
          FOR u IN customers
            FILTER u.${id_type}.id_number == ${id_number}
          RETURN u
        `)
        // CHECK CUSTOMER WITH ID TYPE EXISTS
        if (checkData._result.length !== 0 && checkData._result[0] && checkData._result[0]._key !== data.customer_id) {
          resData.message = `${id_type.toUpperCase()} ID type with the number ${id_number} already exists.`
          resData.responseCode = "E0"
          return resData
        }
      }
      // CHECK PASSPORT ID NUMBER EXISTS
      if (data.passport && data.passport.id_number) {
        id_type = "passport"
        id_number = data.passport.id_number
        checkData = await db.query(aql`
          FOR u IN customers
            FILTER u.${id_type}.id_number == ${id_number}
          RETURN u
        `)
        // CHECK CUSTOMER WITH ID TYPE EXISTS
        if (checkData._result.length !== 0 && checkData._result[0] && checkData._result[0]._key !== data.customer_id) {
          resData.message = `${id_type.toUpperCase()} ID type with the number ${id_number} already exists.`
          resData.responseCode = "E0"
          return resData
        }
      }
      // CHECK OTHERS ID NUMBER EXISTS
      if (data.others && data.others.id_number) {
        id_type = "others"
        id_number = data.others.id_number
        checkData = await db.query(aql`
          FOR u IN customers
            FILTER u.${id_type}.id_number == ${id_number}
          RETURN u
        `)
        // CHECK CUSTOMER WITH ID TYPE EXISTS
        if (checkData._result.length !== 0 && checkData._result[0] && checkData._result[0]._key !== data.customer_id) {
          resData.message = `${id_type.toUpperCase()} ID type with the number ${id_number} already exists.`
          resData.responseCode = "E0"
          return resData
        }
      }

      if (data.customer_id) {
        console.log("customer id is exists")
        // GET OLD CUSTOMER DATA
        checkData = await db
          .collection("customers")
          .document(data.customer_id)
          .catch((response) => {
            resData.message = response.message;
            resData.responseCode = "E1";
            return;
          });

        if (resData.message !== "Success") return resData;

        data.last_updated_date = dateformat(date, "m/d/yyyy")
        data.last_updated_timestamp = date
        data.last_inputter = data.inputter
        data.last_inputter_name = data.inputter_name

        // MATCHING NEW CUSTOMER DATA AND OLD CUSTOMER DATA
        if (otherFunction.validateObject(data, checkData) === false) {
          if (resData.message === "Success") {
            data.current_number = Number(checkData.current_number) + 1;

            // CLEAN DATA
            const cleanData = otherFunction.clean(data);
            console.log("before update customer save");
            console.log(cleanData);

            // SAVE CLEAN DATA TO DATABASE
            const updData = await db
              .collection("customers")
              .update(data.customer_id, cleanData, {
                mergeObjects: true,
                returnNew: true,
                returnOld: true,
                waitForSync: true,
              })
              .then((res) => {
                const audiTrailData = {
                  oldData: res.old,
                  newData: res.new,
                };
                createAuditTrail(audiTrailData, "customer_trails");
                return res
              })
              .catch((response) => {
                resData.message = response.message;
                resData.responseCode = "E0";
                resData.customer_id = data.customer_id;
                return;
              });
            
            if (updData) {
              delete updData.new._key
              delete updData.new._rev
              delete updData.new._id
              resData.customer = updData.new
            }

            // PREPARE FOR TABLE CUSTOMER TRAILS
            resData.auditTrail = {
              oldData: checkData,
              newData: data,
              collection: "customer_trails"
            }

            // CHANGE CUSTOMER STATUS KEYCLOAK
            if (data.status === "ACTIVE" && data.status !== checkData.status) {
              console.log("data.status : " + data.status);
              console.log("checkData.status : " + checkData.status);
              const activeUser = await activateUser(data.customer_id);
              if (activeUser.message !== "Success") {
                resData.message = activeUser.message;
                resData.responseCode = activeUser.responseCode;
              }
            } else if (data.status === "INACTIVE" && data.status !== checkData.status) {
              console.log("data.status : " + data.status);
              console.log("checkData.status : " + checkData.status);
              const deactiveUser = await deactivateUser(data.customer_id);
              if (deactiveUser.message !== "Success") {
                resData.message = deactiveUser.message;
                resData.responseCode = deactiveUser.responseCode;
              }
            }
          }
        }
      } else {

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
        const cusID = await db.collection("customers").save(cleanData, {
          mergeObjects: true,
          returnNew: true,
          waitForSync: true,
        })
          .then((res) => {
            const audiTrailData = {
              oldData: null,
              newData: res.new,
            };
            createAuditTrail(audiTrailData, "customer_trails");
            return res
          })
        console.log(cusID._key);
        resData.customer_id = cusID._key;
        resData.customer = cleanData
        resData.customer.customer_id = cusID._key;

        resData.auditTrail = {
          oldData: checkData,
          newData: data,
          collection: "customer_trails"
        }
      }
      console.log(resData);
      console.log("end update customers function");
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
