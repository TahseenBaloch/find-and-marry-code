const mongoose = require('mongoose')

const UserOTPVerification = mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
})

module.exports = mongoose.model('UserOTPVerification', UserOTPVerification)
