const Message = require('../model/Message')
const Conversations = require('../model/Conversation')
const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')
const Conversation = require('../model/Conversation')

const sendMessage = async (req, res) => {
  let { message, senderId, receiverId, conversationId } = req.body
  if (!conversationId) {
    const newConversation = await Conversations.create({
      members: [senderId, receiverId],
    })
    conversationId = newConversation._id
  }
  try {
    const saved_message = await Message.create({
      message,
      senderId,
      receiverId,
      conversationId,
    })
    res.status(200).json({ msg: 'Message Sent Successfully' })
  } catch (error) {
    console.log(error, 'error')
  }
}

const getConversationPartner = async (req, res) => {
  const { userId } = req.params
  const id = req.user.userId
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'User not Found' })
    }
    const conversationUser = await Conversation.find({
      members: {
        $in: [id],
      },
    })
    if (!conversationUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'You do not have any conversations' })
    }

    let receiverId = null
    let conversationId = null

    for (const user of conversationUser) {
      let id = user.members.filter((member) => member === userId)
      if (id[0]) {
        receiverId = id
        conversationId = user._id
        break
      }
    }
    if (!receiverId) {
      return res.status(StatusCodes.OK).json({
        user: {
          name: user.name,
          user_img: user.user_img,
          gender: user.user_bio.gender,
          _id: user._id,
        },
        conversationId: null,
        conversationMessages: [],
      })
    }

    const conversationMessage = await Message.find({
      conversationId,
    })

    res.status(StatusCodes.OK).json({
      user: {
        name: user.name,
        user_img: user.user_img,
        _id: user._id,
        gender: user.user_bio.gender,
      },
      conversationMessages: conversationMessage,
      conversationId,
    })
  } catch (error) {
    console.log(error)
  }
}

const getConversations = async (req, res) => {
  const { id } = req.params
  try {
    const conversations = await Conversations.find({
      members: { $in: [id] },
    })
    if (!conversations) {
      return res.status(200).json({ msg: 'No Messages Yet' })
    }
    const allUsersData = Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find((member) => member !== id)
        const user = await User.findById(receiverId)
        return {
          name: user.name,
          user_img: user.user_img,
          gender: user.user_bio.gender,
          _id: user._id,
        }
      })
    )
    return res.status(200).json(await allUsersData)
  } catch (error) {
    console.log(error)
  }
}

module.exports = { sendMessage, getConversations, getConversationPartner }
