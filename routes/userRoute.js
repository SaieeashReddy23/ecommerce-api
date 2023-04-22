const express = require('express')

const router = express.Router()

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
} = require('../controllers/userController')

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers)
router.route('/showme').get(authenticateUser, showCurrentUser)

router.route('/updateuser').post(authenticateUser, updateUser)
router.route('/updatePassword').post(authenticateUser, updateUserPassword)

router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router
