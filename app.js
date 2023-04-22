require('dotenv').config()
const express = require('express')
const connectDB = require('./db/connect')
const fileUpload = require('express-fileupload')

const helmet = require('helmet')
const rateLimiter = require('express-rate-limit')
const XSSClean = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

//  THIS is used for logging messages
const morgon = require('morgan')

// this is used to validate the input like email etc
const validator = require('validator')

// Cookie parse
const cookieParse = require('cookie-parser')

// this middleware is used to handle async errors , that is it will throw error if anything thing bad happens instead of us writing try catch block every where.
require('express-async-errors')

// Routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoute')
const productRouter = require('./routes/productRoute')
const reviewRouter = require('./routes/reviewRoute')
const orderRouter = require('./routes/orderRouter')

// importing middlewares
const notFoundMiddleWare = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

const app = express()

const PORT = process.env.PORT || 3000

// Adding middleWares

app.set('trust proxy', 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 60,
    max: 60,
  })
)
app.use(helmet())
app.use(XSSClean())
app.use(mongoSanitize())
app.use(cors())

app.use(express.json())
app.use(express.static('./public'))
app.use(
  fileUpload({
    useTempFiles: true,
  })
)
app.use(cookieParse())
app.use(morgon('tiny'))

// app.get('/', (req, resp) => {
//   console.log(req.cookies)
//   resp.send('<h1>Ecommerce Api</h1>')
// })

app.use('/api/v1/auth', authRouter)

app.use('/api/v1/users', userRouter)

app.use('/api/v1/products', productRouter)

app.use('/api/v1/reviews', reviewRouter)

app.use('/api/v1/orders', orderRouter)

//  the below middle ware is added to handle routes which are not available
app.use(notFoundMiddleWare)

// the below middleware added to handle errors that occur while processing request
app.use(errorHandlerMiddleware)

const start = async () => {
  try {
    // Connect db
    await connectDB(process.env.MONGODB_URL)
    app.listen(PORT, () =>
      console.log(`Application is running successfully on port : ${PORT} `)
    )
  } catch (error) {}
}

start()
