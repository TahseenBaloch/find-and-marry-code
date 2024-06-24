const User = require('../model/User')
// const fakeData = require('../public/data_to_upload.json')
const connectDB = require('./connectDB')
require('dotenv').config()
let fakeData = [
  {
    name: 'Asad Jamal',
    email: 'elehrerm@smh.com.au',
    password: 'dummy user',
    user_img: '\\images\\person23.jpg',
    sent_requests: [],
    received_requests: [],
    friends: [],
    remember_me: true,
    OTPVerified: true,
    userbioVerified: true,
    notifications: [],
    user_bio: {
      first_name: 'Asad',
      last_name: 'Jamal',
      date_of_birth: '1991-11-03',
      cast: 'Baloch',
      city: 'Swat',
      country: 'Pakistan',
      education_level: 'Higher Secondary (12th)',
      employment_status: 'Employed',
      gender: 'Male',
      height: 4.0,
      marital_status: 'Married',
      profession: 'Teacher',
      religion: 'Christianity',
      residence: 'Haripur',
    },
  },
  {
    name: 'Hamza Arif',
    email: 'lcossonn@digg.com',
    password: 'dummy user',
    user_img: '\\images\\person24.jpg',
    sent_requests: [],
    received_requests: [],
    friends: [],
    remember_me: true,
    OTPVerified: true,
    userbioVerified: true,
    notifications: [],
    user_bio: {
      first_name: 'Hamza',
      last_name: 'Arif',
      date_of_birth: '1999-04-21',
      cast: 'Arain',
      city: 'Mirpur Khas',
      country: 'Pakistan',
      education_level: 'No formal education',
      employment_status: 'Government Job',
      gender: 'Male',
      height: 5.2,
      marital_status: 'Separated',
      profession: 'Military Officer',
      religion: 'Kalash',
      residence: 'Charsadda',
    },
  },
  {
    name: 'Ali Raza',
    email: 'kstonardo@tinyurl.com',
    password: 'dummy user',
    user_img: '\\images\\person25.jpg',
    sent_requests: [],
    received_requests: [],
    friends: [],
    remember_me: true,
    OTPVerified: true,
    userbioVerified: true,
    notifications: [],
    user_bio: {
      first_name: 'Ali',
      last_name: 'Raza',
      date_of_birth: '1999-09-01',
      cast: 'Jutt',
      city: 'Gujranwala',
      country: 'Pakistan',
      education_level: 'Post Doctorate',
      employment_status: 'Freelancer',
      gender: 'Male',
      height: 4.8,
      marital_status: 'Single',
      profession: 'Teacher',
      religion: 'Sikhism',
      residence: 'Wah Cantt',
    },
  },
]
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
