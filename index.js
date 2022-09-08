const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()

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

app.listen(8080, () => {
  console.log('Server running on port 8080.')
})
