const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pls provide the product name'],
      trim: true,
      maxlength: [100, ' Name should not be more that 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Pls provide the product price'],
      default: true,
    },
    description: {
      type: String,
      required: [true, 'Pls provide the product description'],
      trim: true,
      maxlength: [1000, 'description should not be more that 1000 characters'],
    },
    image: {
      type: String,
      required: [true, 'Pls provide the product image'],
    },
    category: {
      type: String,
      enum: {
        values: ['office', 'kitchen', 'bedroom'],
        message: '{VALUE} is not supported',
      },
      required: [true, 'Pls provide the product category'],
    },
    company: {
      type: String,
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
      required: [true, 'Pls provide the product company'],
    },
    colors: {
      type: [String],
      required: [true, 'Pls provide the product Colors'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeshippping: {
      type: Boolean,
      default: true,
    },
    inventory: {
      type: Number,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

ProductSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ productId: this._id })

  next()
})

module.exports = mongoose.model('Products', ProductSchema)
