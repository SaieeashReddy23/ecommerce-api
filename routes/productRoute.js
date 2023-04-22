const express = require('express')
const productRouter = express.Router()

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
  singleProductReviews,
} = require('../controllers/productController')

productRouter
  .route('/')
  .get(getAllProducts)
  .post(authenticateUser, authorizePermissions('admin'), createProduct)

productRouter.route('/uploadImage').post(uploadImage)

productRouter.route('/:id/reviews').get(singleProductReviews)

productRouter
  .route('/:id')
  .get(getSingleProduct)
  .delete(authenticateUser, authorizePermissions('admin'), deleteProduct)
  .post(authenticateUser, authorizePermissions('admin'), updateProduct)

module.exports = productRouter
