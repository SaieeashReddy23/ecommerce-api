const Jwt = require('jsonwebtoken')

const createJwt = ({ payload }) => {
  const token = Jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
  return token
}

const isTokenValid = (token) => Jwt.verify(token, process.env.JWT_SECRET)

const attachCookieToResponse = (resp, user) => {
  const token = createJwt({ payload: user })
  const oneDay = 1000 * 60 * 60 * 24
  resp.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
  })
}

module.exports = {
  createJwt,
  isTokenValid,
  attachCookieToResponse,
}
