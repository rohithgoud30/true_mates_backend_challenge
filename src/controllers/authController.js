const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

// Function to register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    await User.create({ name, email, password: hashedPassword })

    // Return success response with JWT token
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    console.error('Error registering user:', error)
    res
      .status(500)
      .json({ message: 'Unable to register user. Please try again later.' })
  }
}

// Function to authenticate and login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user with the provided email exists
    const existingUser = await User.findOne({ where: { email } })
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found' })
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, existingUser.password)
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Set token expiration time as needed
    )

    // Return success response with JWT token
    res.status(200).json({ message: 'Login successful', token })
  } catch (error) {
    console.error('Error logging in user:', error)
    res
      .status(500)
      .json({ message: 'Unable to login. Please try again later.' })
  }
}

// Function to verify if a user exists based on email
const verifyUser = async (req, res) => {
  const { email, token } = req.body

  try {
    // Decode JWT token to extract user ID
    const { id } = jwt.verify(token, process.env.JWT_SECRET)

    // Find user in the database based on email
    const user = await User.findOne({ where: { email } })

    if (user) {
      // Check if the user ID from JWT matches the user found in the database
      if (user.id === id) {
        res.status(200).json({ message: 'User exists' })
      } else {
        res
          .status(403)
          .json({ message: 'User ID in token does not match the user' })
      }
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Error verifying user:', error)
    res
      .status(500)
      .json({ message: 'Unable to verify user. Please try again later.' })
  }
}

module.exports = { registerUser, loginUser, verifyUser }
