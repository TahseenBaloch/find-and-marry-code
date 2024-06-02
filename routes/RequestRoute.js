const express = require('express')
const router = express.Router()
const {
  sendRequest,
  acceptRequest,
  getUserData,
  cancelRequest,
  rejectRequest,
  updateUser,
  deleteImage,
} = require('../controllers/profiles')

router.route('/send-request').put(sendRequest)
router.route('/accept-request').put(acceptRequest)
router.route('/cancel-request').put(cancelRequest)
router.route('/reject-request').put(rejectRequest)
router.route('/get-user').get(getUserData)
router.route('/update-user').patch(updateUser)
router.route('/delete-image').post(deleteImage)
module.exports = router
