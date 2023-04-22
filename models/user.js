const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const validator = require('validator')

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'pls provide the user Name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'pls provide the user Email'],
    validate: {
      validator: validator.isEmail,
      message: 'Pls provide the valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'pls provide the user password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcryptjs.compare(candidatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
