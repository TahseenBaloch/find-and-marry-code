const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema({
  conversationId: {
    type: String,
  },
  senderId: {
    type: String,
  },
  receiverId: {
    type: String,
  },
  message: {
    type: String,
  },
})

module.exports = mongoose.model('Message', MessageSchema)
