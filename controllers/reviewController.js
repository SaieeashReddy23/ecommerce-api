const { StatusCodes } = require('http-status-codes')

const Product = require('../models/Product')
const User = require('../models/user')
const Review = require('../models/Review')

const { checkPermissions } = require('../utils/')

const customeError = require('../errors/')

const getAllReviews = async (req, resp) => {
  const reviews = await Review.find({}).populate({
    path: 'productId',
    select: 'name price description',
  })
  resp.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async (req, resp) => {
  const { id } = req.params

  const review = await Review.findById(id)

  if (!review) {
    throw customeError.NotFoundError(`No review is found with this id : ${id}`)
  }

  resp.status(StatusCodes.OK).json(review)
}

const createReview = async (req, resp) => {
  const product = await Product.findById(req.body.productId)

  if (!product) {
    throw new customeError.NotFoundError(
      `Not able to find the product for this productid : ${productId} `
    )
  }

  const isAlreadySubmitted = await Review.findOne({
    productId: req.body.productId,
    userId: req.user.id,
  })

  if (isAlreadySubmitted) {
    throw new customeError.BadRequestError('Already submitted')
  }

  req.body.userId = req.user.id

  const review = await Review.create({ ...req.body })

  resp.status(StatusCodes.OK).json(review)
}

const updateReview = async (req, resp) => {
  const { id: reviewId } = req.params
  const { id: userId } = req.user
  const { rating, title, comment } = req.body

  const review = await Review.findById(reviewId)

  if (!review) {
    throw new customeError.NotFoundError(
      `No review is found with this id : ${reviewId}`
    )
  }

  checkPermissions(req.user, review.userId)

  review.rating = rating
  review.title = title
  review.comment = comment

  await review.save()

  resp.status(StatusCodes.OK).json({ review })

  resp.send('Update a  review')
}

const deleteReview = async (req, resp) => {
  const { id: reviewId } = req.params

  const review = await Review.findById(reviewId)

  if (!review) {
    throw new customeError.NotFoundError(
      `No review is found with this id : ${reviewId}`
    )
  }

  checkPermissions(req.user, review.userId)

  await review.remove()

  resp.status(StatusCodes.OK).json({ msg: 'Review is successfully deleted' })
}

module.exports = {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
}
