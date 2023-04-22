const express = require('express')
const reviewRouter = express.Router()

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController')

reviewRouter.route('/').get(getAllReviews).post(authenticateUser, createReview)

reviewRouter
  .route('/:id')
  .get(getSingleReview)
  .post(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview)

module.exports = reviewRouter
