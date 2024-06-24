const express = require('express')
const router = express.Router()
const {
  getAllProfiles,
  getProfileData,
  getProfiles,
} = require('../controllers/profiles')

router.route('/get-all-profiles').get(getAllProfiles)
router.route('/profile').get(getProfileData)
router.route('/profiles').get(getProfiles)

module.exports = router
