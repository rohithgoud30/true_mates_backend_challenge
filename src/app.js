// Load environment variables
require('dotenv').config()

// Import required modules
const express = require('express')
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const friendsRoutes = require('./routes/friendsRoutes')
const sequelize = require('./config/database')
const cors = require('cors')

// Create an Express application
const app = express()

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Middleware for enabling CORS
app.use(cors())

// Routes
app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/friends', friendsRoutes)

// Database synchronization and server start
sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized successfully')
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error)
    process.exit(1) // Exit with error status code
  })

// Export the Express application
module.exports = app
