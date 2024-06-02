const User = require('../model/User')
const fakeData = require('../public/data_to_upload.json')
const connectDB = require('./connectDB')
require('dotenv').config()

const populateDB = async () => {
  try {
    await connectDB(
      'mongodb+srv://thepenspoint29:qwcpQCkfi6cZ8j9p@cluster0.pyakndm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    )
    await User.create(fakeData)
    process.exit(0)
  } catch (error) {
    process.exit(1)
  }
}

populateDB()
