const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, ' pls provide the rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Pls provide the review title'],
      maxlength: [100, 'Title should not be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Pls provide the review comment'],
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pls provide the userId for this review'],
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'Products',
      required: [true, 'Pls provide the ProductId for this review'],
    },
  },
  {
    timestamps: true,
  }
)

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ])

  try {
    await this.model('Products').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numberOfReviews: result[0]?.numOfReviews || 0,
      }
    )
  } catch (error) {
    console.log(error)
  }
}

ReviewSchema.post('save', async function (next) {
  await this.constructor.calculateAverageRating(this.productId)
})

ReviewSchema.post('remove', async function (next) {
  await this.constructor.calculateAverageRating(this.productId)
})

module.exports = mongoose.model('Review', ReviewSchema)
