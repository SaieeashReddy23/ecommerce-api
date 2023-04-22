const customError = require('../errors/')

const checkPermissions = (requestedUser, requestedUserId) => {
  // console.log(requestedUser)
  // console.log(requestedUserId)
  // console.log(typeof requestedUserId)

  if (requestedUser.role === 'admin') return
  if (requestedUser.id === requestedUserId.toString()) return

  throw new customError.UnauthorizedError(
    'Not authorized to access this resource'
  )
}

module.exports = checkPermissions
