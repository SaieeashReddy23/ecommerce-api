const Product = require('../models/Product')
const { checkPermissions } = require('../utils')

const { StatusCodes } = require('http-status-codes')

const customError = require('../errors')
const Order = require('../models/Order')

const fakeStripeApi = async ({ amount, currency }) => {
  const clientSecret = 'SomeRandomvalue'

  return { amount, clientSecret }
}

const createOrder = async (req, resp) => {
  const { tax, shippingFee, items: cartItems } = req.body

  if (!cartItems || cartItems.length < 1) {
    throw new customError.BadRequestError(
      'No cartItems are provided in the order'
    )
  }

  if (!tax || !shippingFee) {
    throw new customError.BadRequestError('Please provide Tax and Shipping fee')
  }

  let orderItems = []
  let subtotal = 0

  for (const item of cartItems) {
    const dbProduct = await Product.findById(item.product)

    if (!dbProduct) {
      throw new customError.NotFoundError(
        `No product is found with this id : ${item.product}`
      )
    }

    const { name, image, price, _id } = dbProduct

    const singleItem = { name, image, price, amount: item.amount, product: _id }

    orderItems = [...orderItems, singleItem]
    subtotal += price * item.amount
  }

  const total = tax + shippingFee + subtotal

  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: 'USD',
  })

  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    user: req.user.id,
    orderItems,
    clientSecret: paymentIntent.clientSecret,
  })

  resp.status(StatusCodes.CREATED).json({ order })
}

const getAllOrders = async (req, resp) => {
  const orders = await Order.find({})

  resp.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const getSingleOrder = async (req, resp) => {
  const { id } = req.params

  const order = await Order.findById(id)

  if (!order) {
    throw new customError.NotFoundError(`No Order found with this id : ${id}`)
  }

  checkPermissions(req.user, order.user)

  resp.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, resp) => {
  const orders = await Order.find({ user: req.user.id })

  resp.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const updateOrder = async (req, resp) => {
  const { id } = req.params

  const { paymentIntentId } = req.body

  const order = await Order.findById(id)

  if (!order) {
    throw new customError.NotFoundError(`No Order found with this id : ${id}`)
  }

  checkPermissions(req.user, order.user)

  order.paymentIntentId = paymentIntentId
  order.status = 'paid'

  await order.save()

  resp.status(StatusCodes.OK).json({ order })
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
}
