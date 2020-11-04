const router = require('express').Router()
const handleContactsRequest = require('./../functions')
const adaptRequest = require ('./../helpers/adapt-request')

const path = "apis"

router.post(path +"/list", contactsController)
router.post(path +"/save", contactsController)
router.get(path +"/get/:id", contactsController)
router.put(path +"/update/:id", contactsController)
router.delete(path +"/delete/:id", contactsController)

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