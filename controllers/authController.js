const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { attachCookieToResponse } = require('../utils')
const CustomError = require('../errors')

const register = async (req, resp) => {
  const { email, name, password } = req.body

  const isEmailAlreadyExists = await User.findOne({ email })

  if (isEmailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }

  const isFirst = (await User.countDocuments({})) === 0
  const role = isFirst ? 'admin' : 'user'
  const user = await User.create({ email, name, password, role })

  const tokenUser = { name: user.name, role: user.role, id: user._id }

  attachCookieToResponse(resp, tokenUser)

  resp.status(StatusCodes.OK).json({ user: tokenUser })
}

const login = async (req, resp) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError(
      'Email and Password should not be empty'
    )
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }

  const isPasswordMatch = await user.comparePassword(password)

  if (!isPasswordMatch) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }

  const tokenUser = { name: user.name, role: user.role, id: user._id }

  attachCookieToResponse(resp, tokenUser)

  resp.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, resp) => {
  resp.cookie('token', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  resp
    .status(StatusCodes.OK)
    .json({ status: 'successfull', msg: 'Successfully  able to logout user' })
}

module.exports = { register, login, logout }
