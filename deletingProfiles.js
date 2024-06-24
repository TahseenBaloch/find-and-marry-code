const express = require('express')
const app = express()
const server = http.createServer(app)
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    server.listen(5000, console.log('server is listening at 5000...'))
  } catch (error) {
    console.log(error)
  }
}

start()
