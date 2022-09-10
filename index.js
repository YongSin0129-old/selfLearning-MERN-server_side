const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const authRoute = require('./routes').auth
const courseRoute = require('./routes').course
const passport = require('passport')
require('./config/passport')(passport)
const cors = require('cors')

const corsObj = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connect to Mongo Altas')
  })
  .catch(e => {
    console.log(e)
  })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsObj))
app.use('/api/user', authRoute)
app.use(
  '/api/courses',
  passport.authenticate('jwt', { session: false }),
  courseRoute
)

app.listen(8080, () => {
  console.log('Server running on port 8080.')
})
