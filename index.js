const express = require('express')
const connectDB = require('./db/connectDB')
require('dotenv').config()
const authRouter = require('./routes/User')
const app = express()
const notFound = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const multer = require('multer')
const User = require('./model/User')
const profileRouter = require('./routes/GetProfiles')
const requestRouter = require('./routes/RequestRoute')
const path = require('path')
const { authenticationMiddleware } = require('./middleware/authentication')
const Message = require('./model/Message')
const userChangeStream = User.watch({ fullDocument: 'updateLookup' })
const messageChangeStream = Message.watch({ fullDocument: 'updateLookup' })
const fs = require('fs')
const messageRouter = require('./routes/MessagesRoute')
const OTPRouter = require('./routes/OTPRoutes')
const cors = require('cors')

app.use(express.static(path.resolve(__dirname, './public')))
app.use(express.static(path.resolve(__dirname, './public/build')))
app.use(express.json())
app.use(cors())

const http = require('http')
const { Server } = require('socket.io')

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  },
})
const upload = multer({ storage })

app.post('/upload-image', upload.single('image'), async (req, res) => {
  const { user_id } = req.body
  const userData = await User.findOne({ _id: user_id })
  if (userData.user_img) {
    fs.unlinkSync(`./public${userData.user_img}`)
  }
  const imgURL = req.file.path.replace('public', '')
  userData.user_img = imgURL
  await userData.save()
  res.status(200).json({ image_path: imgURL })
})

let socketUsers = []

io.on('connect', (socket) => {
  socket.on('login', async (userId) => {
    const isUserExists = socketUsers.find((user) => user.userId == userId)

    if (!isUserExists) {
      const user = { userId, socketId: socket.id }
      socketUsers.push(user)
    }

    socket.on('disconnect', () => {
      socketUsers = socketUsers.filter((user) => user.userId !== userId)
    })
  })
})

userChangeStream.on('change', async (change) => {
  if (change.operationType === 'update') {
    const updated = change.updateDescription.updatedFields
    if (updated.updatedAt) {
      delete updated.updatedAt
    }

    const sender = socketUsers.find(
      (user) => user.userId == change.documentKey._id
    )

    if (sender) {
      let keyz = Object.keys(updated)
      let changedNoti = false
      let changedMsg = false
      keyz.map((key) => {
        if (key.includes('notifications')) {
          changedNoti = true
        }
      })

      if (changedNoti) {
        io.to(sender.socketId).emit('changedNotification', {
          notifications: [...change.fullDocument.notifications],
        })
      }

      io.to(sender.socketId).emit('friendUpdate', {
        allRequests: {
          sent_requests: [...change.fullDocument.sent_requests],
          received_requests: [...change.fullDocument.received_requests],
          friends: [...change.fullDocument.friends],
        },
      })
    }
  }
})
messageChangeStream.on('change', async (change) => {
  let id = change.fullDocument.receiverId
  const sender = socketUsers.find((user) => user.userId === id)
  if (sender) {
    io.to(sender.socketId).emit('messageChanged', {
      newMessage: [change.fullDocument],
    })
  }
})

app.use('/api/profiles', profileRouter)
app.use('/api/auth', authRouter)
app.use('/api/otp', OTPRouter)
app.use('/api/message', authenticationMiddleware, messageRouter)
app.use('/api/requests', authenticationMiddleware, requestRouter)

app.get('*', async (req, res) => {
  return res.sendFile(path.resolve(__dirname, './public/build', 'index.html'))
})

app.use(notFound)
app.use(errorHandlerMiddleware)

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    server.listen(5000, console.log('server is listening at 5000...'))
  } catch (error) {
    console.log(error)
  }
}

start()
