const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')
const fs = require('fs')

const updateUser = async (req, res) => {
  const request = req.body
  try {
    const user = await User.findOne({ _id: req.user.userId })
    user.user_bio = { ...request }
    await user.save()
    const token = user.createJWT()

    res.status(StatusCodes.OK).json({
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
      remember_me: user.remember_me,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

const getAllProfiles = async (req, res) => {
  let { id, page } = req.query
  page = Number(page)
  let limit = 5
  let skip = (page - 1) * limit
  let lastProfile = false

  if (!id) {
    let allProfiles = User.find({
      userbioVerified: true,
    }).select('name user_bio _id user_img')

    allProfiles = allProfiles.skip(skip).limit(limit)

    allProfiles = await allProfiles

    if (allProfiles.length === 0) {
      lastProfile = true
    }

    return res.status(200).json({
      allProfiles,
      notifications: [],
      lastProfile,
    })
  }

  const requestingUser = await User.findById(id).select('user_bio')
  const requestingUserGender =
    requestingUser.user_bio.gender === 'Male' ? 'Female' : 'Male'

  let allProfiles = User.find({
    userbioVerified: true,
    _id: { $ne: id },
    'user_bio.gender': requestingUserGender,
  })
    .sort({ createdAt: -1 })
    .select('name user_bio _id user_img')

  let result = allProfiles.skip(skip).limit(limit)

  allProfiles = await result

  if (allProfiles.length === 0) {
    lastProfile = true
  }

  let requestArray = await User.find({ _id: id }).select(
    'sent_requests received_requests friends notifications'
  )

  let requests = requestArray[0]
  const { notifications } = requests
  requests = {
    received_requests: requests.received_requests,
    sent_requests: requests.sent_requests,
    friends: requests.friends,
  }

  return res
    .status(200)
    .json({ allProfiles, requests, notifications: notifications, lastProfile })
}

const getProfileData = async (req, res) => {
  try {
    const resp = await User.findOne({ _id: req.query.userId })
    const { name, user_bio, _id, user_img } = resp
    res.status(StatusCodes.OK).json({ name, user_bio, _id, user_img })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

const getUserData = async (req, res) => {
  try {
    const resp = await User.findOne({ _id: req.user.userId })
    const { received_requests, sent_requests, friends } = resp
    res
      .status(StatusCodes.OK)
      .json({ received_requests, sent_requests, friends })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

const sendRequest = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $push: {
          received_requests: req.user.userId,
          notifications: {
            sender: req.user.userId,
            request_type: 'sent_requests',
          },
        },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }

  try {
    await User.findByIdAndUpdate(
      { _id: req.user.userId },
      {
        $push: { sent_requests: req.body.id },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
  return res.status(StatusCodes.OK).json({ id: req.body.id })
}

const acceptRequest = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.user.userId },
      {
        $pull: { received_requests: req.body.id },
        $push: { friends: req.body.id },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }

  try {
    await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $pull: { sent_requests: req.user.userId },
        $push: {
          friends: req.user.userId,
          notifications: {
            sender: req.user.userId,
            request_type: 'accepted_requests',
          },
        },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
  return res.status(StatusCodes.OK).json({ msg: 'Requested Accepted' })
}

const cancelRequest = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $pull: { received_requests: req.user.userId },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }

  try {
    await User.findByIdAndUpdate(
      { _id: req.user.userId },
      {
        $pull: { sent_requests: req.body.id },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
  return res.status(StatusCodes.OK).json({ msg: 'Requested Cancelled' })
}

const rejectRequest = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.user.userId },
      {
        $pull: { received_requests: req.body.id },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }

  try {
    await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $pull: { sent_requests: req.user.userId },
      },
      { new: true }
    )
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

const deleteImage = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.id })
    const imagePath = `./public${user.user_img}`
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
      user.user_img = ''
      await user.save()
      res.status(StatusCodes.OK).json({ msg: 'Image Deleted Successfully' })
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Image not found on server' })
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error })
  }
}

module.exports = {
  getAllProfiles,
  sendRequest,
  acceptRequest,
  getUserData,
  cancelRequest,
  rejectRequest,
  getProfileData,
  updateUser,
  deleteImage,
}
