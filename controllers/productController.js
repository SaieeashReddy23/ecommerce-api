const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const customError = require('../errors')

const Review = require('../models/Review')

const cloudinary = require('cloudinary').v2

const fs = require('fs')

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

const createProduct = async (req, resp) => {
  req.body.user = req.user.id

  const product = await Product.create({ ...req.body })

  resp.status(StatusCodes.OK).json({ product })
}

const getAllProducts = async (req, resp) => {
  const products = await Product.find({})
  resp.status(StatusCodes.OK).json({ products, count: products.length })
}

const getSingleProduct = async (req, resp) => {
  const { id } = req.params

  const product = await Product.findById(id)

  if (!product) {
    throw new customError.NotFoundError(
      `No product is found for this id : ${id} `
    )
  }

  resp.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, resp) => {
  const { id } = req.params

  const product = await Product.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  )

  if (!product) {
    throw new customError.NotFoundError('No product is found with this id')
  }

  resp.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, resp) => {
  const { id } = req.params

  const product = await Product.findById(id)

  if (!product) {
    throw new customError.NotFoundError('No product is found with this id')
  }

  await product.remove()
  resp.status(StatusCodes.OK).json({ msg: 'Product is successfully deleted' })
}

const uploadImage = async (req, resp) => {
  if (!req.files) {
    throw new customError.BadRequestError('No file is uploaded')
  }

  const { Image: productImage } = req.files

  if (!productImage.mimetype.startsWith('image')) {
    throw new customError.BadRequestError('Pls Upload an Image')
  }

  const maxSize = 1024 * 1024

  if (productImage.size > maxSize) {
    throw new customError.BadRequestError(
      'Image size should not be greater than 1MB'
    )
  }

  const res = await cloudinary.uploader.upload(productImage.tempFilePath, {
    use_filename: true,
    folder: 'Ecommerce',
  })

  fs.unlinkSync(productImage.tempFilePath)

  resp.status(StatusCodes.OK).json({ src: res.secure_url })
}

const singleProductReviews = async (req, resp) => {
  const { id } = req.params

  const Reviews = await Review.find({ productId: id })

  resp.status(StatusCodes.OK).json({ Reviews, count: Reviews.length })
}

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  singleProductReviews,
}
