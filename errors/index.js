const BadRequestError = require('./bad-request')
const NotFoundError = require('./not-found')
const CustomAPIError = require('./custom-api-error')
const UnauthenticatedError = require('./unathenticated')

module.exports = {
  BadRequestError,
  NotFoundError,
  CustomAPIError,
  UnauthenticatedError,
}
