const Jwt = require('jsonwebtoken')
const customError = require('../errors')
const { isTokenValid } = require('../utils/')

const authenticateUser = (req, resp, next) => {
  console.log(req.signedCookies)
  const { token } = req.cookies

  if (!token) {
    throw new customError.UnauthenticatedError('No token is found')
  }

  try {
    const { role, name, id } = isTokenValid(token)
    req.user = { id, name, role }
    next()
  } catch (error) {
    throw new customError.UnauthenticatedError('Invalid credentials')
  }
}

const authorizePermissions = (...persmissions) => {
  return (req, resp, next) => {
    if (!persmissions.includes(req.user.role)) {
      throw new customError.UnauthorizedError(
        'You dont have permissions to access this route'
      )
    }

    next()
  }
}

module.exports = { authenticateUser, authorizePermissions }
