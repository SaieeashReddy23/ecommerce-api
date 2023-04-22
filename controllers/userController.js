const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const customError = require('../errors/')
const { attachCookieToResponse, checkPermissions } = require('../utils')

const getAllUsers = async (req, resp) => {
  const users = await User.find({ role: 'user' }).select('-password')

  resp.status(StatusCodes.OK).json({ users, count: users.length })
}

const getSingleUser = async (req, resp) => {
  const { id } = req.params

  const user = await User.findById(id).select('-password')

  if (!user) {
    throw new customError.NotFoundError(`No user found for this id : ${id} `)
  }

  checkPermissions(req.user, user._id)

  resp.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, resp) => {
  const user = req.user

  resp.status(StatusCodes.OK).json({ user })
}

const updateUser = async (req, resp) => {
  const { name, email } = req.body

  const { id } = req.user

  if (!name || !email) {
    throw new customError.BadRequestError(
      'Both name and email should not be empty'
    )
  }

  const user = await User.findByIdAndUpdate(
    id,
    { name, email },
    { new: true, runValidators: true }
  )

  const tokenUser = { name: user.name, role: user.role, id: user._id }

  attachCookieToResponse(resp, tokenUser)
  resp.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, resp) => {
  const { oldPassword, newPassword } = req.body

  const { id } = req.user

  if (!oldPassword || !newPassword) {
    throw new customError.BadRequestError(
      'Both oldPassword and newPassword should not empty'
    )
  }

  const user = await User.findById(id)

  const isPasswordCorrect = await user.comparePassword(oldPassword)

  if (!isPasswordCorrect) {
    throw new customError.UnauthenticatedError('Invalid Credentials')
  }

  user.password = newPassword

  await user.save()

  resp
    .status(StatusCodes.OK)
    .json({ msg: 'User password is succesfully Updated' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
