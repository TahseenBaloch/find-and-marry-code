const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { type } = require('express/lib/response')
const { ObjectId } = mongoose.Schema.Types

const User = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
    },
    user_img: {
      type: String,
      default: '',
    },
    sent_requests: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    received_requests: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    friends: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],

    remember_me: {
      type: Boolean,
      default: true,
    },

    notifications: [
      { sender: { type: ObjectId }, request_type: { type: String } },
    ],

    user_bio: {
      first_name: {
        type: String,
        trim: true,
      },
      last_name: {
        type: String,
        trim: true,
      },
      user_id: {
        type: String,
      },
      date_of_birth: {
        type: String,
      },
      cast: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
      },
      country: {
        type: String,
      },
      education_level: {
        type: String,
      },
      employment_status: {
        type: String,
      },
      gender: {
        type: String,
      },
      height: {
        type: String,
      },
      marital_status: {
        type: String,
      },
      profession: {
        type: String,
      },
      religion: {
        type: String,
      },
      residence: {
        type: String,
      },
    },

    OTPVerified: { type: Boolean, default: false },
    userbioVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

User.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }
  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
})

User.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EXPIRES_IN }
  )
}
User.methods.comparePassword = async function (password) {
  const isMatch = await bcryptjs.compare(password, this.password)
  return isMatch
}
module.exports = mongoose.model('User', User)
