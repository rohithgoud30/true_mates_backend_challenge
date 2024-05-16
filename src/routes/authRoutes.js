const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  verifyUser,
} = require('../controllers/authController')

// POST /auth/register - Route for user registration
router.post('/register', registerUser)

// POST /auth/login - Route for user login
router.post('/login', loginUser)

// POST /auth/verify - Route to verify user existence
router.post('/verify', verifyUser)

module.exports = router
