const { StatusCodes } = require('http-status-codes')
const User = require('../model/User')
const emailExistence = require('email-existence')

const register = async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res
      .status(401)
      .json({ msg: 'Please provide name, email, and password' })
  }

  emailExistence.check(email, async (error, response) => {
    if (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: 'Internal Server Error',
        msgCode: 'server_error',
      })
    }
    if (!response) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'Email does not exists',
        msgCode: 'email',
      })
    }

    try {
      const user = await User.create(req.body)
      return res.status(201).json({ email: user.email, id: user._id })
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ msg: 'Email already exists', msgCode: 'email' })
      }
      if (err.name === 'ValidationError') {
        ValErrMsg = Object.values(err.errors)
          .map((item) => item.message)
          .join(',')
        return res.status(400).json({ error: ValErrMsg })
      }
      if (err.name === 'CastError') {
        res
          .status(404)
          .json({ error: `No items found with the id: ${error.value}` })
      }
    }
  })
}

const createUserBio = async (req, res) => {
  const { user_bio, id } = req.body
  try {
    const user = await User.findOne({ _id: id })
    user.user_bio = { ...user_bio }
    user.userbioVerified = true

    await user.save()

    const token = user.createJWT()

    delete user.password
    return res.status(StatusCodes.OK).json({
      user: {
        name: user.name,
        _id: user._id,
        requests: {
          received_requests: user.received_requests,
          sent_requests: user.sent_requests,
          friends: user.friends,
        },
        user_bio: user.user_bio,
        user_img: user.user_img,
      },
      token,
      OTPVerified: user.OTPVerified,
      userbioVerified: user.userbioVerified,
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

const login = async (req, res) => {
  const { email, password, remember_me } = req.body
  if (!email || !password) {
    return res.status(401).json({ msg: 'Please provide email, and password' })
  }
  const user = await User.findOne({ email })
  if (!user) {
    return res
      .status(404)
      .json({ msg: 'Email does not exist', msgCode: 'email-incorrect' })
  }
  const isCorrect = await user.comparePassword(password)
  if (!isCorrect) {
    return res
      .status(401)
      .json({ msg: 'Wrong Password', msgCode: 'password-incorrect' })
  }
  user.remember_me = remember_me
  await user.save()

  if (user.OTPVerified == false) {
    return res.status(StatusCodes.OK).json({
      email: user.email,
      id: user._id,
      OTPVerified: user.OTPVerified,
      userbioVerified: user.userbioVerified,
    })
  } else if (user.userbioVerified == false) {
    return res.status(StatusCodes.OK).json({
      email: user.email,
      id: user._id,
      OTPVerified: user.OTPVerified,
      userbioVerified: user.userbioVerified,
    })
  } else {
    const token = user.createJWT()
    return res.status(200).json({
      user: {
        name: user.name,
        _id: user._id,
        requests: {
          received_requests: user.received_requests,
          sent_requests: user.sent_requests,
          friends: user.friends,
        },
        user_bio: user.user_bio,
        user_img: user.user_img,
      },
      token,
      remember_me,
      OTPVerified: user.OTPVerified,
      userbioVerified: user.userbioVerified,
    })
  }
}
module.exports = { register, login, createUserBio }

// {
//       user: {
//         name: user.name,
//         _id: user._id,
//         requests: {
//           received_requests: user.received_requests,
//           sent_requests: user.sent_requests,
//           friends: user.friends,
//         },
//         user_bio: user.user_bio,
//         user_img: user.user_img,
//       },
//       token,
//     }
