const express = require('express')
const orderRouter = express.Router()

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  getAllOrders,
  createOrder,
  updateOrder,
  getCurrentUserOrders,
  getSingleOrder,
} = require('../controllers/orderController')

orderRouter.route('/showMyOrders').get(authenticateUser, getCurrentUserOrders)

orderRouter
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders)
  .post(authenticateUser, createOrder)

orderRouter
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .post(authenticateUser, updateOrder)

module.exports = orderRouter
