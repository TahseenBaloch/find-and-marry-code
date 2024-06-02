const express = require('express')
const router = express.Router()
const {
  sendMessage,
  getConversations,
  getConversationPartner,
} = require('../controllers/messages')

router.route('/send-message').post(sendMessage)
router.route('/conversations/:id').get(getConversations)
router.route('/user/:userId').get(getConversationPartner)

module.exports = router
