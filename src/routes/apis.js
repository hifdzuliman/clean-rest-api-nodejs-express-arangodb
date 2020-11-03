const router = require('express').Router()
const handleContactsRequest = require('./../functions')
const adaptRequest = require ('./../helpers/adapt-request')

const path = "api"

router.post(path +"/register", contactsController)
router.get(path +"/login", contactsController)
router.get(path +"/getcustomer/:id", contactsController)
router.get(path +"/getcustomermigration/:id", contactsController)
router.get(path +"/getcustomermobile/:id", contactsController)
router.get(path +"/bankaccountlist/:id", contactsController)
router.get(path +"/logout/:id", contactsController)
router.get(path +"/forgotpassword/:id", contactsController)
router.get(path +"/pickuprecipient/:id", contactsController)
router.post(path +"/getcustomerlist", contactsController)
router.post(path +"/getcustomermigrationlist", contactsController)
router.post(path +"/savebankaccount", contactsController)
router.post(path +"/resetcode", contactsController)
router.post(path +"/sendotp", contactsController)
router.post(path +"/updatephone", contactsController)
router.post(path +"/verifyphone", contactsController)
router.put(path +"/updatecustomer/:id", contactsController)
router.post(path +"/savecustomer", contactsController)
router.post(path +"/savecustomer", contactsController)
router.post(path +"/savecustomermigration", contactsController)
router.post(path +"/pickuprecipient", contactsController)
router.get(path + "/generatekey/:id", contactsController)
router.get(path + "/forgotpin/:id", contactsController)
router.put(path +"/verifypin/:id", contactsController)
router.put(path +"/pinhash/:id", contactsController)
router.put(path +"/savepin/:id", contactsController)
router.delete(path +"/deletecustomermigration/:id", contactsController)
router.delete(path +"/pickuprecipient/:id", contactsController)

function contactsController (req, res) {
    const httpRequest = adaptRequest(req)
    handleContactsRequest(httpRequest)
      .then(({ headers, statusCode, data }) =>
        res
          .set(headers)
          .status(statusCode)
          .send(data)
      )
      .catch(e => res.status(500).end())
  }

module.exports = router