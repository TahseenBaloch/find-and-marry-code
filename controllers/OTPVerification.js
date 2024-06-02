require('dotenv').config()
const bcryptjs = require('bcryptjs')
const UserOTPVerification = require('../model/UserOTPVerification')
const nodemailer = require('nodemailer')
const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')
const emailExistence = require('email-existence')

require('dotenv').config()

let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: process.env.AUTH_MAIL,
    pass: process.env.AUTH_PASS,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.log(error)
  } else {
    console.log('Ready for the messages')
  }
})

const sendOTP = async (req, res) => {
  const { _id, email } = req.body

  try {
    if (!_id || !email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'Please provide all the values.',
        msgCode: 'provide_all',
      })
    } else {
      await UserOTPVerification.deleteMany({ userId: _id })
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`
      const mailOptions = {
        from: process.env.AUTH_MAIL,
        to: email,
        subject: 'Verify your email',
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <h2 style="text-align: center; color: #333;">Verify your email</h2>
      <p style="font-size: 16px; color: #555;">
        Please use the following OTP to verify your email address:
      </p>
      <p style="font-size: 24px; font-weight: bold; color: #333; text-align: center; margin: 20px 0;">
        ${otp}
      </p>
      <p style="font-size: 16px; color: #555;">
        This OTP will expire in <b>1 hour</b>.
      </p>
      <p style="font-size: 16px; color: #555;">
        If you did not request this verification, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
      <p style="text-align: center; font-size: 14px; color: #aaa;">
        © 2024 Find and Marry. All rights reserved.
      </p>
    </div>
  `,
      }

      const saltRounds = 10

      const hashedOTP = await bcryptjs.hash(otp, saltRounds)
      UserOTPVerification.create({
        userId: _id,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      })
      await transporter.sendMail(mailOptions)

      return res.status(200).json({
        status: 'PENDING',
        message: 'verification otp sent',
        data: {
          userId: _id,
          email,
        },
      })
    }
  } catch (error) {
    return res.json({
      status: 'FAILED',
      message: error.message,
    })
  }
}

const verifyOTP = async (req, res) => {
  const { id, otp } = req.body
  try {
    if (!id || !otp) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Please provide all the values.', msgCode: 'provide_all' })
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId: id,
      })
      if (UserOTPVerificationRecords.length <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: 'OTP not found',
          msgCode: 'account_not_exists',
        })
      } else {
        const { expiresAt } = UserOTPVerificationRecords[0]
        const hashedOTP = UserOTPVerificationRecords[0].otp

        if (expiresAt < Date.now()) {
          await UserOTPVerification.deleteMany({ userId: id })
          return res.status(StatusCodes.BAD_REQUEST).json({
            msg: 'Code has expired. Please request again.',
            msgCode: 'code_expired',
          })
        } else {
          let validOTP = await bcryptjs.compare(otp, hashedOTP)
          if (!validOTP) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              msg: 'OTP is not correct',
              msgCode: 'incorrect_otp',
            })
          } else {
            let user = await User.findById(id)
            if (!user) {
              return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ msg: 'User not found.' })
            }
            user.OTPVerified = true
            await user.save()
            await UserOTPVerification.deleteMany({ userId: id })

            return res.status(StatusCodes.OK).json({
              email: user.email,
              id,
              OTPVerified: user.OTPVerified,
              userbioVerified: user.userbioVerified,
            })
          }
        }
      }
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'Error',
      msgCode: 'error',
    })
  }
}

module.exports = { sendOTP, verifyOTP }
