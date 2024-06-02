const express = require('express')
const router = express.Router()
const { getAllProfiles, getProfileData } = require('../controllers/profiles')

router.route('/get-all-profiles').get(getAllProfiles)
router.route('/profile').get(getProfileData)

module.exports = router
