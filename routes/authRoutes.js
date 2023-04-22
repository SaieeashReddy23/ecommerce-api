const express = require('express')
const authRouter = express.Router()

const { register, login, logout } = require('../controllers/authController')

authRouter.get('/logout', logout)
authRouter.post('/login', login)
authRouter.post('/register', register)

module.exports = authRouter
