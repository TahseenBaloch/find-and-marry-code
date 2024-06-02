const express = require('express')
const router = express.Router()
const { register, login, createUserBio } = require('../controllers/auth')
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/create-user-bio').post(createUserBio)

module.exports = router
